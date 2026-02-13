#!/usr/bin/env bun

/**
 * Sync Packages to S3
 *
 * Downloads/builds packages and uploads to S3.
 * Skips packages that already exist in S3.
 *
 * Packages:
 * - bun: pre-built binary
 * - node: pre-built binary
 * - meilisearch: pre-built binary
 * - redis: quick compile
 * - postgres: pre-built binary (from EDB)
 * - mysql: pre-built binary (from Oracle)
 * - php: already handled by quick-php-poc.ts
 */

import { existsSync, mkdirSync, rmSync, writeFileSync, chmodSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join } from 'node:path'
import { parseArgs } from 'node:util'
import { createHash } from 'node:crypto'

interface PackageConfig {
  domain: string
  name: string
  getLatestVersion: () => Promise<string>
  download: (version: string, platform: string, destDir: string) => Promise<void>
  needsCompile?: boolean
}

function detectPlatform(): { platform: string; os: string; arch: string } {
  const os = process.platform === 'darwin' ? 'darwin' : 'linux'
  const arch = process.arch === 'arm64' ? 'arm64' : 'x86-64'
  return { platform: `${os}-${arch}`, os, arch }
}

async function checkExistsInS3(domain: string, version: string, platform: string, bucket: string, region: string): Promise<boolean> {
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

async function uploadToS3(artifactsDir: string, domain: string, version: string, bucket: string, region: string): Promise<void> {
  execSync(
    `bun scripts/upload-to-s3.ts --package "${domain}" --version "${version}" --artifacts-dir "${artifactsDir}" --bucket "${bucket}" --region "${region}"`,
    { stdio: 'inherit', cwd: process.cwd() }
  )
}

function createTarball(sourceDir: string, artifactsDir: string, domain: string, version: string, platform: string): void {
  const artifactDir = join(artifactsDir, `${domain}-${version}-${platform}`)
  mkdirSync(artifactDir, { recursive: true })

  const tarball = `${domain.replace(/\//g, '-')}-${version}.tar.gz`
  execSync(`cd "${sourceDir}" && tar -czf "${join(artifactDir, tarball)}" .`)
  execSync(`cd "${artifactDir}" && shasum -a 256 "${tarball}" > "${tarball}.sha256"`)

  console.log(`   Created: ${tarball}`)
}

// ============================================
// Package Configurations
// ============================================

const packages: Record<string, PackageConfig> = {
  'getcomposer.org': {
    domain: 'getcomposer.org',
    name: 'composer',
    getLatestVersion: async () => {
      const response = await fetch('https://api.github.com/repos/composer/composer/releases/latest')
      const data = await response.json() as { tag_name: string }
      return data.tag_name.replace(/^v/, '')
    },
    download: async (version, platform, destDir) => {
      // Composer is a single PHAR file
      const url = `https://getcomposer.org/download/${version}/composer.phar`

      console.log(`   Downloading from ${url}`)
      mkdirSync(join(destDir, 'bin'), { recursive: true })
      execSync(`curl -L -o "${destDir}/bin/composer" "${url}"`, { stdio: 'inherit' })
      chmodSync(join(destDir, 'bin', 'composer'), 0o755)
    },
  },

  'bun.sh': {
    domain: 'bun.sh',
    name: 'bun',
    getLatestVersion: async () => {
      const response = await fetch('https://api.github.com/repos/oven-sh/bun/releases/latest')
      const data = await response.json() as { tag_name: string }
      return data.tag_name.replace(/^bun-v?/, '')
    },
    download: async (version, platform, destDir) => {
      const { os, arch } = detectPlatform()
      const bunArch = arch === 'arm64' ? 'aarch64' : 'x64'
      const bunPlatform = os === 'darwin' ? 'darwin' : 'linux'
      const ext = os === 'linux' ? '' : ''

      // Bun URL format: bun-darwin-aarch64.zip
      const url = `https://github.com/oven-sh/bun/releases/download/bun-v${version}/bun-${bunPlatform}-${bunArch}.zip`

      console.log(`   Downloading from ${url}`)
      execSync(`curl -L -o "${destDir}/bun.zip" "${url}"`, { stdio: 'inherit' })
      execSync(`cd "${destDir}" && unzip -o bun.zip`, { stdio: 'pipe' })
      execSync(`rm "${destDir}/bun.zip"`)

      // Reorganize into standard structure
      mkdirSync(join(destDir, 'bin'), { recursive: true })
      execSync(`mv "${destDir}"/bun-*/bun "${destDir}/bin/"`)
      execSync(`rm -rf "${destDir}"/bun-*`)
      chmodSync(join(destDir, 'bin', 'bun'), 0o755)
    },
  },

  'nodejs.org': {
    domain: 'nodejs.org',
    name: 'node',
    getLatestVersion: async () => {
      const response = await fetch('https://nodejs.org/dist/index.json')
      const data = await response.json() as { version: string; lts: boolean | string }[]
      // Get latest LTS
      const lts = data.find(v => v.lts)
      return lts ? lts.version.replace(/^v/, '') : data[0].version.replace(/^v/, '')
    },
    download: async (version, platform, destDir) => {
      const { os, arch } = detectPlatform()
      const nodeArch = arch === 'arm64' ? 'arm64' : 'x64'
      const nodePlatform = os === 'darwin' ? 'darwin' : 'linux'

      const url = `https://nodejs.org/dist/v${version}/node-v${version}-${nodePlatform}-${nodeArch}.tar.gz`

      console.log(`   Downloading from ${url}`)
      execSync(`curl -L -o "${destDir}/node.tar.gz" "${url}"`, { stdio: 'inherit' })
      execSync(`cd "${destDir}" && tar -xf node.tar.gz --strip-components=1`, { stdio: 'pipe' })
      execSync(`rm "${destDir}/node.tar.gz"`)
    },
  },

  'meilisearch.com': {
    domain: 'meilisearch.com',
    name: 'meilisearch',
    getLatestVersion: async () => {
      const response = await fetch('https://api.github.com/repos/meilisearch/meilisearch/releases/latest')
      const data = await response.json() as { tag_name: string }
      return data.tag_name.replace(/^v/, '')
    },
    download: async (version, platform, destDir) => {
      const { os, arch } = detectPlatform()
      const msArch = arch === 'arm64' ? 'aarch64' : 'x86_64'
      const msPlatform = os === 'darwin' ? 'macos' : 'linux'

      const url = `https://github.com/meilisearch/meilisearch/releases/download/v${version}/meilisearch-${msPlatform}-${msArch}`

      console.log(`   Downloading from ${url}`)
      mkdirSync(join(destDir, 'bin'), { recursive: true })
      execSync(`curl -L -o "${destDir}/bin/meilisearch" "${url}"`, { stdio: 'inherit' })
      chmodSync(join(destDir, 'bin', 'meilisearch'), 0o755)
    },
  },

  'redis.io': {
    domain: 'redis.io',
    name: 'redis',
    needsCompile: true,
    getLatestVersion: async () => {
      const response = await fetch('https://api.github.com/repos/redis/redis/releases/latest')
      const data = await response.json() as { tag_name: string }
      return data.tag_name.replace(/^v?/, '')
    },
    download: async (version, platform, destDir) => {
      const buildDir = '/tmp/redis-build'
      rmSync(buildDir, { recursive: true, force: true })
      mkdirSync(buildDir, { recursive: true })

      const url = `https://github.com/redis/redis/archive/refs/tags/${version}.tar.gz`

      console.log(`   Downloading from ${url}`)
      execSync(`curl -L -o "${buildDir}/redis.tar.gz" "${url}"`, { stdio: 'inherit' })
      execSync(`cd "${buildDir}" && tar -xf redis.tar.gz --strip-components=1`, { stdio: 'pipe' })

      console.log(`   Compiling Redis...`)
      const cpuCount = require('os').cpus().length
      execSync(`cd "${buildDir}" && make -j${cpuCount} PREFIX="${destDir}" install`, { stdio: 'inherit' })

      rmSync(buildDir, { recursive: true, force: true })
    },
  },

  'postgresql.org': {
    domain: 'postgresql.org',
    name: 'postgres',
    getLatestVersion: async () => {
      // Get latest from PostgreSQL website
      const response = await fetch('https://www.postgresql.org/versions.json')
      const data = await response.json() as { major: string; latestMinor: number; current?: boolean; supported?: boolean }[]
      // Find the current version, or the latest supported one
      const current = data.find(v => v.current) || data.filter(v => v.supported).pop()
      if (!current) throw new Error('No current PostgreSQL version found')
      return `${current.major}.${current.latestMinor}`
    },
    download: async (version, platform, destDir) => {
      const { os, arch } = detectPlatform()

      if (os === 'darwin') {
        // Use Postgres.app binaries or EDB installer
        // For simplicity, we'll compile from source (it's relatively fast)
        const buildDir = '/tmp/postgres-build'
        rmSync(buildDir, { recursive: true, force: true })
        mkdirSync(buildDir, { recursive: true })

        const url = `https://ftp.postgresql.org/pub/source/v${version}/postgresql-${version}.tar.gz`

        console.log(`   Downloading from ${url}`)
        execSync(`curl -L -o "${buildDir}/postgres.tar.gz" "${url}"`, { stdio: 'inherit' })
        execSync(`cd "${buildDir}" && tar -xf postgres.tar.gz --strip-components=1`, { stdio: 'pipe' })

        console.log(`   Compiling PostgreSQL...`)
        const cpuCount = require('os').cpus().length
        execSync(`cd "${buildDir}" && ./configure --prefix="${destDir}" --without-icu`, { stdio: 'inherit' })
        execSync(`cd "${buildDir}" && make -j${cpuCount}`, { stdio: 'inherit' })
        execSync(`cd "${buildDir}" && make install`, { stdio: 'inherit' })

        rmSync(buildDir, { recursive: true, force: true })
      } else {
        throw new Error('Linux PostgreSQL binaries not implemented yet')
      }
    },
    needsCompile: true,
  },

  'mysql.com': {
    domain: 'mysql.com',
    name: 'mysql',
    getLatestVersion: async () => {
      // MySQL versioning is complex, hardcode a known good version for now
      return '8.0.40'
    },
    download: async (version, platform, destDir) => {
      const { os, arch } = detectPlatform()

      if (os === 'darwin') {
        // MySQL provides pre-built binaries for macOS
        const mysqlArch = arch === 'arm64' ? 'arm64' : 'x86_64'
        const url = `https://dev.mysql.com/get/Downloads/MySQL-8.0/mysql-${version}-macos14-${mysqlArch}.tar.gz`

        console.log(`   Downloading from ${url}`)
        console.log(`   (MySQL downloads can be slow...)`)
        execSync(`curl -L -o "${destDir}/mysql.tar.gz" "${url}"`, { stdio: 'inherit' })
        execSync(`cd "${destDir}" && tar -xf mysql.tar.gz --strip-components=1`, { stdio: 'pipe' })
        execSync(`rm "${destDir}/mysql.tar.gz"`)
      } else {
        throw new Error('Linux MySQL binaries not implemented yet')
      }
    },
  },

  'pnpm.io': {
    domain: 'pnpm.io',
    name: 'pnpm',
    getLatestVersion: async () => {
      const response = await fetch('https://api.github.com/repos/pnpm/pnpm/releases/latest')
      const data = await response.json() as { tag_name: string }
      return data.tag_name.replace(/^v/, '')
    },
    download: async (version, platform, destDir) => {
      const { os, arch } = detectPlatform()
      const pnpmArch = arch === 'arm64' ? 'arm64' : 'x64'
      const pnpmPlatform = os === 'darwin' ? 'macos' : 'linux'

      const url = `https://github.com/pnpm/pnpm/releases/download/v${version}/pnpm-${pnpmPlatform}-${pnpmArch}`

      console.log(`   Downloading from ${url}`)
      mkdirSync(join(destDir, 'bin'), { recursive: true })
      execSync(`curl -L -o "${destDir}/bin/pnpm" "${url}"`, { stdio: 'inherit' })
      chmodSync(join(destDir, 'bin', 'pnpm'), 0o755)
    },
  },

  'yarnpkg.com': {
    domain: 'yarnpkg.com',
    name: 'yarn',
    getLatestVersion: async () => {
      const response = await fetch('https://api.github.com/repos/yarnpkg/berry/releases/latest')
      const data = await response.json() as { tag_name: string }
      return data.tag_name.replace(/^v?@yarnpkg\/cli\//, '')
    },
    download: async (version, platform, destDir) => {
      // Yarn is distributed as a JS file, needs Node to run
      const url = `https://repo.yarnpkg.com/${version}/packages/yarnpkg-cli/bin/yarn.js`

      console.log(`   Downloading from ${url}`)
      mkdirSync(join(destDir, 'bin'), { recursive: true })

      // Download and create wrapper
      execSync(`curl -L -o "${destDir}/bin/yarn.js" "${url}"`, { stdio: 'inherit' })

      // Create shell wrapper
      const wrapper = `#!/bin/sh
exec node "$(dirname "$0")/yarn.js" "$@"
`
      require('fs').writeFileSync(join(destDir, 'bin', 'yarn'), wrapper)
      chmodSync(join(destDir, 'bin', 'yarn'), 0o755)
      chmodSync(join(destDir, 'bin', 'yarn.js'), 0o755)
    },
  },

  'go.dev': {
    domain: 'go.dev',
    name: 'go',
    getLatestVersion: async () => {
      const response = await fetch('https://go.dev/dl/?mode=json')
      const data = await response.json() as { version: string; stable: boolean }[]
      const stable = data.find(v => v.stable)
      return stable ? stable.version.replace(/^go/, '') : '1.23.0'
    },
    download: async (version, platform, destDir) => {
      const { os, arch } = detectPlatform()
      const goArch = arch === 'arm64' ? 'arm64' : 'amd64'

      const url = `https://go.dev/dl/go${version}.${os}-${goArch}.tar.gz`

      console.log(`   Downloading from ${url}`)
      execSync(`curl -L -o "${destDir}/go.tar.gz" "${url}"`, { stdio: 'inherit' })
      execSync(`cd "${destDir}" && tar -xf go.tar.gz --strip-components=1`, { stdio: 'pipe' })
      execSync(`rm "${destDir}/go.tar.gz"`)
    },
  },

  'deno.land': {
    domain: 'deno.land',
    name: 'deno',
    getLatestVersion: async () => {
      const response = await fetch('https://api.github.com/repos/denoland/deno/releases/latest')
      const data = await response.json() as { tag_name: string }
      return data.tag_name.replace(/^v/, '')
    },
    download: async (version, platform, destDir) => {
      const { os, arch } = detectPlatform()
      const denoArch = arch === 'arm64' ? 'aarch64' : 'x86_64'
      const denoPlatform = os === 'darwin' ? 'apple-darwin' : 'unknown-linux-gnu'

      const url = `https://github.com/denoland/deno/releases/download/v${version}/deno-${denoArch}-${denoPlatform}.zip`

      console.log(`   Downloading from ${url}`)
      mkdirSync(join(destDir, 'bin'), { recursive: true })
      execSync(`curl -L -o "${destDir}/deno.zip" "${url}"`, { stdio: 'inherit' })
      execSync(`cd "${destDir}/bin" && unzip -o ../deno.zip`, { stdio: 'pipe' })
      execSync(`rm "${destDir}/deno.zip"`)
      chmodSync(join(destDir, 'bin', 'deno'), 0o755)
    },
  },

  'python.org': {
    domain: 'python.org',
    name: 'python',
    getLatestVersion: async () => {
      // Use a stable version - Python standalone builds
      return '3.12.0'
    },
    download: async (version, platform, destDir) => {
      const { os, arch } = detectPlatform()

      // Use python-build-standalone releases
      const pyArch = arch === 'arm64' ? 'aarch64' : 'x86_64'
      const pyPlatform = os === 'darwin' ? 'apple-darwin' : 'unknown-linux-gnu'

      // Python standalone build tag format
      const tag = '20231002'
      const url = `https://github.com/indygreg/python-build-standalone/releases/download/${tag}/cpython-${version}+${tag}-${pyArch}-${pyPlatform}-install_only.tar.gz`

      console.log(`   Downloading from ${url}`)
      execSync(`curl -L -o "${destDir}/python.tar.gz" "${url}"`, { stdio: 'inherit' })
      execSync(`cd "${destDir}" && tar -xf python.tar.gz --strip-components=1`, { stdio: 'pipe' })
      execSync(`rm "${destDir}/python.tar.gz"`)
    },
  },
}

// ============================================
// Main
// ============================================

async function syncPackage(
  pkgKey: string,
  config: PackageConfig,
  bucket: string,
  region: string,
  force: boolean
): Promise<{ status: 'skipped' | 'uploaded' | 'failed'; version: string }> {
  const { platform } = detectPlatform()

  console.log(`\n${'─'.repeat(50)}`)
  console.log(`📦 ${config.name} (${config.domain})`)
  console.log(`${'─'.repeat(50)}`)

  try {
    // Get latest version
    console.log(`   Fetching latest version...`)
    const version = await config.getLatestVersion()
    console.log(`   Latest: ${version}`)

    // Check if already in S3
    if (!force) {
      const exists = await checkExistsInS3(config.domain, version, platform, bucket, region)
      if (exists) {
        console.log(`   ✓ Already in S3, skipping`)
        return { status: 'skipped', version }
      }
    }

    // Download/build
    const installDir = `/tmp/sync-${pkgKey}-install`
    const artifactsDir = `/tmp/sync-artifacts`

    rmSync(installDir, { recursive: true, force: true })
    mkdirSync(installDir, { recursive: true })
    mkdirSync(artifactsDir, { recursive: true })

    console.log(`   Downloading/building...`)
    await config.download(version, platform, installDir)

    // Create tarball
    console.log(`   Packaging...`)
    createTarball(installDir, artifactsDir, config.domain, version, platform)

    // Upload
    console.log(`   Uploading to S3...`)
    await uploadToS3(artifactsDir, config.domain, version, bucket, region)

    // Cleanup
    rmSync(installDir, { recursive: true, force: true })
    rmSync(join(artifactsDir, `${config.domain}-${version}-${platform}`), { recursive: true, force: true })

    console.log(`   ✅ Uploaded ${config.domain}@${version}`)
    return { status: 'uploaded', version }

  } catch (error: any) {
    console.error(`   ❌ Failed: ${error.message}`)
    return { status: 'failed', version: 'unknown' }
  }
}

async function main() {
  const { values, positionals } = parseArgs({
    options: {
      bucket: { type: 'string', short: 'b' },
      region: { type: 'string', short: 'r', default: 'us-east-1' },
      package: { type: 'string', short: 'p' },
      force: { type: 'boolean', short: 'f', default: false },
      'dry-run': { type: 'boolean', default: false },
      'list': { type: 'boolean', short: 'l', default: false },
      help: { type: 'boolean', short: 'h' },
    },
    allowPositionals: true,
    strict: true,
  })

  if (values.help) {
    console.log(`
Sync Packages to S3

Downloads/builds packages and uploads to your S3 bucket.
Skips packages that already exist (use --force to override).

Usage:
  bun scripts/sync-packages.ts -b <bucket> [options]

Options:
  -b, --bucket <name>     S3 bucket (required)
  -r, --region <region>   AWS region (default: us-east-1)
  -p, --package <name>    Sync specific package only
  -f, --force             Re-upload even if exists
  --dry-run               Show what would be done
  -l, --list              List available packages
  -h, --help              Show this help

Available packages:
  bun.sh, nodejs.org, meilisearch.com, redis.io, postgresql.org, mysql.com,
  getcomposer.org, pnpm.io, yarnpkg.com, go.dev, deno.land, python.org

  Note: php.net should be built separately (use bundle-php.sh)

Examples:
  # Sync all packages
  bun scripts/sync-packages.ts -b my-bucket

  # Sync only bun and node
  bun scripts/sync-packages.ts -b my-bucket -p bun.sh -p nodejs.org

  # Force re-upload
  bun scripts/sync-packages.ts -b my-bucket -p redis.io --force
`)
    process.exit(0)
  }

  if (values.list) {
    console.log('\nAvailable packages:')
    for (const [key, config] of Object.entries(packages)) {
      console.log(`  - ${config.domain} (${config.name})${config.needsCompile ? ' [compiles]' : ' [pre-built]'}`)
    }
    console.log('\n  - php.net (use quick-php-poc.ts)')
    process.exit(0)
  }

  if (!values.bucket) {
    console.error('Error: --bucket is required')
    console.error('Run with --help for usage')
    process.exit(1)
  }

  const bucket = values.bucket
  const region = values.region || 'us-east-1'
  const { platform } = detectPlatform()

  console.log('🚀 Package Sync')
  console.log('═'.repeat(50))
  console.log(`   Bucket: ${bucket}`)
  console.log(`   Region: ${region}`)
  console.log(`   Platform: ${platform}`)

  // Determine which packages to sync
  let packagesToSync = Object.entries(packages)

  if (values.package) {
    const pkgNames = Array.isArray(values.package) ? values.package : [values.package]
    packagesToSync = packagesToSync.filter(([key]) =>
      pkgNames.some(p => key.includes(p) || packages[key]?.name === p)
    )
  }

  if (packagesToSync.length === 0) {
    console.error('No matching packages found')
    process.exit(1)
  }

  console.log(`   Packages: ${packagesToSync.map(([_, c]) => c.name).join(', ')}`)

  if (values['dry-run']) {
    console.log('\n[DRY RUN] Would sync:')
    for (const [key, config] of packagesToSync) {
      const version = await config.getLatestVersion()
      const exists = await checkExistsInS3(config.domain, version, platform, bucket, region)
      console.log(`  - ${config.domain}@${version} ${exists ? '(already exists)' : '(would upload)'}`)
    }
    process.exit(0)
  }

  // Sync each package
  const results: Record<string, { status: string; version: string }> = {}

  for (const [key, config] of packagesToSync) {
    results[config.domain] = await syncPackage(key, config, bucket, region, values.force || false)
  }

  // Summary
  console.log('\n' + '═'.repeat(50))
  console.log('📊 Summary')
  console.log('═'.repeat(50))

  const uploaded = Object.entries(results).filter(([_, r]) => r.status === 'uploaded')
  const skipped = Object.entries(results).filter(([_, r]) => r.status === 'skipped')
  const failed = Object.entries(results).filter(([_, r]) => r.status === 'failed')

  if (uploaded.length > 0) {
    console.log(`\n✅ Uploaded (${uploaded.length}):`)
    uploaded.forEach(([domain, r]) => console.log(`   - ${domain}@${r.version}`))
  }

  if (skipped.length > 0) {
    console.log(`\n⏭️  Skipped (${skipped.length}):`)
    skipped.forEach(([domain, r]) => console.log(`   - ${domain}@${r.version} (already in S3)`))
  }

  if (failed.length > 0) {
    console.log(`\n❌ Failed (${failed.length}):`)
    failed.forEach(([domain]) => console.log(`   - ${domain}`))
  }

  console.log('')
}

main().catch((error) => {
  console.error('Sync failed:', error.message)
  process.exit(1)
})
