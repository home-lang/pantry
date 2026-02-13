#!/usr/bin/env bun

// Build Package from Source
// Reads package metadata from src/packages and build instructions from src/pantry

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import { execSync, spawn } from 'node:child_process'
import { join, dirname } from 'node:path'
import { parseArgs } from 'node:util'
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
        // Handle multi-line run blocks
        if (value.startsWith('run:')) {
          const runValue = value.slice(4).trim()
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
            currentObj.push({ run: blockLines.join('\n').trim() })
            i = j - 1
          } else {
            currentObj.push({ run: runValue })
          }
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
        // Check if next non-empty line is a list item, key-value, or plain text
        let j = i + 1
        while (j < lines.length && lines[j].trim() === '') j++
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

// Get PHP custom configure arguments
function getPhpCustomArgs(): string[] {
  return [
    '--with-pdo-mysql=mysqlnd',
    '--with-pdo-pgsql',
    '--with-mysqli=mysqlnd',
  ]
}

async function downloadSource(url: string, destDir: string, stripComponents: number = 1): Promise<void> {
  console.log(`📥 Downloading source from ${url}`)

  const tempFile = join(destDir, 'source.tar.gz')

  // Download using curl
  execSync(`curl -L -o "${tempFile}" "${url}"`, { stdio: 'inherit' })

  console.log(`📦 Extracting source to ${destDir}`)
  execSync(`tar -xf "${tempFile}" -C "${destDir}" --strip-components=${stripComponents}`, { stdio: 'inherit' })

  // Remove temp file
  execSync(`rm "${tempFile}"`)
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

      const tarballContent = await s3.getObject(bucket, platformInfo.tarball)
      const tarballPath = join(depInstallDir, 'package.tar.gz')
      writeFileSync(tarballPath, tarballContent)

      execSync(`tar -xzf "${tarballPath}" -C "${depInstallDir}"`, { stdio: 'pipe' })
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

  // Setup template variables
  const cpuCount = (await import('node:os')).cpus().length
  const templateVars: Record<string, string> = {
    'version': version,
    'version.major': version.split('.')[0],
    'version.minor': version.split('.')[1] || '0',
    'version.patch': version.split('.')[2] || '0',
    'prefix': prefix,
    'hw.concurrency': String(cpuCount),
    'pkgx.prefix': prefix,
    ...depPaths, // Add dependency paths for template interpolation
  }

  // Download source
  if (recipe.distributable?.url) {
    const sourceUrl = interpolate(recipe.distributable.url, templateVars)
    const stripComponents = recipe.distributable['strip-components'] ?? 1
    await downloadSource(sourceUrl, buildDir, stripComponents)
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

    // For PHP, add custom database extensions
    if (pkgName === 'php.net') {
      console.log('🔧 Adding custom PHP extensions (pdo-mysql, pdo-pgsql)')
      args.push(...getPhpCustomArgs())
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

  // Execute build - simplified for common autotools packages
  console.log('\n🔨 Executing build...')

  // Standard autotools build: ./configure && make && make install
  const configureArgs = buildEnv.ARGS || `--prefix=${prefix}`

  console.log(`\n🔧 Running: ./configure ...`)
  runCommand(`./configure ${configureArgs}`, buildDir, buildEnv)

  console.log(`\n🔧 Running: make -j${templateVars['hw.concurrency']}`)
  runCommand(`make -j${templateVars['hw.concurrency']}`, buildDir, buildEnv)

  console.log(`\n🔧 Running: make install`)
  runCommand('make install', buildDir, buildEnv)

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
