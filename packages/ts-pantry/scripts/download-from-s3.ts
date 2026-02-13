#!/usr/bin/env bun

/**
 * Download Package Binaries from S3
 *
 * Downloads pre-built package binaries from the custom S3 registry.
 * Can fall back to system package manager if package is not found.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync, chmodSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join, dirname } from 'node:path'
import { parseArgs } from 'node:util'
import { homedir, platform, arch } from 'node:os'
import { S3Client } from '@stacksjs/ts-cloud/aws'

interface DownloadOptions {
  package: string
  version?: string
  bucket: string
  region: string
  installDir: string
  skipFallback: boolean
}

interface PackageMetadata {
  name: string
  latestVersion: string
  versions: Record<string, {
    platforms: Record<string, {
      tarball: string
      sha256: string
      size: number
      uploadedAt: string
    }>
  }>
  updatedAt: string
}

interface PantryYamlConfig {
  dependencies: Record<string, string>
  services?: {
    enabled?: boolean
    autoStart?: string[]
  }
}

/**
 * Detect current platform
 */
function detectPlatform(): string {
  const os = platform()
  const cpuArch = arch()

  const osMap: Record<string, string> = {
    darwin: 'darwin',
    linux: 'linux',
    win32: 'windows',
  }

  const archMap: Record<string, string> = {
    arm64: 'arm64',
    aarch64: 'arm64',
    x64: 'x86-64',
    x86_64: 'x86-64',
  }

  const detectedOs = osMap[os] || os
  const detectedArch = archMap[cpuArch] || cpuArch

  return `${detectedOs}-${detectedArch}`
}

/**
 * Parse pantry.yaml or deps.yaml file
 */
function parsePantryYaml(filePath: string): PantryYamlConfig | null {
  if (!existsSync(filePath)) {
    return null
  }

  const content = readFileSync(filePath, 'utf-8')
  const config: PantryYamlConfig = {
    dependencies: {},
  }

  const lines = content.split('\n')
  let inDependencies = false
  let inServices = false
  let inAutoStart = false

  for (const line of lines) {
    const trimmed = line.trim()

    if (trimmed === 'dependencies:') {
      inDependencies = true
      inServices = false
      inAutoStart = false
      continue
    }

    if (trimmed === 'services:') {
      inDependencies = false
      inServices = true
      inAutoStart = false
      continue
    }

    if (inServices && trimmed === 'autoStart:') {
      inAutoStart = true
      continue
    }

    if (inDependencies && trimmed && !trimmed.startsWith('#')) {
      // Check if this is still in the dependencies section (has indentation)
      if (!line.startsWith(' ') && !line.startsWith('\t') && trimmed !== '') {
        inDependencies = false
        continue
      }

      // Parse "package.domain: ^version" format
      const match = trimmed.match(/^([^:]+):\s*(.+)$/)
      if (match) {
        const pkg = match[1].trim()
        const version = match[2].trim().replace(/['"]/g, '')
        config.dependencies[pkg] = version
      }
    }

    if (inAutoStart && trimmed.startsWith('- ')) {
      if (!config.services) config.services = {}
      if (!config.services.autoStart) config.services.autoStart = []
      config.services.autoStart.push(trimmed.slice(2).trim())
    }
  }

  return config
}

/**
 * Resolve version constraint to actual version
 */
function resolveVersion(constraint: string, availableVersions: string[]): string | null {
  if (!availableVersions || availableVersions.length === 0) {
    return null
  }

  // Remove ^ or ~ prefix
  const cleanConstraint = constraint.replace(/^[\^~]/, '')

  // If exact version match
  if (availableVersions.includes(cleanConstraint)) {
    return cleanConstraint
  }

  // Parse constraint parts
  const constraintParts = cleanConstraint.split('.')
  const majorConstraint = parseInt(constraintParts[0], 10)

  // Find matching versions
  const matchingVersions = availableVersions.filter((v) => {
    const vParts = v.split('.')
    const major = parseInt(vParts[0], 10)

    if (constraint.startsWith('^')) {
      // Caret: compatible with major version
      return major === majorConstraint
    } else if (constraint.startsWith('~')) {
      // Tilde: compatible with minor version
      const minorConstraint = parseInt(constraintParts[1] || '0', 10)
      const minor = parseInt(vParts[1] || '0', 10)
      return major === majorConstraint && minor === minorConstraint
    } else {
      // Exact or prefix match
      return v.startsWith(cleanConstraint)
    }
  })

  if (matchingVersions.length === 0) {
    return null
  }

  // Sort and return latest matching version
  matchingVersions.sort((a, b) => {
    const aParts = a.split('.').map(Number)
    const bParts = b.split('.').map(Number)

    for (let i = 0; i < Math.max(aParts.length, bParts.length); i++) {
      const aVal = aParts[i] || 0
      const bVal = bParts[i] || 0
      if (aVal !== bVal) return bVal - aVal
    }
    return 0
  })

  return matchingVersions[0]
}

/**
 * Download and install a package from S3
 */
async function downloadPackage(options: DownloadOptions): Promise<boolean> {
  const { package: pkgName, version, bucket, region, installDir, skipFallback } = options
  const currentPlatform = detectPlatform()

  console.log(`\nInstalling ${pkgName}${version ? `@${version}` : ''}`)
  console.log(`   Platform: ${currentPlatform}`)

  // Initialize S3 client
  const s3 = new S3Client(region)

  try {
    // Fetch package metadata
    const metadataKey = `binaries/${pkgName}/metadata.json`
    console.log(`   Checking S3: s3://${bucket}/${metadataKey}`)

    let metadata: PackageMetadata
    try {
      const metadataContent = await s3.getObject(bucket, metadataKey)
      metadata = JSON.parse(metadataContent)
    } catch (error) {
      console.log(`   ⚠️  Package not found in custom registry`)

      if (!skipFallback) {
        console.log(`   ↩️  Package not available in registry, skipping...`)
      }

      return false
    }

    // Resolve version
    const availableVersions = Object.keys(metadata.versions)
    let targetVersion: string | null = null

    if (version) {
      targetVersion = resolveVersion(version, availableVersions)
    } else {
      targetVersion = metadata.latestVersion
    }

    if (!targetVersion) {
      console.error(`   ❌ No matching version found for ${version || 'latest'}`)
      console.error(`   Available versions: ${availableVersions.join(', ')}`)
      return false
    }

    console.log(`   Version: ${targetVersion}`)

    // Check if platform is available
    const versionInfo = metadata.versions[targetVersion]
    if (!versionInfo?.platforms?.[currentPlatform]) {
      console.error(`   ❌ Platform ${currentPlatform} not available for ${pkgName}@${targetVersion}`)
      console.error(`   Available platforms: ${Object.keys(versionInfo?.platforms || {}).join(', ')}`)
      return false
    }

    const platformInfo = versionInfo.platforms[currentPlatform]

    // Create install directory
    const pkgInstallDir = join(installDir, pkgName, targetVersion)
    mkdirSync(pkgInstallDir, { recursive: true })

    // Download tarball using AWS CLI (handles binary correctly)
    console.log(`   ⬇️  Downloading (${(platformInfo.size / 1024 / 1024).toFixed(2)} MB)...`)

    const tarballPath = join(pkgInstallDir, 'package.tar.gz')
    const s3Uri = `s3://${bucket}/${platformInfo.tarball}`

    try {
      // Try AWS CLI first (most reliable for binary)
      execSync(`aws s3 cp "${s3Uri}" "${tarballPath}" --region ${region}`, { stdio: 'pipe' })
    } catch {
      // Fallback: use curl with public URL (if bucket is public)
      const publicUrl = `https://${bucket}.s3.${region}.amazonaws.com/${platformInfo.tarball}`
      execSync(`curl -L -o "${tarballPath}" "${publicUrl}"`, { stdio: 'pipe' })
    }

    // Verify SHA256
    console.log(`   🔐 Verifying checksum...`)
    const actualHash = execSync(
      currentPlatform.startsWith('darwin')
        ? `shasum -a 256 "${tarballPath}" | cut -d' ' -f1`
        : `sha256sum "${tarballPath}" | cut -d' ' -f1`,
      { encoding: 'utf-8' }
    ).trim()

    if (actualHash !== platformInfo.sha256) {
      console.error(`   ❌ Checksum mismatch!`)
      console.error(`   Expected: ${platformInfo.sha256}`)
      console.error(`   Actual: ${actualHash}`)
      return false
    }

    // Extract tarball
    console.log(`   📂 Extracting...`)
    execSync(`tar -xzf "${tarballPath}" -C "${pkgInstallDir}"`, { stdio: 'inherit' })

    // Remove tarball after extraction
    execSync(`rm "${tarballPath}"`)

    // Make binaries executable
    const binDir = join(pkgInstallDir, 'bin')
    if (existsSync(binDir)) {
      execSync(`chmod +x "${binDir}"/*`, { stdio: 'pipe' })
    }

    console.log(`   ✅ Installed to ${pkgInstallDir}`)

    // Create/update symlink for current version
    const currentLink = join(installDir, pkgName, 'current')
    try {
      execSync(`rm -f "${currentLink}" && ln -s "${targetVersion}" "${currentLink}"`)
    } catch {
      // Ignore symlink errors
    }

    return true
  } catch (error: any) {
    console.error(`   ❌ Download failed: ${error.message}`)
    return false
  }
}

/**
 * Install all packages from pantry.yaml
 */
async function installFromConfig(
  configPath: string,
  options: {
    bucket: string
    region: string
    installDir: string
    skipFallback: boolean
  }
): Promise<{ success: string[]; failed: string[] }> {
  const config = parsePantryYaml(configPath)

  if (!config) {
    throw new Error(`Config file not found: ${configPath}`)
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log(`🚀 Installing packages from ${configPath}`)
  console.log(`${'='.repeat(60)}`)
  console.log(`   Bucket: ${options.bucket}`)
  console.log(`   Install dir: ${options.installDir}`)
  console.log(`   Packages: ${Object.keys(config.dependencies).length}`)

  const success: string[] = []
  const failed: string[] = []

  for (const [pkg, version] of Object.entries(config.dependencies)) {
    const result = await downloadPackage({
      package: pkg,
      version,
      ...options,
    })

    if (result) {
      success.push(pkg)
    } else {
      failed.push(pkg)
    }
  }

  return { success, failed }
}

/**
 * Generate shell environment setup script
 */
function generateEnvScript(installDir: string, packages: string[]): string {
  const lines: string[] = [
    '# Generated by ts-pantry download-from-s3',
    '# Source this file to set up your environment:',
    '#   source ~/.pantry/env.sh',
    '',
  ]

  const pathDirs: string[] = []

  for (const pkg of packages) {
    const pkgDir = join(installDir, pkg, 'current')
    const binDir = join(pkgDir, 'bin')
    const sbinDir = join(pkgDir, 'sbin')

    if (existsSync(binDir)) {
      pathDirs.push(binDir)
    }
    if (existsSync(sbinDir)) {
      pathDirs.push(sbinDir)
    }

    // Add lib directories for library packages
    const libDir = join(pkgDir, 'lib')
    if (existsSync(libDir)) {
      lines.push(`export LD_LIBRARY_PATH="${libDir}:\$LD_LIBRARY_PATH"`)
      lines.push(`export DYLD_LIBRARY_PATH="${libDir}:\$DYLD_LIBRARY_PATH"`)
    }
  }

  if (pathDirs.length > 0) {
    lines.push(`export PATH="${pathDirs.join(':')}:\$PATH"`)
  }

  lines.push('')
  return lines.join('\n')
}

// CLI entry point
async function main() {
  const { values, positionals } = parseArgs({
    options: {
      config: { type: 'string', short: 'c' },
      package: { type: 'string', short: 'p' },
      version: { type: 'string', short: 'v' },
      bucket: { type: 'string', short: 'b', default: 'pantry-registry' },
      region: { type: 'string', short: 'r', default: 'us-east-1' },
      'install-dir': { type: 'string', default: join(homedir(), '.pantry') },
      'skip-fallback': { type: 'boolean', default: false },
      'generate-env': { type: 'boolean', default: true },
      help: { type: 'boolean', short: 'h' },
    },
    allowPositionals: true,
    strict: true,
  })

  if (values.help) {
    console.log(`
Usage: download-from-s3.ts [options]

Options:
  -c, --config <path>      Path to pantry.yaml or deps.yaml (default: ./pantry.yaml)
  -p, --package <name>     Single package to install (e.g., php.net)
  -v, --version <version>  Version constraint (e.g., ^8.4)
  -b, --bucket <name>      S3 bucket name (default: pantry-registry)
  -r, --region <region>    AWS region (default: us-east-1)
  --install-dir <path>     Installation directory (default: ~/.pantry)
  --skip-fallback          Skip packages not found in S3 (default behavior)
  --generate-env           Generate env.sh for PATH setup (default: true)
  -h, --help               Show this help message

Examples:
  # Install all packages from pantry.yaml
  bun scripts/download-from-s3.ts

  # Install a single package
  bun scripts/download-from-s3.ts -p php.net -v ^8.4

  # Use custom S3 bucket
  bun scripts/download-from-s3.ts -b my-bucket -r eu-west-1

  # Install from specific config file
  bun scripts/download-from-s3.ts -c ./deps.yaml
`)
    process.exit(0)
  }

  const installDir = values['install-dir'] || join(homedir(), '.pantry')
  const skipFallback = values['skip-fallback'] ?? false
  const bucket = values.bucket || 'pantry-registry'
  const region = values.region || 'us-east-1'

  // Ensure install directory exists
  mkdirSync(installDir, { recursive: true })

  let installedPackages: string[] = []

  if (values.package) {
    // Install single package
    const success = await downloadPackage({
      package: values.package,
      version: values.version,
      bucket,
      region,
      installDir,
      skipFallback,
    })

    if (success) {
      installedPackages.push(values.package)
    } else {
      process.exit(1)
    }
  } else {
    // Install from config file
    const configPath = values.config || positionals[0] || './pantry.yaml'
    const altConfigPath = './deps.yaml'

    let actualConfigPath = configPath
    if (!existsSync(configPath) && existsSync(altConfigPath)) {
      actualConfigPath = altConfigPath
    }

    if (!existsSync(actualConfigPath)) {
      console.error(`Config file not found: ${actualConfigPath}`)
      console.error('Please create a pantry.yaml or deps.yaml file, or specify a config with -c')
      process.exit(1)
    }

    const { success, failed } = await installFromConfig(actualConfigPath, {
      bucket,
      region,
      installDir,
      skipFallback,
    })

    installedPackages = success

    console.log(`\n${'='.repeat(60)}`)
    console.log(`📊 Installation Summary`)
    console.log(`${'='.repeat(60)}`)
    console.log(`   ✅ Successful: ${success.length}`)
    console.log(`   ❌ Failed: ${failed.length}`)

    if (failed.length > 0) {
      console.log(`   Failed packages: ${failed.join(', ')}`)
    }
  }

  // Generate environment script
  if (values['generate-env'] && installedPackages.length > 0) {
    const envScript = generateEnvScript(installDir, installedPackages)
    const envPath = join(installDir, 'env.sh')
    writeFileSync(envPath, envScript)
    console.log(`\n📝 Environment script generated: ${envPath}`)
    console.log(`   Run: source ${envPath}`)
  }

  console.log(`\n✨ Done!`)
}

main().catch((error) => {
  console.error('❌ Installation failed:', error.message)
  process.exit(1)
})
