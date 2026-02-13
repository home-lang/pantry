#!/usr/bin/env bun

/**
 * Quick PHP PoC Build
 *
 * Builds PHP 8.4 with MySQL/PostgreSQL extensions using system dependencies.
 * Much faster than bootstrapping everything from source.
 *
 * Extensions included:
 * - PDO MySQL (mysqlnd)
 * - PDO PostgreSQL
 * - mysqli (mysqlnd)
 *
 * Usage:
 *   bun scripts/quick-php-poc.ts --version 8.4.17 --bucket my-bucket
 */

import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { execSync } from 'node:child_process'
import { join } from 'node:path'
import { parseArgs } from 'node:util'

interface BuildOptions {
  version: string
  bucket?: string
  region: string
  skipUpload: boolean
  keepBuild: boolean
}

// Required Homebrew packages for PHP build
const REQUIRED_BREW_PACKAGES = [
  'openssl@3',
  'libxml2',
  'sqlite',
  'curl',
  'libzip',
  'gmp',
  'libsodium',
  'oniguruma',
  'pcre2',
  'libiconv',
  'icu4c',
  'libpng',
  'webp',
  'jpeg',
  'freetype',
  'gettext',
  'libedit',
  'libffi',
  'libxslt',
  'bison',
  're2c',
  'autoconf',
  'libtool',
  'pkg-config',
  // For PostgreSQL extension
  'libpq',
]

function detectPlatform(): string {
  const os = process.platform === 'darwin' ? 'darwin' : 'linux'
  const arch = process.arch === 'arm64' ? 'arm64' : 'x86-64'
  return `${os}-${arch}`
}

function getBrewPrefix(): string {
  try {
    return execSync('brew --prefix', { encoding: 'utf-8' }).trim()
  } catch {
    throw new Error('Homebrew not found. Please install Homebrew first.')
  }
}

function checkBrewPackages(): { missing: string[], installed: string[] } {
  const installed: string[] = []
  const missing: string[] = []

  console.log('\n📋 Checking Homebrew dependencies...')

  for (const pkg of REQUIRED_BREW_PACKAGES) {
    try {
      execSync(`brew list ${pkg} 2>/dev/null`, { stdio: 'pipe' })
      installed.push(pkg)
    } catch {
      missing.push(pkg)
    }
  }

  return { missing, installed }
}

function installMissingPackages(packages: string[]): void {
  if (packages.length === 0) return

  console.log(`\n📦 Installing ${packages.length} missing packages...`)
  console.log(`   ${packages.join(', ')}`)

  execSync(`brew install ${packages.join(' ')}`, { stdio: 'inherit' })
}

async function buildPhp(options: BuildOptions): Promise<string> {
  const { version, keepBuild } = options
  const platform = detectPlatform()
  const brewPrefix = getBrewPrefix()

  console.log('\n' + '='.repeat(60))
  console.log(`🐘 Building PHP ${version} for ${platform}`)
  console.log('='.repeat(60))
  console.log(`   Homebrew prefix: ${brewPrefix}`)

  // Setup directories
  const buildDir = `/tmp/php-poc-build`
  const installDir = `/tmp/php-poc-install/${version}`
  const artifactsDir = `/tmp/php-poc-artifacts`

  // Clean up previous builds
  rmSync(buildDir, { recursive: true, force: true })
  rmSync(installDir, { recursive: true, force: true })
  mkdirSync(buildDir, { recursive: true })
  mkdirSync(installDir, { recursive: true })
  mkdirSync(artifactsDir, { recursive: true })

  // Download PHP source
  const sourceUrl = `https://www.php.net/distributions/php-${version}.tar.gz`
  console.log(`\n📥 Downloading PHP ${version}...`)
  execSync(`curl -L -o "${buildDir}/php.tar.gz" "${sourceUrl}"`, { stdio: 'inherit' })

  console.log(`📦 Extracting...`)
  execSync(`tar -xf "${buildDir}/php.tar.gz" -C "${buildDir}" --strip-components=1`, { stdio: 'inherit' })
  execSync(`rm "${buildDir}/php.tar.gz"`)

  // Build configure arguments
  const pkgConfigPath = [
    `${brewPrefix}/opt/openssl@3/lib/pkgconfig`,
    `${brewPrefix}/opt/libxml2/lib/pkgconfig`,
    `${brewPrefix}/opt/sqlite/lib/pkgconfig`,
    `${brewPrefix}/opt/curl/lib/pkgconfig`,
    `${brewPrefix}/opt/libzip/lib/pkgconfig`,
    `${brewPrefix}/opt/icu4c/lib/pkgconfig`,
    `${brewPrefix}/opt/libpq/lib/pkgconfig`,
    `${brewPrefix}/opt/libffi/lib/pkgconfig`,
    `${brewPrefix}/lib/pkgconfig`,
  ].join(':')

  const configureArgs = [
    `--prefix=${installDir}`,
    // Core features
    '--enable-bcmath',
    '--enable-calendar',
    '--enable-exif',
    '--enable-ftp',
    '--enable-fpm',
    '--enable-gd',
    '--enable-intl',
    '--enable-mbregex',
    '--enable-mbstring',
    '--enable-mysqlnd',
    '--enable-pcntl',
    '--enable-shmop',
    '--enable-soap',
    '--enable-sockets',
    // Database extensions (THE IMPORTANT ONES!)
    '--with-pdo-mysql=mysqlnd',
    '--with-mysqli=mysqlnd',
    `--with-pdo-pgsql=${brewPrefix}/opt/libpq`,
    `--with-pgsql=${brewPrefix}/opt/libpq`,
    // Other extensions
    '--with-curl',
    '--with-ffi',
    `--with-gettext=${brewPrefix}/opt/gettext`,
    `--with-gmp=${brewPrefix}/opt/gmp`,
    `--with-iconv=${brewPrefix}/opt/libiconv`,
    '--with-libxml',
    `--with-libedit=${brewPrefix}/opt/libedit`,
    `--with-openssl=${brewPrefix}/opt/openssl@3`,
    '--with-pdo-sqlite',
    '--with-sodium',
    '--with-sqlite3',
    '--with-xsl',
    '--with-zlib',
    '--with-zip',
    '--with-pear',
    '--with-external-pcre',
    // GD options
    `--with-freetype=${brewPrefix}/opt/freetype`,
    `--with-jpeg=${brewPrefix}/opt/jpeg`,
    `--with-webp=${brewPrefix}/opt/webp`,
    // Build options
    '--with-pic',
    '--with-layout=GNU',
    '--disable-dtrace',
    '--enable-dtrace',
  ]

  // Environment variables
  const buildEnv: Record<string, string> = {
    ...process.env as Record<string, string>,
    PKG_CONFIG_PATH: pkgConfigPath,
    PATH: `${brewPrefix}/opt/bison/bin:${brewPrefix}/opt/re2c/bin:${process.env.PATH}`,
    LDFLAGS: `-L${brewPrefix}/lib -L${brewPrefix}/opt/openssl@3/lib -L${brewPrefix}/opt/libpq/lib`,
    CPPFLAGS: `-I${brewPrefix}/include -I${brewPrefix}/opt/openssl@3/include -I${brewPrefix}/opt/libpq/include`,
    CC: 'clang',
    CXX: 'clang++',
  }

  // Configure
  console.log(`\n🔧 Configuring PHP...`)
  console.log(`   Extensions: PDO MySQL, PDO PostgreSQL, mysqli, pgsql`)

  const configureCmd = `./configure ${configureArgs.join(' ')}`
  execSync(configureCmd, {
    cwd: buildDir,
    env: buildEnv,
    stdio: 'inherit',
    shell: '/bin/bash',
  })

  // Build
  const cpuCount = require('os').cpus().length
  console.log(`\n🔨 Building PHP (using ${cpuCount} cores)...`)
  execSync(`make -j${cpuCount}`, {
    cwd: buildDir,
    env: buildEnv,
    stdio: 'inherit'
  })

  // Install
  console.log(`\n📁 Installing...`)
  execSync('make install', {
    cwd: buildDir,
    env: buildEnv,
    stdio: 'inherit'
  })

  // Verify extensions
  console.log(`\n✅ Verifying extensions...`)
  const phpBin = join(installDir, 'bin', 'php')

  try {
    const modules = execSync(`${phpBin} -m`, { encoding: 'utf-8' })

    const requiredExtensions = ['PDO', 'pdo_mysql', 'pdo_pgsql', 'mysqli', 'pgsql']
    const missing: string[] = []

    for (const ext of requiredExtensions) {
      if (modules.includes(ext)) {
        console.log(`   ✓ ${ext}`)
      } else {
        console.log(`   ✗ ${ext} (MISSING!)`)
        missing.push(ext)
      }
    }

    if (missing.length > 0) {
      console.error(`\n❌ Missing extensions: ${missing.join(', ')}`)
    }
  } catch (error) {
    console.error('   Failed to verify extensions')
  }

  // Show PHP version
  try {
    const versionInfo = execSync(`${phpBin} --version`, { encoding: 'utf-8' })
    console.log(`\n${versionInfo}`)
  } catch {}

  // Create tarball
  console.log(`\n📦 Creating tarball...`)
  const artifactDir = join(artifactsDir, `php.net-${version}-${platform}`)
  mkdirSync(artifactDir, { recursive: true })

  const tarball = `php.net-${version}.tar.gz`
  execSync(`cd "${installDir}" && tar -czf "${join(artifactDir, tarball)}" .`)
  execSync(`cd "${artifactDir}" && shasum -a 256 "${tarball}" > "${tarball}.sha256"`)

  const tarballPath = join(artifactDir, tarball)
  const tarballSize = require('fs').statSync(tarballPath).size
  console.log(`   Created: ${tarball} (${(tarballSize / 1024 / 1024).toFixed(2)} MB)`)

  // Cleanup build dir (keep install for debugging if needed)
  if (!keepBuild) {
    rmSync(buildDir, { recursive: true, force: true })
  }

  return artifactsDir
}

async function uploadToS3(artifactsDir: string, version: string, bucket: string, region: string): Promise<void> {
  console.log(`\n☁️  Uploading to S3...`)

  execSync(
    `bun scripts/upload-to-s3.ts --package "php.net" --version "${version}" --artifacts-dir "${artifactsDir}" --bucket "${bucket}" --region "${region}"`,
    { stdio: 'inherit', cwd: process.cwd() }
  )
}

async function main() {
  const { values } = parseArgs({
    options: {
      version: { type: 'string', short: 'v', default: '8.4.17' },
      bucket: { type: 'string', short: 'b' },
      region: { type: 'string', short: 'r', default: 'us-east-1' },
      'skip-upload': { type: 'boolean', default: false },
      'keep-build': { type: 'boolean', default: false },
      'install-deps': { type: 'boolean', default: false },
      help: { type: 'boolean', short: 'h' },
    },
    strict: true,
  })

  if (values.help) {
    console.log(`
Quick PHP PoC Build

Builds PHP with MySQL/PostgreSQL extensions using Homebrew dependencies.
Much faster than bootstrapping everything from source!

Usage:
  bun scripts/quick-php-poc.ts [options]

Options:
  -v, --version <version>   PHP version (default: 8.4.17)
  -b, --bucket <name>       S3 bucket for upload (optional)
  -r, --region <region>     AWS region (default: us-east-1)
  --skip-upload             Build only, don't upload to S3
  --keep-build              Keep build directory for debugging
  --install-deps            Auto-install missing Homebrew packages
  -h, --help                Show this help

Examples:
  # Build PHP 8.4.17 (no upload)
  bun scripts/quick-php-poc.ts --skip-upload

  # Build and upload to S3
  bun scripts/quick-php-poc.ts -v 8.4.17 -b my-bucket

  # Auto-install missing deps
  bun scripts/quick-php-poc.ts --install-deps --skip-upload

Extensions included:
  - PDO MySQL (mysqlnd driver)
  - PDO PostgreSQL
  - mysqli (mysqlnd driver)
  - pgsql
`)
    process.exit(0)
  }

  const version = values.version || '8.4.17'

  console.log('🐘 PHP Quick PoC Build')
  console.log('='.repeat(60))
  console.log(`   Version: ${version}`)
  console.log(`   Platform: ${detectPlatform()}`)

  // Check Homebrew dependencies
  const { missing, installed } = checkBrewPackages()
  console.log(`   ✓ ${installed.length} packages installed`)

  if (missing.length > 0) {
    console.log(`   ✗ ${missing.length} packages missing: ${missing.join(', ')}`)

    if (values['install-deps']) {
      installMissingPackages(missing)
    } else {
      console.log('\n❌ Missing Homebrew packages. Run with --install-deps to auto-install, or:')
      console.log(`   brew install ${missing.join(' ')}`)
      process.exit(1)
    }
  }

  // Build PHP
  const artifactsDir = await buildPhp({
    version,
    bucket: values.bucket,
    region: values.region || 'us-east-1',
    skipUpload: values['skip-upload'] || false,
    keepBuild: values['keep-build'] || false,
  })

  // Upload to S3
  if (!values['skip-upload'] && values.bucket) {
    await uploadToS3(artifactsDir, version, values.bucket, values.region || 'us-east-1')
  } else if (!values['skip-upload'] && !values.bucket) {
    console.log('\n⚠️  No bucket specified, skipping upload. Use -b <bucket> to upload.')
  }

  console.log('\n' + '='.repeat(60))
  console.log('✅ Done!')
  console.log('='.repeat(60))
  console.log(`\nArtifacts: ${artifactsDir}`)
  console.log(`\nTo test the build:`)
  console.log(`   /tmp/php-poc-install/${version}/bin/php --version`)
  console.log(`   /tmp/php-poc-install/${version}/bin/php -m | grep -E 'pdo|mysql|pgsql'`)
}

main().catch((error) => {
  console.error('\n❌ Build failed:', error.message)
  process.exit(1)
})
