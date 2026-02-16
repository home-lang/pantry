#!/usr/bin/env bun

/**
 * Build All Packages — Batch builder for pantry packages
 *
 * Discovers all packages from pantry YAML files, builds them using buildkit,
 * and uploads to S3. Supports batching for CI parallelization.
 *
 * Usage:
 *   bun scripts/build-all-packages.ts -b <bucket> [options]
 *
 * Options:
 *   -b, --bucket <name>      S3 bucket (required)
 *   -r, --region <region>    AWS region (default: us-east-1)
 *   --batch <N>              Batch index (0-based)
 *   --batch-size <N>         Packages per batch (default: 50)
 *   --platform <platform>    Override platform detection
 *   -p, --package <domains>  Comma-separated specific packages to build
 *   -f, --force              Re-upload even if exists in S3
 *   --count-only             Just print total buildable package count and exit
 *   --list                   List all buildable packages
 *   --dry-run                Show what would be built
 *   -h, --help               Show help
 */

import { existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { createHash } from 'node:crypto'
import { S3Client } from '@stacksjs/ts-cloud/aws'
import { uploadToS3 as uploadToS3Impl } from './upload-to-s3.ts'

// Import package metadata
const packagesPath = new URL('../src/packages/index.ts', import.meta.url).pathname
// eslint-disable-next-line ts/no-top-level-await
const { pantry } = await import(packagesPath)

// Simple YAML parser (reused from build-package.ts)
function parseYaml(content: string): Record<string, any> {
  const result: Record<string, any> = {}
  const lines = content.split('\n')
  const stack: { indent: number; obj: any }[] = [{ indent: -1, obj: result }]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue

    const indent = line.search(/\S/)
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop()
    }

    const currentObj = stack[stack.length - 1].obj

    if (trimmed.startsWith('- ')) {
      const value = trimmed.slice(2).trim()
      if (Array.isArray(currentObj)) {
        if (value.startsWith('run:')) {
          const runValue = value.slice(4).trim()
          const itemObj: Record<string, any> = {}
          if (runValue === '|' || runValue === '') {
            const blockLines: string[] = []
            let j = i + 1
            const blockIndent = indent + 2
            while (j < lines.length) {
              const blockLine = lines[j]
              const blockLineIndent = blockLine.search(/\S/)
              if (blockLine.trim() === '' || blockLineIndent >= blockIndent) {
                blockLines.push(blockLine.slice(blockIndent) || '')
                j++
              } else break
            }
            itemObj.run = blockLines.join('\n').trim()
            i = j - 1
          } else {
            itemObj.run = runValue
          }
          // Check for sibling keys (working-directory:, if:, prop:) at indent+2
          const siblingIndent = indent + 2
          while (i + 1 < lines.length) {
            const nextLine = lines[i + 1]
            const nextTrimmed = nextLine.trim()
            if (!nextTrimmed || nextTrimmed.startsWith('#')) { i++; continue }
            const nextIndent = nextLine.search(/\S/)
            if (nextIndent === siblingIndent && !nextTrimmed.startsWith('- ') && nextTrimmed.includes(':')) {
              const ci = nextTrimmed.indexOf(':')
              const sibKey = nextTrimmed.slice(0, ci).trim()
              let sibVal: any = nextTrimmed.slice(ci + 1).trim()
              if (sibVal.startsWith("'") && sibVal.endsWith("'")) sibVal = sibVal.slice(1, -1)
              if (sibVal.startsWith('"') && sibVal.endsWith('"')) sibVal = sibVal.slice(1, -1)
              itemObj[sibKey] = sibVal
              i++
            } else {
              break
            }
          }
          currentObj.push(itemObj)
        } else {
          currentObj.push(value)
        }
      }
      continue
    }

    const colonIndex = trimmed.indexOf(':')
    if (colonIndex === -1) continue

    const key = trimmed.slice(0, colonIndex).trim()
    let value: any = trimmed.slice(colonIndex + 1).trim()

    if (value === '' || value === '|') {
      if (value === '|') {
        const blockLines: string[] = []
        let j = i + 1
        const blockIndent = indent + 2
        while (j < lines.length) {
          const blockLine = lines[j]
          const blockLineIndent = blockLine.search(/\S/)
          if (blockLine.trim() === '' || (blockLineIndent >= 0 && blockLineIndent >= blockIndent)) {
            blockLines.push(blockLine.slice(Math.min(blockIndent, blockLine.length)) || '')
            j++
          } else break
        }
        currentObj[key] = blockLines.join('\n').trim()
        i = j - 1
      } else {
        let j = i + 1
        while (j < lines.length && (lines[j].trim() === '' || lines[j].trim().startsWith('#'))) j++
        const nextLine = j < lines.length ? lines[j].trim() : ''
        const nextLineIndent = j < lines.length ? lines[j].search(/\S/) : 0

        if (nextLine.startsWith('- ')) {
          currentObj[key] = []
          stack.push({ indent, obj: currentObj[key] })
        } else if (nextLine.includes(':') && nextLineIndent > indent) {
          currentObj[key] = {}
          stack.push({ indent, obj: currentObj[key] })
        } else if (nextLineIndent > indent && nextLine) {
          const blockLines: string[] = []
          const blockIndent = nextLineIndent
          while (j < lines.length) {
            const blockLine = lines[j]
            const blockLineIndent = blockLine.search(/\S/)
            if (blockLine.trim() === '' || (blockLineIndent >= 0 && blockLineIndent >= blockIndent)) {
              blockLines.push(blockLine.trim())
              j++
            } else break
          }
          currentObj[key] = blockLines.filter(l => l && !l.startsWith('#')).join('\n')
          i = j - 1
        } else {
          currentObj[key] = {}
          stack.push({ indent, obj: currentObj[key] })
        }
      }
    } else if (value.startsWith("'") && value.endsWith("'")) {
      currentObj[key] = value.slice(1, -1)
    } else if (value.startsWith('"') && value.endsWith('"')) {
      currentObj[key] = value.slice(1, -1)
    } else if (value === 'true') {
      currentObj[key] = true
    } else if (value === 'false') {
      currentObj[key] = false
    } else if (/^\d+$/.test(value)) {
      currentObj[key] = parseInt(value, 10)
    } else {
      currentObj[key] = value
    }
  }

  return result
}

// --- Package Discovery ---

interface BuildablePackage {
  domain: string
  name: string
  latestVersion: string
  versions: string[] // All available versions for fallback
  pantryYamlPath: string
  hasDistributable: boolean
  hasBuildScript: boolean
  needsProps: boolean
  hasProps: boolean
  depDomains: string[] // Domains this package depends on (for ordering)
}

function domainToKey(domain: string): string {
  return domain.replace(/[.\-/]/g, '').toLowerCase()
}

function detectPlatform(): { platform: string; os: string; arch: string } {
  const os = process.platform === 'darwin' ? 'darwin' : 'linux'
  const arch = process.arch === 'arm64' ? 'arm64' : 'x86-64'
  return { platform: `${os}-${arch}`, os, arch }
}

/**
 * Discover all buildable packages from pantry YAML files
 */
function discoverPackages(targetPlatform?: string): BuildablePackage[] {
  const pantryDir = join(process.cwd(), 'src', 'pantry')
  const packages: BuildablePackage[] = []
  // Parse target platform for filtering
  const [targetOs, targetArch] = targetPlatform ? targetPlatform.split('-') : ['', '']
  const targetOsName = targetOs === 'darwin' ? 'darwin' : targetOs === 'linux' ? 'linux' : ''
  const targetArchName = targetArch === 'arm64' ? 'aarch64' : targetArch === 'x86-64' ? 'x86-64' : targetArch === 'x86_64' ? 'x86-64' : ''

  // Recursively find all package.yml files
  function findYamls(dir: string, prefix: string = ''): void {
    if (!existsSync(dir)) return
    const entries = readdirSync(dir, { withFileTypes: true })

    for (const entry of entries) {
      if (entry.isDirectory()) {
        findYamls(join(dir, entry.name), prefix ? `${prefix}/${entry.name}` : entry.name)
      } else if (entry.name === 'package.yml') {
        const domain = prefix
        if (!domain) continue

        const yamlPath = join(dir, entry.name)
        try {
          const content = readFileSync(yamlPath, 'utf-8')
          const recipe = parseYaml(content)

          // Check platform compatibility
          if (targetOsName && recipe.platforms) {
            const platforms = Array.isArray(recipe.platforms) ? recipe.platforms : [String(recipe.platforms)]
            const isCompatible = platforms.some((p: string) => {
              const ps = String(p).trim()
              if (ps === targetOsName) return true
              if (ps === `${targetOsName}/${targetArchName}`) return true
              return false
            })
            if (!isCompatible) {
              return // Skip: platform not supported
            }
          }

          const hasDistributable = !!(recipe.distributable?.url)
          const hasBuildScript = !!(recipe.build?.script) || Array.isArray(recipe.build)

          // Check if build script references props/
          const needsProps = content.includes('props/')
          const hasPropsDir = existsSync(join(dir, 'props'))

          // Look up version from package metadata
          const key = domainToKey(domain)
          const pkg = (pantry as Record<string, any>)[key]

          if (!pkg || !pkg.versions || pkg.versions.length === 0) {
            // No version data available, skip
            return
          }

          if (!hasDistributable) {
            // No source to download, skip
            return
          }

          // Extract dependency domains for ordering (from both TS metadata and YAML)
          const depDomains: string[] = []
          const allDeps = [...(pkg.dependencies || []), ...(pkg.buildDependencies || [])]
          for (const dep of allDeps) {
            const depDomain = dep.replace(/@.*$/, '').replace(/\^.*$/, '').replace(/>=.*$/, '').replace(/:.*$/, '').trim()
            if (depDomain) depDomains.push(depDomain)
          }
          // Also extract YAML build deps for ordering
          const yamlBuildDeps = recipe.build?.dependencies
          if (yamlBuildDeps && typeof yamlBuildDeps === 'object') {
            for (const key of Object.keys(yamlBuildDeps)) {
              if (key.includes('.') || key.includes('/')) depDomains.push(key)
              // Handle platform-specific nested deps
              if (/^(darwin|linux)/.test(key) && typeof yamlBuildDeps[key] === 'object') {
                for (const subKey of Object.keys(yamlBuildDeps[key])) {
                  if (subKey.includes('.') || subKey.includes('/')) depDomains.push(subKey)
                }
              }
            }
          }

          packages.push({
            domain,
            name: pkg.name || domain,
            latestVersion: pkg.versions[0],
            versions: pkg.versions,
            pantryYamlPath: yamlPath,
            hasDistributable,
            hasBuildScript,
            needsProps,
            hasProps: hasPropsDir,
            depDomains,
          })
        } catch {
          // Skip packages with parse errors
        }
      }
    }
  }

  findYamls(pantryDir)

  // Topological sort: packages with fewer deps come first
  // This ensures dependency packages are built before their dependents
  const domainSet = new Set(packages.map(p => p.domain))

  // Count how many buildable deps each package has
  function countBuildableDeps(pkg: BuildablePackage): number {
    return pkg.depDomains.filter(d => domainSet.has(d)).length
  }

  // Sort by dependency depth (packages with 0 buildable deps first),
  // then alphabetically for deterministic ordering within same depth
  packages.sort((a, b) => {
    const depCountA = countBuildableDeps(a)
    const depCountB = countBuildableDeps(b)
    if (depCountA !== depCountB) return depCountA - depCountB
    return a.domain.localeCompare(b.domain)
  })

  return packages
}

// --- S3 Helpers ---

async function checkExistsInS3(domain: string, version: string, platform: string, bucket: string, region: string): Promise<boolean> {
  try {
    const s3 = new S3Client(region)
    const metadataKey = `binaries/${domain}/metadata.json`
    const metadata = await s3.getObject(bucket, metadataKey)
    const parsed = JSON.parse(metadata)
    return !!(parsed.versions?.[version]?.platforms?.[platform])
  } catch {
    return false
  }
}

// --- Build & Upload ---

function tryBuildVersion(
  domain: string,
  version: string,
  platform: string,
  buildDir: string,
  installDir: string,
  depsDir: string,
  bucket: string,
  region: string,
): void {
  // Cleanup from previous attempt
  try { execSync(`rm -rf "${buildDir}"`, { stdio: 'pipe' }) } catch {}
  try { execSync(`rm -rf "${installDir}"`, { stdio: 'pipe' }) } catch {}
  mkdirSync(buildDir, { recursive: true })
  mkdirSync(installDir, { recursive: true })

  const args = [
    'scripts/build-package.ts',
    '--package', domain,
    '--version', version,
    '--platform', platform,
    '--build-dir', buildDir,
    '--prefix', installDir,
    '--deps-dir', depsDir,
    '--bucket', bucket,
    '--region', region,
  ]

  execSync(`bun ${args.join(' ')}`, {
    cwd: join(process.cwd()),
    env: { ...process.env },
    stdio: 'inherit',
    timeout: 30 * 60 * 1000, // 30 min per package
  })
}

async function buildAndUpload(
  pkg: BuildablePackage,
  bucket: string,
  region: string,
  platform: string,
  force: boolean,
): Promise<{ status: 'skipped' | 'uploaded' | 'failed'; error?: string }> {
  const { domain, name, versions } = pkg
  let version = pkg.latestVersion

  console.log(`\n${'─'.repeat(60)}`)
  console.log(`📦 ${name} (${domain}) v${version}`)
  console.log(`${'─'.repeat(60)}`)

  // Skip sentinel/placeholder versions
  if (version === '999.999.999' || version === '0.0.0') {
    // Try to find a real version
    const realVersions = versions.filter(v => v !== '999.999.999' && v !== '0.0.0')
    if (realVersions.length > 0) {
      version = realVersions[0]
      console.log(`   ⚠️  Skipped sentinel version, using ${version}`)
    } else {
      console.log(`   ⚠️  Only sentinel versions available, skipping`)
      return { status: 'skipped' }
    }
  }

  // Check if already in S3 (check latest real version first, then try others)
  if (!force) {
    const exists = await checkExistsInS3(domain, version, platform, bucket, region)
    if (exists) {
      console.log(`   ✓ Already in S3 for ${platform}, skipping`)
      return { status: 'skipped' }
    }
  }

  const buildDir = `/tmp/buildkit-${domain.replace(/\//g, '-')}`
  const installDir = `/tmp/buildkit-install-${domain.replace(/\//g, '-')}`
  const artifactsDir = `/tmp/buildkit-artifacts`
  const depsDir = `/tmp/buildkit-deps`

  mkdirSync(artifactsDir, { recursive: true })
  mkdirSync(depsDir, { recursive: true })

  // Build version candidates: try latest first, then fallback to previous versions
  const versionCandidates = [version]
  if (versions && versions.length > 1) {
    // Add up to 3 previous versions as fallbacks
    for (const v of versions) {
      if (v !== version && v !== '999.999.999' && v !== '0.0.0' && versionCandidates.length < 4) {
        versionCandidates.push(v)
      }
    }
  }

  let lastError: Error | null = null
  let usedVersion = version

  for (const candidateVersion of versionCandidates) {
    try {
      if (candidateVersion !== version) {
        // Check if this fallback version already in S3
        if (!force) {
          const exists = await checkExistsInS3(domain, candidateVersion, platform, bucket, region)
          if (exists) {
            console.log(`   ✓ Fallback version ${candidateVersion} already in S3, skipping`)
            return { status: 'skipped' }
          }
        }
        console.log(`   ⚠️  Trying fallback version ${candidateVersion}...`)
      }

      console.log(`   Building ${domain}@${candidateVersion} for ${platform}...`)

      tryBuildVersion(domain, candidateVersion, platform, buildDir, installDir, depsDir, bucket, region)

      usedVersion = candidateVersion
      lastError = null
      break // Build succeeded
    } catch (error: any) {
      lastError = error
      const errMsg = error.message || ''

      // Only try fallback versions if the error is a source download failure
      // Exit code 42 from build-package.ts = download failure (curl 404, git clone fail, etc.)
      const isDownloadError = error.status === 42 ||
        errMsg.includes('DOWNLOAD_FAILED') ||
        errMsg.includes('curl') ||
        errMsg.includes('404') ||
        errMsg.includes('The requested URL returned error')
      if (!isDownloadError) {
        // Not a download error — don't try other versions, this is a build error
        break
      }

      console.log(`   ⚠️  Version ${candidateVersion} source not available (exit code: ${error.status})`)
    }
  }

  if (lastError) {
    console.error(`   ❌ Failed: ${lastError.message}`)
    try { execSync(`rm -rf "${buildDir}"`, { stdio: 'pipe' }) } catch {}
    try { execSync(`rm -rf "${installDir}"`, { stdio: 'pipe' }) } catch {}
    return { status: 'failed', error: lastError.message }
  }

  try {
    // Create tarball
    console.log(`   Packaging...`)
    const artifactDir = join(artifactsDir, `${domain}-${usedVersion}-${platform}`)
    mkdirSync(artifactDir, { recursive: true })

    const tarball = `${domain.replace(/\//g, '-')}-${usedVersion}.tar.gz`
    execSync(`cd "${installDir}" && tar -czf "${join(artifactDir, tarball)}" .`)
    execSync(`cd "${artifactDir}" && shasum -a 256 "${tarball}" > "${tarball}.sha256"`)

    // Upload to S3
    console.log(`   Uploading to S3...`)
    await uploadToS3Impl({
      package: domain,
      version: usedVersion,
      artifactsDir,
      bucket,
      region,
    })

    // Cleanup
    try { execSync(`rm -rf "${buildDir}"`, { stdio: 'pipe' }) } catch {}
    try { execSync(`rm -rf "${installDir}"`, { stdio: 'pipe' }) } catch {}
    try { execSync(`rm -rf "${artifactDir}"`, { stdio: 'pipe' }) } catch {}

    console.log(`   ✅ Uploaded ${domain}@${usedVersion}`)
    return { status: 'uploaded' }
  } catch (error: any) {
    console.error(`   ❌ Failed packaging/upload: ${error.message}`)
    try { execSync(`rm -rf "${buildDir}"`, { stdio: 'pipe' }) } catch {}
    try { execSync(`rm -rf "${installDir}"`, { stdio: 'pipe' }) } catch {}
    return { status: 'failed', error: error.message }
  }
}

// --- Main ---

async function main() {
  const { values } = parseArgs({
    options: {
      bucket: { type: 'string', short: 'b' },
      region: { type: 'string', short: 'r', default: 'us-east-1' },
      batch: { type: 'string' },
      'batch-size': { type: 'string', default: '50' },
      platform: { type: 'string' },
      package: { type: 'string', short: 'p' },
      force: { type: 'boolean', short: 'f', default: false },
      'count-only': { type: 'boolean', default: false },
      list: { type: 'boolean', short: 'l', default: false },
      'dry-run': { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h' },
    },
    strict: true,
  })

  if (values.help) {
    console.log(`
Build All Packages — Batch builder for pantry packages

Discovers all packages with distributable URLs in pantry YAML,
builds them from source, and uploads to S3.

Usage:
  bun scripts/build-all-packages.ts -b <bucket> [options]

Options:
  -b, --bucket <name>      S3 bucket (required)
  -r, --region <region>    AWS region (default: us-east-1)
  --batch <N>              Batch index (0-based)
  --batch-size <N>         Packages per batch (default: 50)
  --platform <platform>    Override platform (e.g., darwin-arm64)
  -p, --package <domains>  Comma-separated specific packages
  -f, --force              Re-upload even if exists
  --count-only             Print total buildable count and exit
  -l, --list               List all buildable packages
  --dry-run                Show what would be built
  -h, --help               Show help
`)
    process.exit(0)
  }

  // Discover all buildable packages (pass platform for filtering)
  const { platform: detectedPlatformForDiscovery } = detectPlatform()
  const discoveryPlatform = values.platform || detectedPlatformForDiscovery
  console.log(`Discovering buildable packages for ${discoveryPlatform}...`)
  let allPackages = discoverPackages(discoveryPlatform)

  // Filter to packages with build scripts (compilable from source)
  // Skip packages that are handled by sync-packages.ts (pre-built binaries)
  const preBuiltDomains = new Set([
    'bun.sh', 'nodejs.org', 'meilisearch.com', 'redis.io',
    'postgresql.org', 'mysql.com', 'getcomposer.org', 'pnpm.io',
    'yarnpkg.com', 'go.dev', 'deno.land', 'python.org',
  ])

  allPackages = allPackages.filter(p => !preBuiltDomains.has(p.domain))

  // Filter to packages that actually have build scripts (skip metadata-only packages)
  // Skip this filter for targeted builds (-p) since the parser may miss some build scripts
  const withoutScript = values.package ? [] : allPackages.filter(p => !p.hasBuildScript)
  if (!values.package) {
    allPackages = allPackages.filter(p => p.hasBuildScript)
  }

  // Platform-aware filtering: skip packages that can't build on this platform
  const { platform: detectedPlatformEarly } = detectPlatform()
  const targetPlatform = values.platform || detectedPlatformEarly
  const targetOs = targetPlatform.split('-')[0]

  // Packages that are platform-specific (skip on wrong platform)
  const linuxOnlyDomains = new Set([
    'alsa-project.org/alsa-lib', 'alsa-project.org/alsa-plugins', 'alsa-project.org/alsa-utils',
    'elfutils.org', 'freedesktop.org/libbsd', 'kernel.org/linux-headers',
    'musl.libc.org', 'pagure.io/libaio', 'strace.io', 'systemd.io',
    'spawn.link', 'postgrest.org', 'gitlab.com/procps-ng/procps',
    'apptainer.org', // Linux container runtime
    'apple.com/remote_cmds', // ironically Linux-buildable only in certain configs
  ])
  const darwinOnlyDomains = new Set([
    'apple.com/container', 'tuist.io/xcbeautify', 'veracode.com/gen-ir',
    'github.com/mas-cli/mas', 'github.com/XcodesOrg/xcodes',
    'github.com/nicklockwood/SwiftFormat', 'github.com/peripheryapp/periphery',
    'github.com/unsignedapps/swift-create-xcframework',
    'github.com/XCTestHTMLReport/XCTestHTMLReport', 'github.com/yonaskolb/Mint',
    'github.com/mxcl/swift-sh', 'github.com/kiliankoe/swift-outdated',
    'github.com/a7ex/xcresultparser', 'github.com/create-dmg/create-dmg',
    'portaudio.com',
  ])

  // Packages needing specialized toolchains not available in CI
  const haskellPackages = new Set([
    'dhall-lang.org', 'pandoc.org', 'pandoc.org/crossref',
    'shellcheck.net', 'haskell.org', 'haskell.org/cabal',
  ])
  const specializedToolchainPackages = new Set([
    ...haskellPackages, // Need GHC/cabal
    'nim-lang.org', // Need Nim compiler
    'crystal-lang.org', // Need Crystal compiler
    'crystal-lang.org/shards', // Depends on crystal
    'dart.dev', // Need Dart SDK
    'vlang.io', // Need V compiler
    'rebar3.org', // Need Erlang runtime
  ])

  // Packages with known broken recipes or that fundamentally can't build in standard CI
  // Keep this list MINIMAL — fix issues rather than skip packages
  const knownBrokenDomains = new Set([
    'apache.org/subversion', // Needs APR/APR-util chain
    'apache.org/serf', // Needs scons + apr
    'apache.org/zookeeper', // Java/Maven build
    'apache.org/jmeter', // Java plugin manager
    'apache.org/httpd', // Complex dep chain
    'argoproj.github.io/cd', // yarn + Go mixed build
    'coder.com/code-server', // Node.js native build
    'cr.yp.to/daemontools', // Archaic build system
    'clisp.org', // Complex configure/FFI
    'chiark.greenend.org.uk/puzzles', // Needs GTK
    'gnu.org/source-highlight', // Needs boost.org built from source
    'crates.io/bpb', // Uses deprecated Rust features (E0557), incompatible with modern rustc
    'info-zip.org/unzip', // SourceForge URL with spaces/parens, unmaintained since 2009
    'nasm.us', // Version normalization drops leading zeros (2.16.03→2.16.3), breaking download URLs
    'strace.io', // Needs newer version (6.8+) for modern kernel headers, current 6.2 fails
    'microbrew.org/md5sha1sum', // Needs OpenSSL lib path configured, hard to do generically in CI
    'apple.com/container', // Needs Swift 6.2+, runners only have 5.10
    'openai.com/codex', // Needs Rust 1.89+, may not be available on runners
    'gnu.org/plotutils', // Compile errors with modern compilers (unmaintained since 2009)
    'ghostgum.com.au/epstool', // Debian mirror URL broken + needs ghostscript dep chain
    // mcmc-jags.sourceforge.io — LAPACK+gfortran now in CI
    // itstool.org — python3-libxml2 now in CI
    'practical-scheme.net/gauche', // Version tag format mismatch (release0_9_x vs v0.9.x)
    'openinterpreter.com', // tiktoken wheel build failure (Python C extension)
    'psycopg.org/psycopg3', // Version mismatch with PyPI (wants dev version)
    'sourceware.org/dm', // GitLab download URLs return 404
    'oracle.com/berkeley-db', // Thread-local storage error with STL on modern macOS
    'pixman.org', // Compilation errors on darwin with modern clang
    'gnu.org/plotutils', // Compilation errors on linux with modern gcc
    'llm.datasette.io', // GitHub tag v0.28.0 no longer exists (renamed/moved)
    'taku910.github.io/mecab-ipadic', // Needs mecab built first (complex dep chain)
  ])

  let platformSkipped = 0
  let toolchainSkipped = 0
  let propsSkipped = 0
  let knownBrokenSkipped = 0

  // When -p is specified, only skip platform-incompatible packages (can't build linux on darwin)
  // All other filters (knownBroken, toolchain, props) are bypassed for targeted builds
  const isTargetedBuild = !!values.package

  allPackages = allPackages.filter(p => {
    // Platform filtering (always applies — can't cross-compile)
    if (targetOs === 'darwin' && linuxOnlyDomains.has(p.domain)) {
      platformSkipped++
      return false
    }
    if (targetOs === 'linux' && darwinOnlyDomains.has(p.domain)) {
      platformSkipped++
      return false
    }
    // Skip remaining filters for targeted builds
    if (isTargetedBuild) return true
    // Toolchain filtering
    if (specializedToolchainPackages.has(p.domain)) {
      toolchainSkipped++
      return false
    }
    // Known broken recipes
    if (knownBrokenDomains.has(p.domain)) {
      knownBrokenSkipped++
      return false
    }
    // Missing props filtering (props/ referenced but directory doesn't exist)
    if (p.needsProps && !p.hasProps) {
      propsSkipped++
      return false
    }
    return true
  })

  console.log(`Found ${allPackages.length} buildable packages (excluding ${preBuiltDomains.size} pre-built, ${withoutScript.length} without build scripts, ${platformSkipped} wrong platform, ${toolchainSkipped} missing toolchain, ${knownBrokenSkipped} known broken, ${propsSkipped} missing props)`)

  if (values['count-only']) {
    console.log(allPackages.length)
    process.exit(0)
  }

  if (values.list) {
    console.log('\nBuildable packages:')
    for (const pkg of allPackages) {
      console.log(`  ${pkg.domain} (${pkg.name}) v${pkg.latestVersion} ${pkg.hasBuildScript ? '[has build script]' : '[no build script]'}`)
    }
    console.log(`\nTotal: ${allPackages.length}`)
    process.exit(0)
  }

  if (!values.bucket) {
    console.error('Error: --bucket is required')
    process.exit(1)
  }

  const bucket = values.bucket
  const region = values.region || 'us-east-1'
  const { platform: detectedPlatform } = detectPlatform()
  const platform = values.platform || detectedPlatform
  const batchSize = parseInt(values['batch-size'] || '50', 10)
  const force = values.force || false

  // Filter by specific packages if provided
  if (values.package) {
    const domains = values.package.split(',').map(d => d.trim())
    allPackages = allPackages.filter(p =>
      domains.some(d => p.domain === d || p.domain.includes(d) || p.name === d)
    )
  }

  // Apply batch slicing
  let packagesToBuild = allPackages
  if (values.batch !== undefined) {
    const batchIndex = parseInt(values.batch, 10)
    const start = batchIndex * batchSize
    const end = start + batchSize
    packagesToBuild = allPackages.slice(start, end)
    console.log(`Batch ${batchIndex}: packages ${start}-${Math.min(end, allPackages.length) - 1} of ${allPackages.length}`)
  }

  if (packagesToBuild.length === 0) {
    console.log('No packages to build in this batch')
    process.exit(0)
  }

  console.log(`\n🚀 Building ${packagesToBuild.length} packages for ${platform}`)
  console.log(`   Bucket: ${bucket}`)
  console.log(`   Region: ${region}`)
  console.log(`   Force: ${force}`)

  if (values['dry-run']) {
    console.log('\n[DRY RUN] Would build:')
    for (const pkg of packagesToBuild) {
      const exists = await checkExistsInS3(pkg.domain, pkg.latestVersion, platform, bucket, region)
      console.log(`  - ${pkg.domain}@${pkg.latestVersion} ${exists ? '(already in S3)' : '(would build)'}`)
    }
    process.exit(0)
  }

  // Build each package
  const results: Record<string, { status: string; version: string; error?: string }> = {}

  for (const pkg of packagesToBuild) {
    const result = await buildAndUpload(pkg, bucket, region, platform, force)
    results[pkg.domain] = { ...result, version: pkg.latestVersion }
  }

  // Summary
  console.log('\n' + '═'.repeat(60))
  console.log('Build Summary')
  console.log('═'.repeat(60))

  const uploaded = Object.entries(results).filter(([_, r]) => r.status === 'uploaded')
  const skipped = Object.entries(results).filter(([_, r]) => r.status === 'skipped')
  const failed = Object.entries(results).filter(([_, r]) => r.status === 'failed')

  if (uploaded.length > 0) {
    console.log(`\nBuilt & Uploaded (${uploaded.length}):`)
    uploaded.forEach(([domain, r]) => console.log(`   - ${domain}@${r.version}`))
  }

  if (skipped.length > 0) {
    console.log(`\nSkipped — already in S3 (${skipped.length}):`)
    skipped.forEach(([domain, r]) => console.log(`   - ${domain}@${r.version}`))
  }

  if (failed.length > 0) {
    console.log(`\nFailed (${failed.length}):`)
    failed.forEach(([domain, r]) => console.log(`   - ${domain}@${r.version}: ${r.error}`))
  }

  const attempted = uploaded.length + failed.length
  console.log(`\nTotal: ${uploaded.length} uploaded, ${skipped.length} skipped, ${failed.length} failed`)

  // Report failure rate but don't fail CI — individual package build issues
  // are logged above; CI success means the batch ran to completion
  if (failed.length > 0) {
    const failRate = attempted > 0 ? (failed.length / attempted * 100).toFixed(0) : 0
    console.log(`\nFailure rate: ${failRate}% (${failed.length}/${attempted} attempted)`)
    console.log(`Note: Individual build failures are expected for packages with complex`)
    console.log(`dependencies or platform-specific requirements. Successfully built`)
    console.log(`packages have been uploaded to S3.`)
  }
}

main().catch((error) => {
  console.error('Build all packages failed:', error.message)
  process.exit(1)
})
