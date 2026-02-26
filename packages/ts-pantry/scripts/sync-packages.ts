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
import { S3Client } from '@stacksjs/ts-cloud/aws'
import { uploadToS3 as uploadToS3Impl } from './upload-to-s3.ts'

interface PackageConfig {
  domain: string
  name: string
  getLatestVersion: () => Promise<string>
  download: (version: string, platform: string, destDir: string) => Promise<void>
  needsCompile?: boolean
}

interface SyncPlatformInfo {
  platform: string
  os: string
  arch: string
}

function detectPlatform(): SyncPlatformInfo {
  const os = process.platform === 'darwin' ? 'darwin' : 'linux'
  const arch = process.arch === 'arm64' ? 'arm64' : 'x86-64'
  return { platform: `${os}-${arch}`, os, arch }
}

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

async function uploadToS3(artifactsDir: string, domain: string, version: string, bucket: string, region: string): Promise<void> {
  await uploadToS3Impl({
    package: domain,
    version,
    artifactsDir,
    bucket,
    region,
  })
}

function createTarball(sourceDir: string, artifactsDir: string, domain: string, version: string, platform: string): void {
  const artifactDir = join(artifactsDir, `${domain}-${version}-${platform}`)
  mkdirSync(artifactDir, { recursive: true })

  const tarball = `${domain.replace(/\//g, '-')}-${version}.tar.gz`
  execSync(`cd "${sourceDir}" && tar -czf "${join(artifactDir, tarball)}" .`)
  execSync(`cd "${artifactDir}" && shasum -a 256 "${tarball}" > "${tarball}.sha256"`)

  console.log(`   Created: ${tarball}`)
}

// GitHub API helper with optional auth token
function githubHeaders(): Record<string, string> {
  const headers: Record<string, string> = { 'Accept': 'application/vnd.github.v3+json' }
  const token = process.env.GITHUB_TOKEN
  if (token) headers['Authorization'] = `token ${token}`
  return headers
}

async function githubLatestVersion(repo: string, prefix: string = 'v'): Promise<string> {
  const response = await fetch(`https://api.github.com/repos/${repo}/releases/latest`, { headers: githubHeaders() })
  if (!response.ok) throw new Error(`GitHub API ${response.status}: ${await response.text()}`)
  const data = await response.json() as { tag_name: string }
  return data.tag_name.replace(new RegExp(`^${prefix}`), '')
}

// ============================================
// Package Configurations
// ============================================

const packages: Record<string, PackageConfig> = {
  'getcomposer.org': {
    domain: 'getcomposer.org',
    name: 'composer',
    getLatestVersion: () => githubLatestVersion('composer/composer'),
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
    getLatestVersion: () => githubLatestVersion('oven-sh/bun', 'bun-v?'),
    download: async (version, platform, destDir) => {
      const { os, arch } = detectPlatform()
      const bunArch = arch === 'arm64' ? 'aarch64' : 'x64'
      const bunPlatform = os === 'darwin' ? 'darwin' : 'linux'
      const _ext = os === 'linux' ? '' : ''

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
      const data = await response.json() as Array<{
        version: string
        lts: boolean | string
      }>
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
    getLatestVersion: () => githubLatestVersion('meilisearch/meilisearch'),
    download: async (version, platform, destDir) => {
      const { os, arch } = detectPlatform()
      // Meilisearch uses specific asset names per platform
      let assetSuffix: string
      if (os === 'darwin' && arch === 'arm64') assetSuffix = 'macos-apple-silicon'
      else if (os === 'darwin') assetSuffix = 'macos-amd64'
      else if (arch === 'arm64') assetSuffix = 'linux-aarch64'
      else assetSuffix = 'linux-amd64'

      const url = `https://github.com/meilisearch/meilisearch/releases/download/v${version}/meilisearch-${assetSuffix}`

      console.log(`   Downloading from ${url}`)
      mkdirSync(join(destDir, 'bin'), { recursive: true })
      const binPath = join(destDir, 'bin', 'meilisearch')
      execSync(`curl -fSL -o "${binPath}" "${url}"`, { stdio: 'inherit' })

      // Validate download (must be >1MB for a real binary)
      const { statSync: fstat } = await import('node:fs')
      const size = fstat(binPath).size
      if (size < 1_000_000) {
        throw new Error(`Meilisearch download too small (${size} bytes). Expected >1MB for binary. URL may have returned an error page.`)
      }

      chmodSync(binPath, 0o755)
    },
  },

  'redis.io': {
    domain: 'redis.io',
    name: 'redis',
    needsCompile: true,
    getLatestVersion: () => githubLatestVersion('redis/redis', 'v?'),
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
      const data = await response.json() as Array<{
        major: string
        latestMinor: number
        current?: boolean
        supported?: boolean
      }>
      // Find the current version, or the latest supported one
      const current = data.find(v => v.current) || data.filter(v => v.supported).pop()
      if (!current) throw new Error('No current PostgreSQL version found')
      return `${current.major}.${current.latestMinor}`
    },
    download: async (version, platform, destDir) => {
      // Compile from source on both macOS and Linux
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
    },
    needsCompile: true,
  },

  'mysql.com': {
    domain: 'mysql.com',
    name: 'mysql',
    getLatestVersion: async () => {
      // Fetch latest MySQL version from GitHub tags
      try {
        const tag = await githubLatestVersion('mysql/mysql-server')
        return tag
      } catch {
        return '9.2.0' // Fallback to a known recent version
      }
    },
    download: async (version, platform, destDir) => {
      const { os, arch } = detectPlatform()
      const major = version.split('.').slice(0, 2).join('.')

      if (os === 'darwin') {
        const mysqlArch = arch === 'arm64' ? 'arm64' : 'x86_64'
        // MySQL 9.x uses macosNN naming, try recent macOS versions
        const urls = [
          `https://dev.mysql.com/get/Downloads/MySQL-${major}/mysql-${version}-macos15-${mysqlArch}.tar.gz`,
          `https://dev.mysql.com/get/Downloads/MySQL-${major}/mysql-${version}-macos14-${mysqlArch}.tar.gz`,
          `https://cdn.mysql.com/Downloads/MySQL-${major}/mysql-${version}-macos15-${mysqlArch}.tar.gz`,
          `https://cdn.mysql.com/Downloads/MySQL-${major}/mysql-${version}-macos14-${mysqlArch}.tar.gz`,
        ]

        let downloaded = false
        for (const url of urls) {
          try {
            console.log(`   Trying ${url}`)
            execSync(`curl -fSL -o "${destDir}/mysql.tar.gz" "${url}"`, { stdio: 'inherit' })
            downloaded = true
            break
          } catch { /* try next URL */ }
        }
        if (!downloaded) throw new Error(`Failed to download MySQL ${version} for darwin-${mysqlArch}`)

        console.log(`   Extracting...`)
        execSync(`cd "${destDir}" && tar -xf mysql.tar.gz --strip-components=1`, { stdio: 'pipe' })
        execSync(`rm "${destDir}/mysql.tar.gz"`)
      } else {
        const mysqlArch = arch === 'arm64' ? 'aarch64' : 'x86_64'
        const urls = [
          `https://dev.mysql.com/get/Downloads/MySQL-${major}/mysql-${version}-linux-glibc2.28-${mysqlArch}.tar.xz`,
          `https://dev.mysql.com/get/Downloads/MySQL-${major}/mysql-${version}-linux-glibc2.17-${mysqlArch}.tar.xz`,
          `https://cdn.mysql.com/Downloads/MySQL-${major}/mysql-${version}-linux-glibc2.28-${mysqlArch}.tar.xz`,
          `https://cdn.mysql.com/Downloads/MySQL-${major}/mysql-${version}-linux-glibc2.17-${mysqlArch}.tar.xz`,
        ]

        let downloaded = false
        for (const url of urls) {
          try {
            console.log(`   Trying ${url}`)
            execSync(`curl -fSL -o "${destDir}/mysql.tar.xz" "${url}"`, { stdio: 'inherit' })
            downloaded = true
            break
          } catch { /* try next URL */ }
        }
        if (!downloaded) throw new Error(`Failed to download MySQL ${version} for linux-${mysqlArch}`)

        console.log(`   Extracting...`)
        execSync(`cd "${destDir}" && tar -xf mysql.tar.xz --strip-components=1`, { stdio: 'pipe' })
        execSync(`rm "${destDir}/mysql.tar.xz"`)
      }
    },
  },

  'pnpm.io': {
    domain: 'pnpm.io',
    name: 'pnpm',
    getLatestVersion: () => githubLatestVersion('pnpm/pnpm'),
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
    getLatestVersion: () => githubLatestVersion('yarnpkg/berry', 'v?@yarnpkg/cli/'),
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
      const data = await response.json() as Array<{
        version: string
        stable: boolean
      }>
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
    getLatestVersion: () => githubLatestVersion('denoland/deno'),
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
      // Get latest from astral-sh/python-build-standalone
      const response = await fetch('https://api.github.com/repos/astral-sh/python-build-standalone/releases/latest', { headers: githubHeaders() })
      if (!response.ok) return '3.13.12'
      const data = await response.json() as {
        tag_name: string
        assets: Array<{ name: string }>
      }
      // Find the highest 3.x version from the asset names
      const versions = data.assets
        .map(a => a.name.match(/cpython-(\d+\.\d+\.\d+)\+/)?.[1])
        .filter((v): v is string => !!v)
      const unique = [...new Set(versions)].sort((a, b) => {
        const [a1, a2, a3] = a.split('.').map(Number)
        const [b1, b2, b3] = b.split('.').map(Number)
        return b1 - a1 || b2 - a2 || b3 - a3
      })
      return unique[0] || '3.13.12'
    },
    download: async (version, platform, destDir) => {
      const { os, arch } = detectPlatform()

      // Use python-build-standalone releases from astral-sh
      const pyArch = arch === 'arm64' ? 'aarch64' : 'x86_64'
      const pyPlatform = os === 'darwin' ? 'apple-darwin' : 'unknown-linux-gnu'

      // Get the latest release tag
      const tagResponse = await fetch('https://api.github.com/repos/astral-sh/python-build-standalone/releases/latest', { headers: githubHeaders() })
      const tagData = await tagResponse.json() as { tag_name: string }
      const tag = tagData.tag_name

      const url = `https://github.com/astral-sh/python-build-standalone/releases/download/${tag}/cpython-${version}+${tag}-${pyArch}-${pyPlatform}-install_only.tar.gz`

      console.log(`   Downloading from ${url}`)
      execSync(`curl -fL -o "${destDir}/python.tar.gz" "${url}"`, { stdio: 'inherit' })
      execSync(`cd "${destDir}" && tar -xf python.tar.gz --strip-components=1`, { stdio: 'pipe' })
      execSync(`rm "${destDir}/python.tar.gz"`)
    },
  },
}

// ============================================
// Main
// ============================================

interface SyncResult {
  status: string
  version: string
}

async function syncPackage(
  pkgKey: string,
  config: PackageConfig,
  bucket: string,
  region: string,
  force: boolean,
  explicitVersion?: string,
): Promise<SyncResult> {
  const { platform } = detectPlatform()

  console.log(`\n${'─'.repeat(50)}`)
  console.log(`📦 ${config.name} (${config.domain})`)
  console.log(`${'─'.repeat(50)}`)

  try {
    // Get version (explicit or latest)
    let version: string
    if (explicitVersion) {
      version = explicitVersion
      console.log(`   Using explicit version: ${version}`)
    } else {
      console.log(`   Fetching latest version...`)
      version = await config.getLatestVersion()
      console.log(`   Latest: ${version}`)
    }

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
  const { values, positionals: _positionals } = parseArgs({
    options: {
      bucket: { type: 'string', short: 'b' },
      region: { type: 'string', short: 'r', default: 'us-east-1' },
      package: { type: 'string', short: 'p', multiple: true },
      version: { type: 'string', short: 'v' },
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
  -v, --version <ver>     Sync a specific version (instead of latest)
  -f, --force             Re-upload even if exists
  --dry-run               Show what would be done
  -l, --list              List available packages
  -h, --help              Show this help

Available packages:
  bun.sh, nodejs.org, meilisearch.com, redis.io, postgresql.org, mysql.com,
  getcomposer.org, pnpm.io, yarnpkg.com, go.dev, deno.land, python.org

  Note: php.net should be built separately (use bundle-php.sh)

Examples:
  # Sync all packages (latest versions)
  bun scripts/sync-packages.ts -b my-bucket

  # Sync only bun and node
  bun scripts/sync-packages.ts -b my-bucket -p bun.sh -p nodejs.org

  # Sync a specific version
  bun scripts/sync-packages.ts -b my-bucket -p nodejs.org -v 22.17.0

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

  if (values.package && values.package.length > 0) {
    const pkgNames = values.package
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
      const version = values.version || await config.getLatestVersion()
      const exists = await checkExistsInS3(config.domain, version, platform, bucket, region)
      console.log(`  - ${config.domain}@${version} ${exists ? '(already exists)' : '(would upload)'}`)
    }
    process.exit(0)
  }

  // Sync each package
  const results: Record<string, SyncResult> = {}

  for (const [key, config] of packagesToSync) {
    results[config.domain] = await syncPackage(key, config, bucket, region, values.force || false, values.version)
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
