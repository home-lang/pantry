#!/usr/bin/env bun

// Build Package from Source
// Reads package metadata from src/packages and build instructions from src/pantry
// Uses buildkit to generate bash build scripts from YAML recipes (like brewkit)

import { existsSync, mkdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { execSync, spawn } from 'node:child_process'
import { join, dirname } from 'node:path'
import { parseArgs } from 'node:util'
import { generateBuildScript, getSkips, type PackageRecipe } from './buildkit.ts'
import { fixUp } from './fix-up.ts'
// Import package metadata
const packagesPath = new URL('../src/packages/index.ts', import.meta.url).pathname
const { pantry } = await import(packagesPath)

// Simple YAML parser for package.yml files
function parseYaml(content: string): Record<string, any> {
  const result: Record<string, any> = {}
  const lines = content.split('\n')
  // Stack now stores the actual object to add properties to
  const stack: { indent: number; obj: any }[] = [{ indent: -1, obj: result }]

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    const trimmed = line.trim()

    // Skip empty lines and comments
    if (!trimmed || trimmed.startsWith('#')) continue

    // Calculate indentation
    const indent = line.search(/\S/)

    // Pop stack to correct indent level
    while (stack.length > 1 && stack[stack.length - 1].indent >= indent) {
      stack.pop()
    }

    const currentObj = stack[stack.length - 1].obj

    // Check if it's a list item
    if (trimmed.startsWith('- ')) {
      const value = trimmed.slice(2).trim()

      // Find the array in the parent - it should be the current object if it's an array
      if (Array.isArray(currentObj)) {
        // Handle object-style list items (run:, if:)
        if (value.startsWith('if:')) {
          // Object list item starting with if: — collect sibling keys
          const itemObj: Record<string, any> = {}
          const ci = value.indexOf(':')
          itemObj['if'] = value.slice(ci + 1).trim()
          // Collect sibling keys (run:, working-directory:, prop:, etc.)
          const siblingIndent = indent + 2
          while (i + 1 < lines.length) {
            const nextLine = lines[i + 1]
            const nextTrimmed = nextLine.trim()
            if (!nextTrimmed || nextTrimmed.startsWith('#')) { i++; continue }
            const nextIndent = nextLine.search(/\S/)
            if (nextIndent >= siblingIndent && !nextTrimmed.startsWith('- ')) {
              if (nextTrimmed.startsWith('run:')) {
                const runVal = nextTrimmed.slice(4).trim()
                if (runVal === '|' || runVal === '') {
                  const blockLines: string[] = []
                  let j = i + 2
                  const blockIndent = nextIndent + 2
                  while (j < lines.length) {
                    const bl = lines[j]
                    const bli = bl.search(/\S/)
                    if (bl.trim() === '' || bli >= blockIndent) { blockLines.push(bl.slice(blockIndent) || ''); j++ } else break
                  }
                  itemObj.run = blockLines.join('\n').trim()
                  i = j - 1
                } else {
                  itemObj.run = runVal
                  i++
                }
              } else if (nextTrimmed.includes(':')) {
                const sc = nextTrimmed.indexOf(':')
                const sk = nextTrimmed.slice(0, sc).trim()
                let sv: any = nextTrimmed.slice(sc + 1).trim()
                if (sv.startsWith("'") && sv.endsWith("'")) sv = sv.slice(1, -1)
                if (sv.startsWith('"') && sv.endsWith('"')) sv = sv.slice(1, -1)
                itemObj[sk] = sv
                i++
              } else break
            } else break
          }
          currentObj.push(itemObj)
        } else if (value.startsWith('run:')) {
          const runValue = value.slice(4).trim()
          const itemObj: Record<string, any> = {}
          if (runValue === '|' || runValue === '') {
            // Multi-line block
            const blockLines: string[] = []
            let j = i + 1
            const blockIndent = indent + 2
            while (j < lines.length) {
              const blockLine = lines[j]
              const blockLineIndent = blockLine.search(/\S/)
              if (blockLine.trim() === '' || blockLineIndent >= blockIndent) {
                blockLines.push(blockLine.slice(blockIndent) || '')
                j++
              } else {
                break
              }
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

    // Key-value pair
    const colonIndex = trimmed.indexOf(':')
    if (colonIndex === -1) continue

    const key = trimmed.slice(0, colonIndex).trim()
    let value: any = trimmed.slice(colonIndex + 1).trim()

    // Handle different value types
    if (value === '' || value === '|') {
      // Object or multi-line string
      if (value === '|') {
        // Multi-line string block
        const blockLines: string[] = []
        let j = i + 1
        const blockIndent = indent + 2
        while (j < lines.length) {
          const blockLine = lines[j]
          const blockLineIndent = blockLine.search(/\S/)
          if (blockLine.trim() === '' || (blockLineIndent >= 0 && blockLineIndent >= blockIndent)) {
            blockLines.push(blockLine.slice(Math.min(blockIndent, blockLine.length)) || '')
            j++
          } else {
            break
          }
        }
        currentObj[key] = blockLines.join('\n').trim()
        i = j - 1
      } else {
        // Check if next non-empty, non-comment line is a list item, key-value, or plain text
        let j = i + 1
        while (j < lines.length && (lines[j].trim() === '' || lines[j].trim().startsWith('#'))) j++
        const nextLine = j < lines.length ? lines[j].trim() : ''
        const nextLineIndent = j < lines.length ? lines[j].search(/\S/) : 0

        if (nextLine.startsWith('- ')) {
          // It's an array
          currentObj[key] = []
          stack.push({ indent, obj: currentObj[key] })
        } else if (nextLine.includes(':') && nextLineIndent > indent) {
          // It's an object (has key-value pairs)
          currentObj[key] = {}
          stack.push({ indent, obj: currentObj[key] })
        } else if (nextLineIndent > indent && nextLine) {
          // It's a plain text block (like script content without | marker)
          const blockLines: string[] = []
          const blockIndent = nextLineIndent
          while (j < lines.length) {
            const blockLine = lines[j]
            const blockLineIndent = blockLine.search(/\S/)
            if (blockLine.trim() === '' || (blockLineIndent >= 0 && blockLineIndent >= blockIndent)) {
              blockLines.push(blockLine.trim())
              j++
            } else {
              break
            }
          }
          currentObj[key] = blockLines.filter(l => l && !l.startsWith('#')).join('\n')
          i = j - 1
        } else {
          // Empty object
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

interface BuildOptions {
  package: string
  version: string
  platform: string
  buildDir: string
  prefix: string
  depsDir?: string
  bucket?: string
  region?: string
}

interface PackageRecipe {
  distributable: {
    url: string
    'strip-components'?: number
    ref?: string
  }
  dependencies?: Record<string, any>
  build?: {
    dependencies?: Record<string, any>
    script?: (string | { run: string; if?: string; 'working-directory'?: string; prop?: string })[]
    env?: Record<string, any>
  }
  versions?: any
  provides?: string[]
}

// Template variable interpolation
function interpolate(template: string | any, vars: Record<string, string>): string {
  if (typeof template !== 'string') {
    return String(template)
  }
  return template
    // Handle ${{key}} first (before {{key}} to avoid partial matches)
    .replace(/\$\{\{([^}]+)\}\}/g, (_, key) => {
      const trimmedKey = key.trim()
      return vars[trimmedKey] ?? '${{' + trimmedKey + '}}'
    })
    // Handle {{key}}
    .replace(/\{\{([^}]+)\}\}/g, (_, key) => {
      const trimmedKey = key.trim()
      return vars[trimmedKey] ?? '{{' + trimmedKey + '}}'
    })
    // Handle $ENV_VAR style
    .replace(/\$([A-Z_][A-Z0-9_]*)/g, (_, key) => {
      return process.env[key] ?? vars[key] ?? '$' + key
    })
}

/**
 * Determine version.tag from the YAML versions.strip pattern
 * In pkgx, version.tag = the original git tag before strip was applied.
 * Default github strip is /^v/ (removes v prefix from tags like v1.0.0)
 * But if tag doesn't have v prefix, version = tag (strip is no-op)
 */
function determineVersionTag(yamlContent: string, version: string): string {
  // Look for explicit strip pattern in the YAML
  // Match from first / to last / on the line (handles / inside pattern like /(cli/v|...)/
  const stripMatch = yamlContent.match(/strip:\s*\/(.+)\/$/)
  const stripMatchML = stripMatch ?? yamlContent.match(/strip:\s*\/(.+)\//)
  if (stripMatchML) {
    const pattern = stripMatchML[1]

    // Handle alternation patterns like (cli/v|@biomejs/biome@)
    // Extract the first alternative as the prefix to prepend
    if (pattern.includes('|')) {
      const alts = pattern.replace(/^\(/, '').replace(/\)$/, '').split('|')
      // Use first alternative, strip leading ^
      const prefix = alts[0].replace(/^\^/, '')
      return prefix + version
    }

    // Simple prefix pattern: /^v/, /^hdf5_/, /^mysql-/
    const simplePrefix = pattern.replace(/^\^/, '')
    if (simplePrefix === 'v') return `v${version}`
    return simplePrefix + version
  }

  // No explicit strip — check if this is a github source (default strip is /^v/)
  // But we need to handle cases where tags don't have v prefix
  // Heuristic: date-based versions (YYYYMMDD...) rarely have v prefix
  if (/^\d{6,}/.test(version)) return version

  // Default: assume v prefix (most common for github releases)
  return `v${version}`
}

// Load build overrides from src/pantry/{domain}/build-overrides.json
function getBuildOverrides(pkgName: string): { description?: string; extraConfigureArgs?: string[] } | null {
  const overridesPath = join(process.cwd(), 'src', 'pantry', pkgName, 'build-overrides.json')
  if (!existsSync(overridesPath)) return null

  try {
    const content = readFileSync(overridesPath, 'utf-8')
    return JSON.parse(content)
  } catch (error: any) {
    console.log(`Warning: Failed to parse build-overrides.json for ${pkgName}: ${error.message}`)
    return null
  }
}

async function downloadSource(url: string, destDir: string, stripComponents: number = 1, ref?: string): Promise<void> {
  console.log(`📥 Downloading source from ${url}`)

  // Handle git+https:// URLs — clone the repo
  if (url.startsWith('git+https://') || url.startsWith('git+http://')) {
    const gitUrl = url.replace(/^git\+/, '')
    console.log(`📦 Cloning git repository...`)
    // Clone with specific ref/tag if provided, shallow for speed
    const refArg = ref ? `--branch "${ref}" --single-branch` : ''
    try {
      execSync(`git clone --depth 1 ${refArg} "${gitUrl}" "${destDir}/_git_clone"`, { stdio: 'inherit' })
    } catch {
      // If shallow clone with ref fails, try full clone + checkout
      execSync(`git clone "${gitUrl}" "${destDir}/_git_clone"`, { stdio: 'inherit' })
      if (ref) {
        try {
          execSync(`cd "${destDir}/_git_clone" && git checkout "${ref}"`, { stdio: 'inherit' })
        } catch {
          console.log(`Warning: Could not checkout ref ${ref}, using default branch`)
        }
      }
    }
    // Move cloned content to build dir
    execSync(`cp -a "${destDir}/_git_clone/." "${destDir}/"`, { stdio: 'pipe' })
    execSync(`rm -rf "${destDir}/_git_clone"`, { stdio: 'pipe' })
    return
  }

  // Determine file extension from URL
  const isZip = url.endsWith('.zip')
  const tempFile = join(destDir, isZip ? 'source.zip' : 'source.tar.gz')

  // Download using curl (follow redirects, fail on HTTP errors)
  // Encode spaces and special chars in URLs (e.g. xpra.org has "xpra 6.4.3" in tag)
  const encodedUrl = url.replace(/ /g, '%20')
  execSync(`curl -fSL -o "${tempFile}" "${encodedUrl}"`, { stdio: 'inherit' })

  // Validate downloaded file is not a tiny error page
  const fileSize = statSync(tempFile).size
  if (fileSize < 1000) {
    throw new Error(`Downloaded file is too small (${fileSize} bytes) — likely an error page, not a source archive`)
  }

  console.log(`📦 Extracting source to ${destDir}`)

  if (isZip) {
    // For zip: extract then move contents up if strip-components > 0
    const tmpExtract = join(destDir, '__zip_extract__')
    mkdirSync(tmpExtract, { recursive: true })
    execSync(`unzip -q -o "${tempFile}" -d "${tmpExtract}"`, { stdio: 'inherit' })

    if (stripComponents > 0) {
      // Find the single top-level dir and move its contents
      const entries = execSync(`ls "${tmpExtract}"`, { encoding: 'utf-8' }).trim().split('\n')
      if (entries.length === 1) {
        execSync(`cp -a "${join(tmpExtract, entries[0])}/." "${destDir}/"`, { stdio: 'pipe' })
      } else {
        execSync(`cp -a "${tmpExtract}/." "${destDir}/"`, { stdio: 'pipe' })
      }
    } else {
      execSync(`cp -a "${tmpExtract}/." "${destDir}/"`, { stdio: 'pipe' })
    }
    execSync(`rm -rf "${tmpExtract}"`)
  } else {
    // tar auto-detects format (gz, xz, bz2, zstd)
    execSync(`tar -xf "${tempFile}" -C "${destDir}" --strip-components=${stripComponents}`, { stdio: 'inherit' })
  }

  // Remove temp file
  execSync(`rm -f "${tempFile}"`)
}

function runCommand(cmd: string, cwd: string, env: Record<string, string>): void {
  console.log(`\n🔧 Running: ${cmd.slice(0, 100)}${cmd.length > 100 ? '...' : ''}`)

  try {
    execSync(cmd, {
      cwd,
      env: { ...process.env, ...env },
      stdio: 'inherit',
      shell: '/bin/bash',
    })
  } catch (error: any) {
    console.error(`❌ Command failed: ${cmd}`)
    throw error
  }
}

function shouldRunStep(condition: string | undefined, platform: string, version: string): boolean {
  if (!condition) return true

  const [os, arch] = platform.split('-')
  const osName = os === 'darwin' ? 'darwin' : 'linux'

  // Platform conditions
  if (condition === 'linux' && osName !== 'linux') return false
  if (condition === 'darwin' && osName !== 'darwin') return false

  // Platform/arch conditions like "darwin/x86-64"
  if (condition.includes('/')) {
    const [condOs, condArch] = condition.split('/')
    const normalizedArch = arch === 'arm64' ? 'aarch64' : 'x86-64'
    if (condOs !== osName) return false
    if (condArch && condArch !== normalizedArch && condArch !== arch) return false
  }

  // Version conditions (simplified)
  if (condition.startsWith('<') || condition.startsWith('>') || condition.startsWith('^') || condition.startsWith('~')) {
    // For now, assume version conditions pass (can be enhanced later)
    return true
  }

  return true
}

// Convert domain to pantry key (php.net -> phpnet)
function domainToKey(domain: string): string {
  return domain.replace(/[.\-/]/g, '').toLowerCase()
}

// Parse dependency string to get domain
function parseDep(dep: string): string {
  let domain = dep
  // Remove platform prefix
  if (domain.includes(':')) {
    domain = domain.split(':')[1]
  }
  // Remove version constraints
  domain = domain.replace(/[\^~<>=@].*$/, '')
  // Remove comments
  domain = domain.replace(/#.*$/, '').trim()
  return domain
}

// Download dependencies from S3
async function downloadDependencies(
  dependencies: string[],
  depsDir: string,
  platform: string,
  bucket: string,
  region: string
): Promise<Record<string, string>> {
  const { S3Client } = await import('@stacksjs/ts-cloud/aws')
  const s3 = new S3Client(region)
  const depPaths: Record<string, string> = {}
  const platformOs = platform.split('-')[0]

  console.log(`\nDownloading ${dependencies.length} dependencies from S3...`)

  for (const dep of dependencies) {
    // Skip platform-specific deps for other platforms
    if (dep.includes(':')) {
      const [depPlatform] = dep.split(':')
      if (depPlatform === 'linux' && platformOs === 'darwin') continue
      if (depPlatform === 'darwin' && platformOs === 'linux') continue
    }

    const domain = parseDep(dep)
    if (!domain || domain.match(/^(darwin|linux)\//)) continue

    try {
      // Get metadata to find latest version
      const metadataKey = `binaries/${domain}/metadata.json`
      let metadata: any

      try {
        const metadataContent = await s3.getObject(bucket, metadataKey)
        metadata = JSON.parse(metadataContent)
      } catch {
        console.log(`   - ${domain}: not in S3, skipping`)
        continue
      }

      const version = metadata.latestVersion
      const platformInfo = metadata.versions?.[version]?.platforms?.[platform]

      if (!platformInfo) {
        console.log(`   - ${domain}@${version}: no binary for ${platform}`)
        continue
      }

      // Download and extract
      const depInstallDir = join(depsDir, domain, version)
      mkdirSync(depInstallDir, { recursive: true })

      console.log(`   - ${domain}@${version}`)

      const tarballPath = join(depInstallDir, 'package.tar.gz')

      // Use curl to download binary data from S3 (s3.getObject returns string which corrupts binaries)
      const s3Url = `https://${bucket}.s3.${region}.amazonaws.com/${platformInfo.tarball}`
      try {
        // Try AWS CLI first (available on GitHub runners, handles auth properly)
        execSync(`aws s3 cp "s3://${bucket}/${platformInfo.tarball}" "${tarballPath}" --region ${region}`, { stdio: 'pipe' })
      } catch {
        // Fallback: try direct HTTP (works if bucket allows public reads)
        execSync(`curl -fsSL -o "${tarballPath}" "${s3Url}"`, { stdio: 'pipe' })
      }

      // Use tar -xf (auto-detect format) instead of -xzf (gzip only)
      execSync(`tar -xf "${tarballPath}" -C "${depInstallDir}"`, { stdio: 'pipe' })
      execSync(`rm "${tarballPath}"`)

      depPaths[domain] = depInstallDir
      depPaths[`deps.${domain}.prefix`] = depInstallDir

    } catch (error: any) {
      console.log(`   - ${domain}: failed (${error.message})`)
    }
  }

  return depPaths
}

async function buildPackage(options: BuildOptions): Promise<void> {
  const { package: pkgName, version, platform, buildDir, prefix, depsDir, bucket, region } = options
  const [os, arch] = platform.split('-')
  const osName = os === 'darwin' ? 'darwin' : 'linux'

  console.log(`\n${'='.repeat(60)}`)
  console.log(`Building ${pkgName} ${version} for ${platform}`)
  console.log(`${'='.repeat(60)}`)

  // Get package metadata from src/packages/*.ts
  const pkgKey = domainToKey(pkgName)
  const pkg = (pantry as Record<string, any>)[pkgKey]

  if (!pkg) {
    throw new Error(`Package not found in src/packages: ${pkgName} (key: ${pkgKey})`)
  }

  console.log(`\nPackage: ${pkg.name} (${pkg.domain})`)
  console.log(`Description: ${pkg.description}`)
  console.log(`Available versions: ${pkg.versions.length}`)

  // Validate version is available
  if (!pkg.versions.includes(version)) {
    console.log(`\nAvailable versions: ${pkg.versions.slice(0, 10).join(', ')}...`)
    throw new Error(`Version ${version} not found. Latest: ${pkg.versions[0]}`)
  }

  // Show dependencies
  if (pkg.dependencies?.length > 0) {
    console.log(`\nRuntime dependencies: ${pkg.dependencies.length}`)
    pkg.dependencies.slice(0, 5).forEach((d: string) => console.log(`  - ${d}`))
    if (pkg.dependencies.length > 5) console.log(`  ... and ${pkg.dependencies.length - 5} more`)
  }

  if (pkg.buildDependencies?.length > 0) {
    console.log(`\nBuild dependencies: ${pkg.buildDependencies.length}`)
    pkg.buildDependencies.forEach((d: string) => console.log(`  - ${d}`))
  }

  // Download dependencies from S3 if bucket is provided
  let depPaths: Record<string, string> = {}
  if (bucket && region && depsDir) {
    const allDeps = [...(pkg.dependencies || []), ...(pkg.buildDependencies || [])]
    depPaths = await downloadDependencies(allDeps, depsDir, platform, bucket, region)
    console.log(`\nDownloaded ${Object.keys(depPaths).length / 2} dependencies`)
  }

  // Find package.yml for build instructions
  const pantryPath = join(process.cwd(), 'src', 'pantry', pkgName, 'package.yml')
  if (!existsSync(pantryPath)) {
    throw new Error(`Build recipe not found at ${pantryPath}`)
  }

  // Parse package.yml for build instructions only
  const yamlContent = readFileSync(pantryPath, 'utf-8')
  const recipe = parseYaml(yamlContent) as PackageRecipe

  console.log(`\nBuild recipe: ${pantryPath}`)

  // Create directories
  mkdirSync(buildDir, { recursive: true })
  mkdirSync(prefix, { recursive: true })

  // Copy props directory if it exists (patches, proxy scripts, etc.)
  const propsDir = join(dirname(pantryPath), 'props')
  if (existsSync(propsDir)) {
    const destProps = join(buildDir, 'props')
    execSync(`cp -a "${propsDir}" "${destProps}"`, { stdio: 'pipe' })
    console.log(`📋 Copied props/ directory to build dir`)
  }

  // Determine version.tag from the versions.strip pattern in YAML
  // In pkgx, version.tag is the original git tag before strip was applied
  // Default strip for github: sources is /^v/ — but only if tag actually has v prefix
  const versionTag = determineVersionTag(yamlContent, version)

  // Setup template variables
  const cpuCount = (await import('node:os')).cpus().length
  const vMajor = version.split('.')[0]
  const vMinor = version.split('.')[1] || '0'
  const templateVars: Record<string, string> = {
    'version': version,
    'version.raw': version,
    'version.tag': versionTag,
    'version.major': vMajor,
    'version.minor': vMinor,
    'version.patch': version.split('.')[2] || '0',
    'version.marketing': `${vMajor}.${vMinor}`,
    'prefix': prefix,
    'hw.concurrency': String(cpuCount),
    'hw.arch': arch === 'arm64' ? 'aarch64' : 'x86-64',
    'hw.platform': osName,
    'hw.target': `${arch === 'arm64' ? 'aarch64' : 'x86-64'}-${osName}`,
    'srcroot': buildDir,
    'pkgx.prefix': prefix,
    'pkgx.dir': prefix,
    ...depPaths, // Add dependency paths for template interpolation
  }

  // Download source
  if (recipe.distributable?.url) {
    const rawUrl = recipe.distributable.url
    const sourceUrl = interpolate(rawUrl, templateVars)
    const stripComponents = recipe.distributable['strip-components'] ?? 1
    const ref = recipe.distributable.ref ? interpolate(recipe.distributable.ref, templateVars) : undefined

    try {
      await downloadSource(sourceUrl, buildDir, stripComponents, ref)
    } catch (firstError: any) {
      // If URL used version.tag and download failed, try alternate tag format
      if (rawUrl.includes('version.tag') && versionTag.startsWith('v')) {
        console.log(`⚠️  Download failed with tag ${versionTag}, retrying without v prefix...`)
        const altTag = version // without v prefix
        const altVars = { ...templateVars, 'version.tag': altTag }
        const altUrl = interpolate(rawUrl, altVars)
        const altRef = recipe.distributable.ref ? interpolate(recipe.distributable.ref, altVars) : undefined
        try {
          await downloadSource(altUrl, buildDir, stripComponents, altRef)
          // Update templateVars for the rest of the build
          templateVars['version.tag'] = altTag
        } catch {
          // Both formats failed, throw original error
          throw firstError
        }
      } else {
        throw firstError
      }
    }
  } else {
    throw new Error('No distributable URL found in package.yml')
  }

  // Build environment variables
  const buildEnv: Record<string, string> = {
    prefix,
    PREFIX: prefix,
  }

  // Process env section
  if (recipe.build?.env) {
    const env = recipe.build.env

    // Process ARGS
    let args: string[] = []
    if (env.ARGS) {
      args = Array.isArray(env.ARGS) ? env.ARGS : [env.ARGS]
    }

    // Add platform-specific ARGS
    if (env[osName]?.ARGS) {
      const platformArgs = Array.isArray(env[osName].ARGS) ? env[osName].ARGS : [env[osName].ARGS]
      args.push(...platformArgs)
    }

    // Apply build overrides from build-overrides.json (if any)
    const overrides = getBuildOverrides(pkgName)
    if (overrides?.extraConfigureArgs?.length) {
      console.log(`🔧 Applying build overrides for ${pkgName}: ${overrides.description || 'custom args'}`)
      args.push(...overrides.extraConfigureArgs)
    }

    // Interpolate ARGS
    buildEnv.ARGS = args.map(arg => interpolate(arg, templateVars)).join(' ')

    // Process other env vars
    for (const [key, value] of Object.entries(env)) {
      if (key === 'ARGS' || key === 'darwin' || key === 'linux' || key.includes('/')) continue

      if (typeof value === 'string') {
        buildEnv[key] = interpolate(value, templateVars)
      } else if (Array.isArray(value)) {
        buildEnv[key] = value.map(v => interpolate(v, templateVars)).join(' ')
      }
    }

    // Process platform-specific env vars
    const platformEnv = env[osName]
    if (platformEnv) {
      for (const [key, value] of Object.entries(platformEnv)) {
        if (key === 'ARGS') continue

        if (typeof value === 'string') {
          buildEnv[key] = interpolate(value, templateVars)
        } else if (Array.isArray(value)) {
          buildEnv[key] = value.map((v: string) => interpolate(v, templateVars)).join(' ')
        }
      }
    }
  }

  console.log('\n📋 Build environment:')
  for (const [key, value] of Object.entries(buildEnv)) {
    if (key === 'ARGS') {
      console.log(`   ${key}: ${value.slice(0, 80)}${value.length > 80 ? '...' : ''}`)
    } else {
      console.log(`   ${key}: ${value}`)
    }
  }

  // Generate and execute build script from YAML recipe (buildkit)
  console.log('\n🔨 Generating build script from YAML recipe...')

  const bashScript = generateBuildScript(
    recipe as PackageRecipe,
    pkgName,
    version,
    platform,
    prefix,
    buildDir,
    depPaths,
    templateVars['version.tag'],
  )

  const scriptPath = join(buildDir, '_build.sh')
  writeFileSync(scriptPath, bashScript, { mode: 0o755 })

  console.log(`📝 Build script written to ${scriptPath}`)
  console.log('\n🔨 Executing build script...')

  try {
    execSync(`bash "${scriptPath}"`, {
      cwd: buildDir,
      env: {
        ...process.env,
        ...buildEnv,
        SRCROOT: buildDir,
        // HOME is overridden inside the build script itself (buildkit.ts)
        // Keep real HOME here so the script can access REAL_HOME for toolchains
      },
      stdio: 'inherit',
      shell: '/bin/bash',
    })
  } catch (error: any) {
    console.error('❌ Build script failed')
    // Print the generated script for debugging
    console.error('\n--- Generated build script ---')
    console.error(bashScript.slice(0, 2000))
    if (bashScript.length > 2000) console.error('... (truncated)')
    console.error('--- End script ---')
    throw error
  }

  // Post-build fix-ups for relocatable binaries
  console.log('\n🔧 Running post-build fix-ups...')
  const skips = getSkips(recipe as PackageRecipe)
  await fixUp(prefix, platform, skips)

  console.log(`\n✅ Build completed successfully!`)
  console.log(`📁 Installed to: ${prefix}`)

  // List what was installed
  try {
    const installed = execSync(`ls -la "${prefix}"`, { encoding: 'utf-8' })
    console.log('\n📦 Installed contents:')
    console.log(installed)
  } catch {
    // Ignore errors listing directory
  }
}

// CLI entry point
async function main() {
  const { values } = parseArgs({
    options: {
      package: { type: 'string', short: 'p' },
      version: { type: 'string', short: 'v' },
      platform: { type: 'string' },
      'build-dir': { type: 'string' },
      prefix: { type: 'string' },
      'deps-dir': { type: 'string' },
      bucket: { type: 'string', short: 'b' },
      region: { type: 'string', short: 'r', default: 'us-east-1' },
    },
    strict: true,
  })

  if (!values.package || !values.version || !values.platform || !values['build-dir'] || !values.prefix) {
    console.error('Usage: build-package.ts --package <domain> --version <version> --platform <platform> --build-dir <dir> --prefix <dir> [--deps-dir <dir>] [--bucket <name>] [--region <region>]')
    console.error('Example: build-package.ts --package php.net --version 8.4.11 --platform darwin-arm64 --build-dir /tmp/build --prefix /tmp/install')
    console.error('With S3: build-package.ts --package php.net --version 8.4.11 --platform darwin-arm64 --build-dir /tmp/build --prefix /tmp/install --deps-dir /tmp/deps --bucket my-bucket')
    process.exit(1)
  }

  await buildPackage({
    package: values.package,
    version: values.version,
    platform: values.platform,
    buildDir: values['build-dir'],
    prefix: values.prefix,
    depsDir: values['deps-dir'],
    bucket: values.bucket,
    region: values.region,
  })
}

main().catch((error) => {
  console.error('❌ Build failed:', error.message)
  process.exit(1)
})
