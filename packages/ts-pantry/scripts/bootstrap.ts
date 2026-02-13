#!/usr/bin/env bun

// Bootstrap Package and Dependencies
// Resolves dependency tree, builds in correct order, uploads to S3

import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { homedir } from 'node:os'
import { pantry } from '../src/packages'

interface BootstrapOptions {
  package: string
  version?: string
  bucket: string
  region: string
  platform: string
  dryRun: boolean
  skipExisting: boolean
}

interface PackageInfo {
  name: string
  domain: string
  versions: readonly string[]
  dependencies: readonly string[]
  buildDependencies?: readonly string[]
}

// Generate possible pantry keys for a domain
function domainToKeys(domain: string): string[] {
  const clean = domain
    .replace(/@.*$/, '') // Remove version constraints
    .replace(/[\^~<>=].*$/, '') // Remove version operators

  const keys: string[] = []

  // Full domain without special chars (php.net -> phpnet)
  keys.push(clean.replace(/[.\-/]/g, '').toLowerCase())

  // Last part of path (github.com/kkos/oniguruma -> oniguruma)
  const parts = clean.split('/')
  if (parts.length > 1) {
    keys.push(parts[parts.length - 1].replace(/[.\-]/g, '').toLowerCase())
    // Parent path for github.com packages (github.com/kkos -> githubcomkkos)
    if (parts[0].includes('github')) {
      keys.push(parts.slice(0, 2).join('').replace(/[.\-/]/g, '').toLowerCase())
    }
  }

  // Handle gnu.org/gcc/libstdcxx -> libstdcxx
  if (clean.includes('gnu.org/gcc/')) {
    keys.push(clean.split('/').pop()!.toLowerCase())
  }

  return [...new Set(keys)] // Remove duplicates
}

// Parse dependency string to get domain and version
function parseDep(dep: string): { domain: string; version?: string } {
  // Handle formats like:
  // - "curl.se^8"
  // - "openssl.org"
  // - "gnu.org/gmp^6"
  // - "darwin:sourceware.org/bzip2^1" (platform-specific)

  let domain = dep
  let version: string | undefined

  // Remove platform prefix if present
  if (domain.includes(':')) {
    domain = domain.split(':')[1]
  }

  // Extract version constraint
  const versionMatch = domain.match(/[\^~<>=@](.+)$/)
  if (versionMatch) {
    version = versionMatch[1]
    domain = domain.replace(/[\^~<>=@].*$/, '')
  }

  return { domain, version }
}

// Get package info from pantry
function getPackage(domain: string): PackageInfo | null {
  const keys = domainToKeys(domain)

  for (const key of keys) {
    const pkg = (pantry as Record<string, any>)[key]
    if (pkg) {
      return {
        name: pkg.name,
        domain: pkg.domain,
        versions: pkg.versions || [],
        dependencies: pkg.dependencies || [],
        buildDependencies: pkg.buildDependencies || [],
      }
    }
  }

  return null
}

// Resolve all dependencies recursively
function resolveDependencies(
  domain: string,
  resolved: Set<string> = new Set(),
  visiting: Set<string> = new Set(),
  platform: string = 'darwin'
): string[] {
  const { domain: cleanDomain } = parseDep(domain)

  // Skip if already resolved
  if (resolved.has(cleanDomain)) {
    return []
  }

  // Detect circular dependency
  if (visiting.has(cleanDomain)) {
    console.warn(`Circular dependency detected: ${cleanDomain}`)
    return []
  }

  visiting.add(cleanDomain)

  const pkg = getPackage(cleanDomain)
  if (!pkg) {
    console.warn(`Package not found: ${cleanDomain}`)
    visiting.delete(cleanDomain)
    return []
  }

  const allDeps: string[] = []
  const deps = [...(pkg.dependencies || []), ...(pkg.buildDependencies || [])]

  for (const dep of deps) {
    // Skip platform-specific deps for other platforms
    if (dep.includes(':')) {
      const [depPlatform] = dep.split(':')
      if (depPlatform !== platform && depPlatform !== 'darwin' && depPlatform !== 'linux') {
        continue
      }
      if (depPlatform === 'linux' && platform.startsWith('darwin')) continue
      if (depPlatform === 'darwin' && platform.startsWith('linux')) continue
    }

    const { domain: depDomain } = parseDep(dep)

    // Skip platform identifiers that aren't packages (e.g., "darwin/x86-64")
    if (depDomain.match(/^(darwin|linux)\/(x86-64|aarch64|arm64)$/)) {
      continue
    }

    // Skip comments embedded in dependency strings
    if (depDomain.includes('#')) {
      continue
    }
    const depList = resolveDependencies(depDomain, resolved, visiting, platform)
    allDeps.push(...depList)
  }

  visiting.delete(cleanDomain)
  resolved.add(cleanDomain)
  allDeps.push(cleanDomain)

  return allDeps
}

// Get latest version matching constraint
function resolveVersion(pkg: PackageInfo, constraint?: string): string {
  if (!pkg.versions || pkg.versions.length === 0) {
    throw new Error(`No versions available for ${pkg.domain}`)
  }

  if (!constraint) {
    return pkg.versions[0] // Latest
  }

  // Simple major version matching for ^X
  const majorMatch = constraint.match(/^\^?(\d+)/)
  if (majorMatch) {
    const major = majorMatch[1]
    const matching = pkg.versions.find(v => v.startsWith(`${major}.`))
    if (matching) return matching
  }

  return pkg.versions[0] // Fallback to latest
}

// Check if package exists in S3
async function existsInS3(domain: string, version: string, platform: string, bucket: string, region: string): Promise<boolean> {
  try {
    const { S3Client } = await import('@stacksjs/ts-cloud/aws')
    const s3 = new S3Client(region)
    const metadataKey = `binaries/${domain}/metadata.json`

    const metadata = await s3.getObject(bucket, metadataKey)
    const parsed = JSON.parse(metadata)

    return !!(parsed.versions?.[version]?.platforms?.[platform])
  } catch {
    return false
  }
}

// Detect current platform
function detectPlatform(): string {
  const os = process.platform === 'darwin' ? 'darwin' : 'linux'
  const arch = process.arch === 'arm64' ? 'arm64' : 'x86-64'
  return `${os}-${arch}`
}

async function bootstrap(options: BootstrapOptions): Promise<void> {
  const { package: pkgName, bucket, region, platform, dryRun, skipExisting } = options

  console.log('\n' + '='.repeat(60))
  console.log(`Bootstrapping: ${pkgName}`)
  console.log('='.repeat(60))
  console.log(`Platform: ${platform}`)
  console.log(`Bucket: ${bucket}`)
  console.log(`Region: ${region}`)
  console.log(`Dry run: ${dryRun}`)
  console.log(`Skip existing: ${skipExisting}`)

  // Get target package
  const targetPkg = getPackage(pkgName)
  if (!targetPkg) {
    throw new Error(`Package not found in src/packages: ${pkgName}`)
  }

  // Resolve version
  const targetVersion = options.version || targetPkg.versions[0]
  console.log(`\nTarget: ${targetPkg.domain}@${targetVersion}`)

  // Resolve all dependencies
  console.log('\nResolving dependencies...')
  const platformOs = platform.split('-')[0]
  const buildOrder = resolveDependencies(pkgName, new Set(), new Set(), platformOs)

  console.log(`\nBuild order (${buildOrder.length} packages):`)
  buildOrder.forEach((dep, i) => {
    console.log(`  ${i + 1}. ${dep}`)
  })

  // Build each package in order
  console.log('\n' + '='.repeat(60))
  console.log('Building packages')
  console.log('='.repeat(60))

  const built: string[] = []
  const skipped: string[] = []
  const failed: string[] = []

  for (const domain of buildOrder) {
    const pkg = getPackage(domain)
    if (!pkg) {
      console.log(`\n⚠️  Skipping ${domain} - not found in packages`)
      skipped.push(domain)
      continue
    }

    const version = resolveVersion(pkg)
    console.log(`\n--- ${pkg.domain}@${version} ---`)

    // Check if already exists
    if (skipExisting) {
      const exists = await existsInS3(pkg.domain, version, platform, bucket, region)
      if (exists) {
        console.log(`✓ Already exists in S3, skipping`)
        skipped.push(domain)
        continue
      }
    }

    if (dryRun) {
      console.log(`[DRY RUN] Would build and upload ${pkg.domain}@${version}`)
      built.push(domain)
      continue
    }

    // Build and upload
    try {
      const buildDir = `/tmp/bootstrap-build/${pkg.domain}`
      const installDir = `/tmp/bootstrap-install/${pkg.domain}/${version}`
      const depsDir = `/tmp/bootstrap-deps`
      const artifactsDir = `/tmp/bootstrap-artifacts`
      const artifactDir = join(artifactsDir, `${pkg.domain}-${version}-${platform}`)

      // Clean up
      rmSync(buildDir, { recursive: true, force: true })
      rmSync(installDir, { recursive: true, force: true })
      mkdirSync(artifactDir, { recursive: true })
      mkdirSync(depsDir, { recursive: true })

      // Build (with S3 deps download)
      console.log(`Building...`)
      execSync(
        `bun scripts/build-package.ts --package "${pkg.domain}" --version "${version}" --platform "${platform}" --build-dir "${buildDir}" --prefix "${installDir}" --deps-dir "${depsDir}" --bucket "${bucket}" --region "${region}"`,
        { stdio: 'inherit', cwd: process.cwd() }
      )

      // Create tarball
      console.log(`Packaging...`)
      const tarball = `${pkg.domain.replace(/\//g, '-')}-${version}.tar.gz`
      execSync(`cd "${installDir}" && tar -czf "${join(artifactDir, tarball)}" .`)
      execSync(`cd "${artifactDir}" && shasum -a 256 "${tarball}" > "${tarball}.sha256"`)

      // Upload
      console.log(`Uploading...`)
      execSync(
        `bun scripts/upload-to-s3.ts --package "${pkg.domain}" --version "${version}" --artifacts-dir "${artifactsDir}" --bucket "${bucket}" --region "${region}"`,
        { stdio: 'inherit', cwd: process.cwd() }
      )

      // Cleanup
      rmSync(buildDir, { recursive: true, force: true })
      rmSync(installDir, { recursive: true, force: true })
      rmSync(artifactDir, { recursive: true, force: true })

      built.push(domain)
      console.log(`✓ ${pkg.domain}@${version} uploaded`)

    } catch (error: any) {
      console.error(`✗ Failed to build ${pkg.domain}: ${error.message}`)
      failed.push(domain)

      // Continue with next package or abort?
      // For now, continue
    }
  }

  // Summary
  console.log('\n' + '='.repeat(60))
  console.log('Bootstrap Summary')
  console.log('='.repeat(60))
  console.log(`Built: ${built.length}`)
  console.log(`Skipped: ${skipped.length}`)
  console.log(`Failed: ${failed.length}`)

  if (failed.length > 0) {
    console.log(`\nFailed packages:`)
    failed.forEach(f => console.log(`  - ${f}`))
  }

  if (built.length > 0 && !dryRun) {
    console.log(`\n✓ Packages uploaded to s3://${bucket}/binaries/`)
  }
}

// CLI
async function main() {
  const { values } = parseArgs({
    options: {
      package: { type: 'string', short: 'p' },
      version: { type: 'string', short: 'v' },
      bucket: { type: 'string', short: 'b', default: 'pantry-registry' },
      region: { type: 'string', short: 'r', default: 'us-east-1' },
      platform: { type: 'string', default: detectPlatform() },
      'dry-run': { type: 'boolean', default: false },
      'skip-existing': { type: 'boolean', default: true },
      help: { type: 'boolean', short: 'h' },
    },
    strict: true,
  })

  if (values.help || !values.package) {
    console.log(`
Bootstrap Package and Dependencies

Usage:
  bootstrap.ts --package <domain> [options]

Options:
  -p, --package <domain>   Package to bootstrap (e.g., php.net)
  -v, --version <version>  Specific version (default: latest)
  -b, --bucket <name>      S3 bucket (default: pantry-registry)
  -r, --region <region>    AWS region (default: us-east-1)
  --platform <platform>    Target platform (default: auto-detect)
  --dry-run                Show what would be built without building
  --skip-existing          Skip packages already in S3 (default: true)
  -h, --help               Show this help

Examples:
  # See what needs to be built for PHP
  bootstrap.ts -p php.net --dry-run

  # Bootstrap PHP and all dependencies
  bootstrap.ts -p php.net -b my-bucket

  # Bootstrap specific version
  bootstrap.ts -p php.net -v 8.4.17 -b my-bucket

  # Bootstrap for Linux
  bootstrap.ts -p php.net --platform linux-x86-64 -b my-bucket
`)
    process.exit(values.help ? 0 : 1)
  }

  await bootstrap({
    package: values.package,
    version: values.version,
    bucket: values.bucket || 'pantry-registry',
    region: values.region || 'us-east-1',
    platform: values.platform || detectPlatform(),
    dryRun: values['dry-run'] || false,
    skipExisting: values['skip-existing'] ?? true,
  })
}

main().catch((error) => {
  console.error('Bootstrap failed:', error.message)
  process.exit(1)
})
