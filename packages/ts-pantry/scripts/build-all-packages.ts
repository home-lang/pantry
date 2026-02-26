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

import { appendFileSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
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
  const stack: Array<{
    indent: number
    obj: any
  }> = [{ indent: -1, obj: result }]

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
            if (!nextTrimmed || nextTrimmed.startsWith('#')) {
              i++
              continue
            }
            const nextIndent = nextLine.search(/\S/)
            if (nextIndent === siblingIndent && !nextTrimmed.startsWith('- ') && nextTrimmed.includes(':')) {
              const ci = nextTrimmed.indexOf(':')
              const sibKey = nextTrimmed.slice(0, ci).trim()
              let sibVal: any = nextTrimmed.slice(ci + 1).trim()
              if (sibVal.startsWith('\'') && sibVal.endsWith('\''))
                sibVal = sibVal.slice(1, -1)
              if (sibVal.startsWith('"') && sibVal.endsWith('"'))
                sibVal = sibVal.slice(1, -1)
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
    } else if (value.startsWith('\'') && value.endsWith('\'')) {
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

// Build a reverse lookup from domain → pantry key, since auto-generated keys
// use collision suffixes (e.g. xorgprotocol1 for x.org/protocol/xcb) that
// don't match domainToKey output (xorgprotocolxcb).
const _pantryDomainMap = new Map<string, string>()
for (const [key, val] of Object.entries(pantry as Record<string, any>)) {
  if (val && typeof val === 'object' && typeof val.domain === 'string') {
    _pantryDomainMap.set(val.domain, key)
  }
}

function lookupPantryPackage(domain: string): any {
  // Try direct key first (works for most packages)
  const directKey = domainToKey(domain)
  const direct = (pantry as Record<string, any>)[directKey]
  if (direct?.versions) return direct

  // Fall back to domain-based reverse lookup (handles collision-resolved keys)
  const mappedKey = _pantryDomainMap.get(domain)
  if (mappedKey) return (pantry as Record<string, any>)[mappedKey]

  return null
}

interface BuildPlatformInfo {
  platform: string
  os: string
  arch: string
}

function detectPlatform(): BuildPlatformInfo {
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
              continue // Skip: platform not supported (continue, not return, to allow child dirs)
            }
          }

          const hasDistributable = !!(recipe.distributable?.url)
          const hasBuildScript = !!(recipe.build?.script) || Array.isArray(recipe.build) || typeof recipe.build === 'string'

          // Check if build script references props/
          const needsProps = content.includes('props/')
          const hasPropsDir = existsSync(join(dir, 'props'))

          // Look up version from package metadata
          const pkg = lookupPantryPackage(domain)

          if (!pkg || !pkg.versions || pkg.versions.length === 0) {
            // No version data available, skip (continue to allow child dirs)
            continue
          }

          if (!hasDistributable) {
            // No source to download, skip (continue to allow child dirs)
            continue
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
              if (/^(?:darwin|linux)/.test(key) && typeof yamlBuildDeps[key] === 'object') {
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
    timeout: 60 * 60 * 1000, // 60 min per package (fbthrift/heavy C++ need >45 min)
  })
}

interface BuildResult {
  status: 'skipped' | 'uploaded' | 'failed'
  error?: string
}

async function buildAndUpload(
  pkg: BuildablePackage,
  bucket: string,
  region: string,
  platform: string,
  force: boolean,
): Promise<BuildResult> {
  const { domain, name, versions } = pkg
  let version = pkg.latestVersion

  const pkgStartTime = Date.now()
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
    const elapsed = Math.round((Date.now() - pkgStartTime) / 1000)
    console.error(`   ❌ Failed (${elapsed}s): ${lastError.message}`)
    try { execSync(`rm -rf "${buildDir}"`, { stdio: 'pipe' }) } catch {}
    try { execSync(`rm -rf "${installDir}"`, { stdio: 'pipe' }) } catch {}
    return { status: 'failed', error: lastError.message }
  }

  try {
    // Create tarball
    console.log(`   Packaging...`)
    const artifactDir = join(artifactsDir, `${domain.replace(/\//g, '-')}-${usedVersion}-${platform}`)
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

    const elapsed = Math.round((Date.now() - pkgStartTime) / 1000)
    console.log(`   ✅ Uploaded ${domain}@${usedVersion} (${elapsed}s)`)
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
    'nixos.org/patchelf', // ELF binary patcher, Linux-only
    'spawn.link', 'postgrest.org', 'gitlab.com/procps-ng/procps',
    'apptainer.org', // Linux container runtime
    'apple.com/remote_cmds', // ironically Linux-buildable only in certain configs
    'freedesktop.org/slirp', // Linux-only networking library (needs Linux headers)
    'freedesktop.org/desktop-file-utils', // Linux desktop integration (glib dep chain fails on darwin)
    'freedesktop.org/icon-theme', // freedesktop icon theme, meson build fails on darwin
    'freedesktop.org/vdpau', // Video decode API, Linux-only (no VA-API on macOS)
    // gstreamer.freedesktop.org/orc — fixed: fallback to python3 -m mesonbuild on darwin
    'gnome.org/glib-networking', // GNOME networking, glib dep chain fails on darwin
    'pagure.io/xmlto', // xmlto uses BSD getopt on macOS which lacks long options support
    'freedesktop.org/dbus', // gio-unix-2.0 pkg-config chain fails on darwin (S3 pkg-config vs Homebrew glib)
    'swagger.io/swagger-codegen', // Maven/Java build, install -D flag incompatible with macOS
    // gnu.org/texinfo — fixed: rewrote perl shebang fix as robust for-loop
    // gnu.org/bc — fixed: MAKEINFO=true on darwin skips info pages
    // laravel.com — fixed: symlink ICU libs from unicode.org into PHP lib dir on darwin
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
    'gnupg.org/libgcrypt', // Linux system libgpg-error too old (needs >= 1.56), builds fine on darwin
    'microsoft.com/code-cli', // OpenSSL linking issues on Linux, builds fine on darwin
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
  // Packages removed after fixes:
  //   pixman.org — -Werror filtering now handles clang warnings
  //   gnu.org/plotutils — -Werror filtering + recipe sed fixes handle modern compilers
  //   microbrew.org/md5sha1sum — buildkit now auto-configures OpenSSL paths
  //   oracle.com/berkeley-db — recipe fixed: removed --enable-stl, added -std=c++14
  //   strace.io — linux-only, let it try with -Werror filtering
  //   abseil.io, vim.org, facebook.com/*, pwmt.org/*, khronos.org/opencl-headers,
  //     macvim.org, github.com/facebookincubator/fizz — GitHub tag resolution now
  //     handles leading-zero normalization via API lookup (resolveGitHubTag)
  const knownBrokenDomains = new Set([
    'apache.org/subversion', // Needs APR/APR-util chain (circular dep with serf)
    'apache.org/serf', // Needs scons + apr (circular dep)
    'argoproj.github.io/cd', // yarn + Go mixed build, yarn fails in CI sandbox
    'argoproj.github.io/workflows', // Massive Go compilation (>60 min), exceeds per-package timeout
    'openai.com/codex', // 3 cargo installs take >50 min then ETIMEDOUT, never succeeds
    // docker.com/cli and docker.com/machine removed — go-md2man available as pantry dep
    'coder.com/code-server', // Node.js native module C++ compilation fragile in CI
    'cr.yp.to/daemontools', // Archaic build system
    'clisp.org', // Complex FFI compiler, platform-specific ARM fixes
    'crates.io/bpb', // upstream dep (pbp) uses removed Rust feature (rust_2018_preview, removed in 1.76)
    'crates.io/didyoumean', // indicatif v0.16.2 dep has hard Rust errors (E0282/E0432), --cap-lints warn can't suppress errors
    // crates.io/drill removed — added --cap-lints warn RUSTFLAGS override
    'crates.io/mask', // Rust linker bug: raw-dylibs dir passed as library file on linux (pulldown-cmark build script)
    'crates.io/pqrs', // arrow-arith/chrono trait ambiguity (quarter() method conflict)
    // crates.io/rust-kanban removed — added --cap-lints warn RUSTFLAGS override
    // crates.io/spider_cli removed — added --cap-lints warn RUSTFLAGS override
    // fabianlindfors.se/reshape removed — added --cap-lints warn RUSTFLAGS override
    // frei0r.dyne.org removed — switched to GitHub source (upstream tarball was corrupt)
    'info-zip.org/unzip', // SourceForge URL with spaces/parens, unmaintained since 2009
    'practical-scheme.net/gauche', // Version tag format mismatch (release0_9_x vs v0.9.x)
    'openinterpreter.com', // tiktoken wheel build failure (Python C extension)
    'psycopg.org/psycopg3', // Git-based distributable pulling dev versions
    'sourceware.org/dm', // GitLab download URLs return 404
    'llm.datasette.io', // GitHub tag v0.28.0 no longer exists
    'taku910.github.io/mecab-ipadic', // Needs mecab built first
    'itstool.org', // Needs Python libxml2 bindings matching exact Python version
    'oberhumer.com/ucl', // Dead upstream domain
    'khronos.org/SPIRV-Cross', // Project archived, tags removed
    'getsynth.com', // Dead/abandoned project
    'ordinals.com', // GitHub tag format mismatch (all variants return 404)
    'dhruvkb.dev/pls', // Hardcoded beta tag + cargo auth failure on git deps
    'seaweedfs.com', // All GitHub release tags return 404
    'wundergraph.com', // All GitHub release tags return 404
    'riverbankcomputing.com/sip', // Server returns empty reply on all downloads
    'alembic.sqlalchemy.org', // Version tags return 404 on PyPI/GitHub
    'render.com', // Needs deno compile (no distributable source)
    'tea.xyz', // Needs deno task compile (no distributable source)
    'sdkman.io', // Shell script distribution, not compilable
    'spacetimedb.com', // Hardcoded beta tag, no version discovery
    'ntp.org', // Complex version format embedded in path (ntp-4.2.8p17)
    'jbig2dec.com', // Single hardcoded version, buried in ghostpdl releases
    'videolan.org/x264', // Version includes git hash, Debian mirror URL
    'github.com/mamba-org/mamba', // Hardcoded version, FIXME in recipe
    'github.com/confluentinc/libserdes', // RC version format in tag
    'github.com/siderolabs/conform', // Alpha version format in tag
    'github.com/MaestroError/heif-converter-image', // No proper releases (hardcoded 0.2)
    'microsoft.com/markitdown', // Version tags don't exist on GitHub
    'snyk.io', // Binary distribution, no compilable source
    'github.com/nicholasgasior/gw', // Dead project, no GitHub releases
    'foundry-rs.github.io', // All download tags return 404 (project restructured)
    'wez.github.io/wezterm', // Source tarball download fails
    'invisible-island.net/dialog', // Complex version format with date suffix
    'jetporch.com', // Dead project, GitHub repo/tags removed
    'libsdl.org/SDL_image', // SDL3 version resolved but URL uses SDL2_image naming
    'gource.io', // GitHub releases removed/restructured
    'xpra.org', // Wrong strip regex (/^xpra /) + massive Linux-only dep chain
    'qt.io', // Hardcoded single version 5.15.10, massive build
    'hdfgroup.org/HDF5', // Tag format changed from hdf5_ to hdf5- in 2.x
    'pipenv.pypa.io', // Version 3000.0.0 tag doesn't exist on GitHub
    'riverbankcomputing.com/pyqt-builder', // Server returns empty reply
    'tcl-lang.org/expect', // SourceForge CDN unreliable (cytranet.dl.sourceforge.net)
    'surrealdb.com', // Old release tags removed from GitHub
    // nasm.us removed — switched version discovery to GitHub releases
    // crates.io/skim removed — added --cap-lints warn RUSTFLAGS override
    // crates.io/tabiew removed — 45min timeout should be sufficient
    'apple.com/container', // Massive Swift compilation (571+ files), fragile in CI
    'strace.io', // btrfs xlat static assertion: generated headers bypass CFLAGS, can't fix with -D flags
    // gnu.org/source-highlight removed — added -std=c++14 to CXXFLAGS
    'microbrew.org/md5sha1sum', // Server dead — microbrew.org times out on port 80, source tarball unavailable
    'ghostgum.com.au/epstool', // Source tarball removed from ftp.debian.org (404)
    'ghostscript.com', // Tag format gs10060 for version 10.06.0 — zero-padded minor not reconstructible from semver
    'amber-lang.com', // Version tags prefixed with -alpha, tag format mismatch → 404
    // heasarc.gsfc.nasa.gov/cfitsio removed — built successfully on both platforms
    'brxken128.github.io/dexios', // Rust 'unnecessary qualification' lint errors with modern rustc (unmaintained)
    'clog-tool.github.io', // Uses unmaintained rustc-serialize crate, incompatible with modern Rust
    'apache.org/jmeter', // Vendored Java dist: wget in build script + complex plugin manager download
    'kornel.ski/dssim', // Requires Rust nightly (-Zunstable-options), corrupts shared rustup
    // khanacademy.org/genqlient removed — added go get x/tools@latest before build
    'beyondgrep.com', // Download URL returns 404 (ack-v3.9.0 not available)
    'elixir-lang.org', // Erlang dep has hardcoded build-time paths (erlexec not found)
    'elixir-lang.org/otp-27', // Same erlang relocatability issue
    // pimalaya.org/himalaya removed — removed pinned rust-toolchain.toml, using stable Rust
    'plakar.io', // cockroachdb/swiss requires Go runtime internals not in Go 1.26
    'ipfscluster.io', // Same cockroachdb/swiss Go runtime internals issue
    // syncthing.net removed — patched compat.yaml to add Go 1.26 runtime entry
    'projectdiscovery.io/nuclei', // bytedance/sonic requires newer Go runtime internals
    'iroh.computer', // curve25519-dalek pre-release incompatible with digest crate
    // crates.io/mdcat removed — added --cap-lints warn RUSTFLAGS
    'dns.lookup.dog', // old openssl-sys v0.9.58 macro bug, project abandoned
    // microsoft.com/code-cli removed — built successfully on darwin
    'fluentci.io', // Uses deno compile, fragile in CI
    // fna-xna.github.io removed — SDL2 dev packages now in CI
    // getclipboard.app removed — added include path fix override
    // perl.org removed — fixed poll.h include and removed llvm.org dep
    // priver.dev/geni removed — built successfully on both platforms
    // schollz.com/croc removed — built successfully on both platforms
    'foundry-rs.github.io/foundry', // All old version tags pruned from repo
    // volta.sh removed — removed pinned rust-toolchain.toml, unpinned yanked zip crate
    // libtom.net/math removed — libtool already in CI
    // sourceforge.net/xmlstar removed — libxml2 headers available via system
    // mypy-lang.org removed — widened python version constraint in override
    // pcre.org removed — URL override to use GitHub releases instead of SourceForge
    // digitalocean.com/doctl removed — built successfully on both platforms
    'pkl-lang.org', // Gradle buildSrc dependency resolution failure in CI
    'quickwit.io', // Private git dep (pulsar-rs) requires authentication, can't build in CI
    'raccoin.org', // Linker OOM — huge Slint UI generated code exceeds CI runner memory
    'replibyte.com', // Locked wasm-bindgen v0.2.80 incompatible with current Rust (needs >= 0.2.88)
    'wezfurlong.org/wezterm', // OS error 35 (EAGAIN) — OOM during parallel Rust compilation
    // x.org/libSM removed — already has clean ARGS (no $SHELF), ice/sm fixed
    // x.org/xmu removed — fixed $SHELF variable references in script
    // x.org/xt removed — fixed $SHELF variable references in script
    // swagger.io/swagger-codegen removed — built successfully on linux
    'angular.dev', // npm build failure on both platforms (native module compilation)
    // capnproto.org removed — already has clean cmake prefix, existing override entry covers it
    // cmake.org removed — reduced parallel jobs to prevent race condition
    // sourceforge.net/libtirpc — shared lib linking, needs kerberos.org in S3
    // werf.io removed — removed btrfs-progs/gcc/binutils deps + fixed static tags in override
    // agwa.name/git-crypt removed — xsltproc now in CI
    // gnu.org/texinfo removed — built successfully on linux
    // gstreamer.freedesktop.org/orc removed — built successfully on linux
    // laravel.com removed — built successfully on linux
    // libimobiledevice.org/libimobiledevice-glue removed — added glibtool fix
    // libsdl.org/SDL_ttf removed — sdl2 now in macOS brew
    // freedesktop.org/icon-theme removed — built successfully on linux
    // freedesktop.org/xcb-util-image removed — fixed prefix quoting in override
    // xkbcommon.org removed — removed XKeyboardConfig dep, fixed meson args
    // amp.rs removed — fixed sed portability in override
    // apache.org/apr-util removed — fixed --with-apr path quoting in override
    'crates.io/gitweb', // Crate permanently deleted from crates.io (404)
    // deepwisdom.ai removed — built successfully on darwin
    // developers.yubico.com/libfido2 removed — removed systemd.io dep override
    // docbook.org/xsl removed — fixed strip-components to 0
    // eksctl.io removed — simplified build to direct go build
    // gnu.org/bc removed — fixed URL to zero-pad minor version
    // libimobiledevice.org/libusbmuxd removed — fixed sed -i BSD
    // freedesktop.org/desktop-file-utils removed — built successfully on darwin
    // harlequin.sh removed — fixed pip install command syntax
    // libsdl.org/SDL_mixer removed — sdl2 now in macOS brew
    // lloyd.github.io/yajl removed — doxygen now in CI
    // musepack.net removed — subpackages build successfully, main package needs investigation
    // pagure.io/xmlto removed — xsltproc/docbook now in CI
    // python.org/typing_extensions removed — switched from flit to pip install
    'radicle.org', // old wasm-bindgen incompatible with current Rust (needs >= 0.2.88)
    // rclone.org removed — removed stale darwin patch and cmount tag
    // snaplet.dev/cli removed — added --legacy-peer-deps override
    // tsl0922.github.io/ttyd removed — added compiler flags override
    // videolan.org/x265 removed — built successfully on linux
    // x.org/ice removed — fixed $SHELF variable references in ARGS
    // x.org/sm removed — fixed $SHELF variable references in script
    // x.org/xkbfile removed — fixed meson invocation
    // freedesktop.org/slirp removed — built successfully on linux
    // gnome.org/libxml2 removed — fixed sed -i BSD + removed --with-python
    'postgrest.org', // Haskell build — GHC/Stack not available
    // ceph.com/cephadm removed — fixed sed -i BSD in shebang step
    // gnupg.org/libgcrypt removed — built successfully on darwin
    // libimobiledevice.org removed — fixed sed -i BSD + glibtool fix
    // libimobiledevice.org/libtatsu removed — removed libpsl dep + glibtool fix
    // matio.sourceforge.io removed — disabled HDF5 dep, build without HDF5
    // mozilla.org/nss removed — fixed sed -i BSD + removed llvm.org dep
    // nx.dev removed — added --legacy-peer-deps override
    // openpmix.github.io removed — removed --with-sge arg
    // ccache.dev removed — CMake build, all deps available
    // crates.io/gitui removed — built successfully on darwin
    // crates.io/zellij removed — added --cap-lints warn RUSTFLAGS override
    // chiark.greenend.org.uk/puzzles removed — removed halibut/llvm/imagemagick deps
    // zlib.net/minizip removed — small cmake build, deps available
    // code.videolan.org/aribb24 removed — small autotools library
    // vapoursynth.com — needs zimg in S3, build zimg first then vapoursynth
    // facebook.com/wangle removed — removed linux gcc/libstdcxx deps in override
    // unidata.ucar.edu/netcdf removed — fixed sed -i BSD in cmake fixup steps
    // x.org/libcvt removed — fixed meson invocation
    // x.org/xaw removed — fixed $SHELF variable references in script
    // sfcgal.gitlab.io removed — no such package (sfcgal.org already fixed)
    'libcxx.llvm.org', // LLVM compilation too resource-intensive for CI
    // --- Failures from run 22169381361 batches 12-18 ---
    // apache.org/arrow removed — fixed cmake prefix + sed -i BSD + removed llvm dep in override
    // apache.org/httpd removed — fixed sed -i BSD compat in override
    // apache.org/thrift removed — fixed duplicate --prefix arg in override
    // apache.org/zookeeper removed — removed cppunit/gcc deps in override
    // aws.amazon.com/cli removed — widened python version constraint in override
    // bitcoin.org removed — removed capnproto/gcc deps in override
    'bittensor.com', // Heavy Rust/Python build, fails on both platforms
    'crates.io/kaspa-miner', // Rust compilation failure
    'crates.io/lighthouse', // Heavy Rust build (Ethereum client)
    // crates.io/qsv removed — built successfully on linux
    // debian.org/iso-codes removed — fixed prefix quoting in override
    // doxygen.nl removed — removed llvm.org dep override
    // ebassi.github.io/graphene removed — disabled gobject-introspection in override
    // epsilon-project.sourceforge.io removed — simple autotools, added override entry
    // facebook.com/edencommon removed — fixed sed -i BSD + removed gcc dep in override
    // facebook.com/fb303 removed — fixed stray cmake prefix + removed gcc dep in override
    // facebook.com/fbthrift removed — fixed cmake prefix + sed -i BSD + removed gcc dep in override
    // facebook.com/mvfst removed — fixed cmake prefix + sed -i BSD + removed gcc/binutils deps in override
    // facebook.com/watchman removed — fixed cmake prefix + sed -i BSD + removed gcc dep in override
    // ferzkopp.net/SDL2_gfx removed — sdl2 now in macOS brew
    // ffmpeg.org removed — disabled SDL2 dep in override
    // fluxcd.io/flux2 removed — removed kustomize dep in override
    // freedesktop.org/appstream removed — disabled heavy deps + fixed sed -i BSD in override
    'freedesktop.org/mesa-glu', // Build failure on darwin (OpenGL dep)
    // freedesktop.org/p11-kit removed — fixed trust-paths template in override
    // freedesktop.org/polkit removed — disabled introspection + fixed prefix in override
    // freedesktop.org/poppler-qt5 removed — fixed cmake prefix + disabled qt5/introspection in override
    // freedesktop.org/shared-mime-info removed — fixed meson prefix quoting in override
    // freedesktop.org/vdpau removed — built successfully on linux
    // freedesktop.org/XKeyboardConfig removed — fixed prefix quoting + removed libxslt dep in override
    'freeglut.sourceforge.io', // Build failure on darwin (OpenGL dep)
    // gdal.org removed — fixed cmake prefix quote + sed -i BSD + removed llvm dep in override
    // geoff.greer.fm/ag — needs pcre.org in S3, build pcre.org first
    // getmonero.org removed — removed linux llvm dep in override
    // gnome.org/atk removed — disabled gobject-introspection in override
    // gnome.org/gdk-pixbuf removed — removed shared-mime-info + disabled introspection
    // gnome.org/glib removed — disabled introspection, fixed sed -i BSD
    // gnome.org/glib-networking moved to linuxOnlyDomains — builds on linux
    // gnome.org/gobject-introspection removed — fixed sed -i BSD + CC in override
    // gnome.org/gsettings-desktop-schemas removed — disabled introspection in override
    // gnome.org/gtk-mac-integration-gtk3 removed — disabled introspection + removed intltool dep in override
    // gnome.org/json-glib removed — fixed sed -i BSD + disabled introspection
    // gnome.org/librsvg removed — disabled introspection + rustup stable in override
    // gnome.org/libsecret removed — removed heavy build deps in override
    // gnome.org/pango removed — disabled introspection in override
    // gnome.org/PyGObject removed — fixed prefix quoting in override
    // gnu.org/groff removed — standard GNU build, should work with CI tools
    // gnu.org/guile removed — fixed sed -i BSD compat in override
    // gnuplot.info removed — removed libavif dep in override
    // gnutls.org removed — removed p11-kit dep + fixed sed -i BSD in override
    // grpc.io removed — fixed cmake prefix quoting in override
    // gtk.org/gtk3 removed — disabled introspection + removed x11/heavy deps in override
    // gtk.org/gtk4 removed — disabled introspection + removed heavy build deps in override
    'hasura.io', // Build failure on darwin
    // ibr.cs.tu-bs.de/libsmi removed — fixed prefix quoting in override
    // intel.com/libva removed — removed x.org/x11 dep chain + disabled x11 in override
    // jpeg.org/jpegxl removed — disabled openexr in override
    // kubebuilder.io removed — removed goreleaser dep in override
    // kubernetes.io/kubectl removed — removed rsync dep in override
    // lavinmq.com removed — fixed sed -i BSD compat in override
    // leonerd.org.uk/libtermkey removed — small C library, try on darwin
    // libarchive.org removed — autotools issue may be fixed with newer CI runner
    'llvm.org', // LLVM — too resource-intensive for CI (3500+ files)
    'llvm.org/clang-format', // LLVM subset — still too heavy
    // luarocks.org removed — lua already in CI brew list
    'lunarvim.org', // Build failure (dep chain)
    'macfuse.github.io/v2', // macOS FUSE — build timeout (1800s)
    // macvim.org removed — removed perl/ruby/tcl interp deps in override
    'materialize.com', // Heavy Rust database build
    // mergestat.com/mergestat-lite removed — removed python build dep in override
    'mesa3d.org', // Mesa 3D — massive build with many deps
    // midnight-commander.org removed — ncurses/glib available via system
    // modal.com removed — removed cython dep in override
    // mpv.io removed — removed vapoursynth dep in override
    'mun-lang.org', // Build failure on darwin
    // mupdf.com removed — fixed sed -i BSD + removed linux X11/mesa deps in override
    // netflix.com/vmaf removed — fixed meson prefix quoting in override
    // open-mpi.org removed — fixed prefix quoting + sed -i BSD in override
    // opendap.org removed — removed linux libtirpc/util-linux deps in override
    // openresty.org removed — fixed sed -i BSD compat in override
    // opensearch.org removed — fixed sed -i BSD compat in override
    'openslide.org', // v4.0.0 requires libdicom dep which is not in pantry
    // openssh.com removed — standard autotools, OpenSSL available
    // orhun.dev/gpg-tui removed — added --cap-lints warn RUSTFLAGS override
    // php.net removed — fixed sed -i BSD + removed kerberos dep in override
    // poppler.freedesktop.org removed — disabled gobject-introspection in override
    // proj.org removed — fixed sha256sum darwin compat in override
    // projen.io removed — removed maven dep in override
    // pulumi.io removed — fixed sed -i BSD compat in override
    // pwmt.org/girara removed — gtk3/json-glib now fixed in override
    // pwmt.org/zathura removed — fixed sed -i BSD + removed adwaita dep in override
    // python-pillow.org removed — removed x.org/xcb dep in override
    // qemu.org removed — fixed prefix quoting + sed -i BSD + removed vde dep in override
    // qpdf.sourceforge.io removed — removed gnutls dep in override
    // rockdaboot.github.io/libpsl removed — switched to libidn2 runtime
    // rucio.cern.ch/rucio-client removed — removed postgresql dep in override
    'rust-lang.org', // Rust compiler — too massive for CI
    // sass-lang.com/libsass removed — built successfully on darwin
    // sass-lang.com/sassc — needs libsass in S3, build libsass first then sassc
    // sfcgal.org removed — fixed stray cmake prefix quote in override
    'solana.com', // Heavy Rust blockchain build
    // sourceforge.net/faac removed — fixed prefix quoting + removed gcc dep in override
    // tcl-lang.org removed — removed x.org/x11 dep + fixed sed -i BSD in override
    'tectonic-typesetting.github.io', // TeX engine — heavy Rust build
    // tesseract-ocr.github.io removed — fixed prefix quoting in override
    'tinygo.org', // TinyGo — heavy LLVM-based build
    // tlr.dev removed — removed protobuf dep in override
    'vaultproject.io', // HashiCorp Vault — Go build failure
    // videolan.org/libplacebo removed — removed linux gcc dep in override
    // vim.org removed — removed perl/ruby interp deps in override
    // virtualsquare.org/vde removed — fixed prefix quoting in override
    // wireshark.org removed — fixed cmake prefix + removed libsmi dep in override
    // x.org/libxfont2 removed — simple autotools, added override entry
    // x.org/x11 removed — fixed prefix quoting in override
    // x.org/xauth removed — fixed prefix quoting + removed gcc dep in override
    // x.org/xinput removed — fixed prefix quoting in override
    // xkbcommon.org removed — removed XKeyboardConfig dep, fixed meson args (see above)
    // bytebase.com and dozzle.dev removed — 60min timeout should be sufficient
    // freedesktop.org/dbus removed — removed xmlto dep, disabled docs
    // gnu.org/gmp removed — URL override to use ftpmirror.gnu.org
    // leonerd.org.uk/libvterm removed — small C library, try build script fix
    // libsoup.org removed — fixed prefix quoting + disabled introspection/vala in override
    'systemd.io', // Complex linux init system — build failure
    'getfoundry.sh', // GitHub tags deleted from foundry-rs/foundry repo (old versions pruned)
    // deepwisdom.ai removed — patched out faiss_cpu on linux
    // expo.dev/eas-cli removed — added corepack yarn 4 activation
    // geoff.greer.fm/ag — added earlier in this list
    // musepack.net removed — fixed stray cmake prefix quote in override
    // wpewebkit.org/wpebackend-fdo removed — fixed prefix quoting + sed -i BSD + removed gcc/mesa deps in override
    'bytebase.com', // Massive Go+pnpm build, exceeds CI timeout (ETIMEDOUT)
    // github.com/antfu/ni removed — fixed pnpm self-install globally in buildkit.ts (npm_config_manage_package_manager_versions=false)
    // crates.io/qsv removed — removed linux wayland dep in override
    // luarocks.org removed — fixed prefix quoting + sed -i BSD + removed info-zip dep in override
    'github.com/safe-waters/docker-lock', // Repository deleted (404)
    'github.com/aristocratos/btop', // Needs GCC 14+ for C++23 std::ranges::to (CI has GCC 13)
    'github.com/snowplow/factotum', // Ancient traitobject crate incompatible with modern Rust
    'github.com/withered-magic/starpls', // Bazel build fails in CI
    'github.com/hadolint/hadolint', // Haskell/Cabal build — GHC/Stack not available in CI
    'github.com/mas-cli/mas', // Swift build: duplicate .build targets on CI runner
    'github.com/unsignedapps/swift-create-xcframework', // posix_spawn conflict in swift-llbuild
    'github.com/nvbn/thefuck', // pip metadata-generation-failed (Python version compat)
    'github.com/npiv/chatblade', // pyo3 doesn't support Python 3.14 yet (max 3.13)
    'github.com/stub42/pytz', // pip install failure on both platforms
    'github.com/mattrobenolt/jinja2-cli', // Python build failure on both platforms
    'github.com/pressly/sup', // Build failure on both platforms
    'github.com/moretension/duti', // make install failure on darwin
    'github.com/a7ex/xcresultparser', // ncurses unctrl.h conflict on darwin
    'github.com/peripheryapp/periphery', // Swift ncurses unctrl.h conflict on darwin
    'github.com/coqui-ai/TTS', // Requires Python <3.11 — CI has 3.14, heavy ML deps
    'github.com/VikParuchuri/surya', // Requires Python ~3.11 with pytorch, incompatible with 3.14
    'github.com/awslabs/llrt', // Requires Rust nightly + Zig toolchain, not in standard CI
    'github.com/glauth/glauth', // PAM plugin API mismatch — needs upstream code fix
    'github.com/shaka-project/shaka-packager', // Complex git submodule + ninja build failures
    'github.com/libkml/libkml', // Old C++ code failing with modern Boost/compilers
    'gaia-gis.it/libspatialite', // Blocked on proj.org dependency chain
    'github.com/OSGeo/libgeotiff', // Blocked on proj.org dependency chain
    'github.com/allure-framework/allure2', // ZIP extraction structure mismatch
    'man-db.gitlab.io/man-db', // Dependency chain failure (libpipeline, groff)
    'aws.amazon.com/sam', // pip install requires Python <3.14 (upstream constraint)
    'github.com/Diniboy1123/usque', // gvisor Go 1.26 build-tag redeclaration conflict
    'github.com/essembeh/gnome-extensions-cli', // git tag v0.11.0 deleted upstream
    'github.com/sindresorhus/macos-term-size', // codesign verification fails in CI
    'eyrie.org/eagle/podlators', // source tarball 404 — older versions removed from server
    'github.com/thkukuk/libnsl', // libtirpc not in S3 — rpc/rpc.h not found
    // --- Failures from sync run 22422991817 ---
    'github.com/p7zip-project/p7zip', // Download 404 — release v17.5.0 doesn't exist
    'github.com/google/re2', // Download 404 — all version tag URLs return 404
    'github.com/saagarjha/unxip', // Download 404 — pre-built binary URL returns 404
    'videolan.org/x265', // Download 404 + cmake CMP0025/CMP0054 OLD no longer supported
    'snaplet.dev/cli', // better-sqlite3 8.5.0 incompatible with Node.js 24 V8 API changes
    'ceph.com/cephadm', // Zipapp shebang replacement exceeds length limit with long build prefix
    'opensearch.org', // Requires Java 21+ but CI provides older Java
    'pulumi.io', // Needs `uv` package manager + Go module directory issue
    'nx.dev', // npm ENOENT: _cacache/tmp path not found during npm install
    'gnu.org/texinfo', // cc wrapper + libtool interaction causes shell syntax error in gnulib
    'gnu.org/guile', // cc wrapper + libtool interaction: scmconfig.h not generated
    'sourceforge.net/libtirpc', // Shared library libtirpc.so.3.0.0 not produced despite --enable-shared
    'sourceforge.net/xmlstar', // Incompatible with libxml2 2.15 API (callback signature changes)
    'werf.io', // Needs libbtrfs-dev headers (removed btrfs-progs dep but still references btrfs API)
    'github.com/aws/aws-sdk-cpp', // cmake target_link_libraries error with AWS::crypto
    'projen.io', // npm pack ERR_OUT_OF_RANGE during jsii-pacmak Python packaging
    'opendap.org', // configure cannot determine DODS XDR integer sizes
    'aws.amazon.com/cli', // flit_core uses ast.Str removed in Python 3.12, S3 only has Python 3.14
    'deepwisdom.ai', // metagpt requires Python <3.12, S3 only has Python 3.12+/3.14
    'lunarvim.org', // Installer can't find neovim binary despite dep — PATH issue
    'modal.com', // grpcio-tools 1.59.2 fails to compile with current Python/compilers
    'rucio.cern.ch/rucio-client', // Python build module chain failure — empty pip install
    'mypy-lang.org', // pathspec API incompatible — GitWildMatchPatternError not exported
    'tcl-lang.org', // System Tcl 8.x version conflict with newly built Tcl 9
    'github.com/luvit/luv', // CMake Lua version detection bug — #define headers leak into install path
    'musepack.net', // Duplicate symbol Res_bit in libmpcdec (library internal issue)
    'tcl-lang.org/expect', // SourceForge download mirror unreachable
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
  const results: Record<string, BuildResult & { version: string }> = {}
  const batchStartTime = Date.now()
  const BATCH_TIME_BUDGET_MS = 100 * 60 * 1000 // 100 min — leave 10 min buffer before 110 min step timeout

  for (const pkg of packagesToBuild) {
    const elapsed = Date.now() - batchStartTime
    if (elapsed > BATCH_TIME_BUDGET_MS) {
      const remaining = packagesToBuild.length - Object.keys(results).length
      console.log(`\n⏱️  Batch time budget exceeded (${Math.round(elapsed / 60000)} min elapsed). Skipping remaining ${remaining} packages.`)
      break
    }
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

  // Write GitHub Actions Job Summary so failures are visible on the run page
  const summaryPath = process.env.GITHUB_STEP_SUMMARY
  if (summaryPath) {
    const lines: string[] = []
    lines.push(`## Build Summary`)
    lines.push('')
    lines.push(`| Metric | Count |`)
    lines.push(`|--------|-------|`)
    lines.push(`| Uploaded | ${uploaded.length} |`)
    lines.push(`| Skipped (already in S3) | ${skipped.length} |`)
    lines.push(`| Failed | ${failed.length} |`)
    lines.push('')

    if (failed.length > 0) {
      lines.push(`### Failed Packages`)
      lines.push('')
      lines.push(`| Package | Version | Error |`)
      lines.push(`|---------|---------|-------|`)
      for (const [domain, r] of failed) {
        const error = (r.error || 'unknown').replace(/\|/g, '\\|').replace(/\n/g, ' ').slice(0, 200)
        lines.push(`| ${domain} | ${r.version || '?'} | ${error} |`)
      }
      lines.push('')
    }

    if (uploaded.length > 0) {
      lines.push(`<details><summary>Uploaded Packages (${uploaded.length})</summary>`)
      lines.push('')
      for (const [domain, r] of uploaded) {
        lines.push(`- ${domain}@${r.version}`)
      }
      lines.push('')
      lines.push(`</details>`)
    }

    try {
      appendFileSync(summaryPath, lines.join('\n'))
    }
    catch (e) {
      console.warn('Could not write job summary:', e)
    }
  }

  if (failed.length > 0) {
    const failRate = attempted > 0 ? (failed.length / attempted * 100).toFixed(0) : 0
    console.log(`\nFailure rate: ${failRate}% (${failed.length}/${attempted} attempted)`)

    // For targeted builds (-p flag), exit non-zero so CI reports the failure
    // For batch builds, exit 0 — individual failures are expected and the
    // batch ran to completion; successfully built packages are in S3
    if (isTargetedBuild) {
      console.log(`\nTargeted build had failures — exiting with error`)
      process.exit(1)
    }

    console.log(`Note: Individual build failures are expected for packages with complex`)
    console.log(`dependencies or platform-specific requirements. Successfully built`)
    console.log(`packages have been uploaded to S3.`)
  }
}

main().catch((error) => {
  console.error('Build all packages failed:', error.message)
  process.exit(1)
})
