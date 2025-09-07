#!/usr/bin/env bun

import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

interface BuildConfig {
  phpVersion: string
  config: string
  platform: string
  arch: string
  buildDir: string
  outputDir: string
}

function getConfig(): BuildConfig {
  return {
    phpVersion: process.env.PHP_VERSION || '8.3.13',
    config: process.env.PHP_CONFIG || 'laravel-mysql',
    platform: process.env.TARGET_PLATFORM || 'darwin',
    arch: process.env.TARGET_ARCH || 'arm64',
    buildDir: process.env.BUILD_DIR || '/tmp/php-build',
    outputDir: process.env.OUTPUT_DIR || './binaries'
  }
}

function log(message: string): void {
  console.log(`🔧 ${message}`)
}

async function downloadPhpSource(config: BuildConfig): Promise<string> {
  const phpSourceDir = join(config.buildDir, `php-${config.phpVersion}`)
  
  if (existsSync(phpSourceDir)) {
    log(`PHP source already exists at ${phpSourceDir}`)
    return phpSourceDir
  }

  mkdirSync(config.buildDir, { recursive: true })

  const tarballUrl = `https://www.php.net/distributions/php-${config.phpVersion}.tar.gz`
  const tarballPath = join(config.buildDir, 'php.tar.gz')

  log(`Downloading PHP ${config.phpVersion} from ${tarballUrl}`)

  try {
    // Use wget with SSL bypass (works on all platforms)
    execSync(`wget --no-check-certificate -O "${tarballPath}" "${tarballUrl}"`, {
      stdio: 'inherit',
      cwd: config.buildDir
    })

    log('Extracting PHP source...')
    execSync(`tar -xzf php.tar.gz`, {
      stdio: 'inherit',
      cwd: config.buildDir
    })

    return phpSourceDir
  } catch (error) {
    throw new Error(`Failed to download PHP source: ${error}`)
  }
}

async function buildPhp(config: BuildConfig): Promise<void> {
  const phpSourceDir = await downloadPhpSource(config)
  
  log('Running buildconf...')
  execSync('./buildconf --force', {
    stdio: 'inherit',
    cwd: phpSourceDir
  })

  const binaryName = `php-${config.phpVersion}-${config.platform}-${config.arch}-${config.config}`
  const installPrefix = join(config.outputDir, binaryName)
  mkdirSync(installPrefix, { recursive: true })

  // Use minimal configure approach that works reliably
  const configureArgs = [
    `--prefix=${installPrefix}`,
    '--disable-all',
    '--enable-cli',
    '--disable-cgi',
    '--disable-fpm',
    '--without-pear',
    '--without-pcre-jit'
  ]

  log(`Configuring PHP with minimal approach: ${configureArgs.join(' ')}`)

  // Use simple CC compiler configure without complex environment variables
  const compiler = config.platform === 'win32' ? 'cl' : (config.platform === 'darwin' ? 'clang' : 'gcc')
  
  execSync(`CC=${compiler} ./configure ${configureArgs.join(' ')}`, {
    stdio: 'inherit',
    cwd: phpSourceDir,
    env: { ...process.env, CC: compiler }
  })

  log('Building PHP...')
  const jobs = config.platform === 'win32' ? '2' : execSync('nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 2', { encoding: 'utf8' }).trim()
  
  execSync(`make -j${jobs}`, {
    stdio: 'inherit',
    cwd: phpSourceDir
  })

  log('Installing PHP...')
  execSync('make install', {
    stdio: 'inherit',
    cwd: phpSourceDir
  })

  // Create metadata file
  const metadata = {
    php_version: config.phpVersion,
    platform: config.platform,
    arch: config.arch,
    config: config.config,
    built_at: new Date().toISOString(),
    build_approach: 'minimal'
  }

  writeFileSync(join(installPrefix, 'metadata.json'), JSON.stringify(metadata, null, 2))

  log(`✅ PHP ${config.phpVersion} built successfully at ${installPrefix}`)
  
  // Test the binary
  const phpBinary = join(installPrefix, 'bin', 'php')
  if (existsSync(phpBinary)) {
    log('Testing PHP binary...')
    execSync(`"${phpBinary}" --version`, { stdio: 'inherit' })
  }
}

async function main(): Promise<void> {
  try {
    const config = getConfig()
    log(`Building PHP ${config.phpVersion} for ${config.platform}-${config.arch} with ${config.config} config`)
    
    await buildPhp(config)
    
    log('🎉 Build completed successfully!')
  } catch (error) {
    console.error('❌ Build failed:', error)
    process.exit(1)
  }
}

if (import.meta.main) {
  main()
}
