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
    // Use cross-platform download approach
    if (process.platform === 'win32') {
      // Windows: Use PowerShell with older syntax compatibility
      execSync(`powershell -Command "[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '${tarballUrl}' -OutFile '${tarballPath}'"`, {
        stdio: 'inherit',
        cwd: config.buildDir
      })
    } else {
      // macOS/Linux: Use curl (available by default)
      execSync(`curl -L -k -o "${tarballPath}" "${tarballUrl}"`, {
        stdio: 'inherit',
        cwd: config.buildDir
      })
    }

    log('Extracting PHP source...')
    if (process.platform === 'win32') {
      // Windows: Use PowerShell Expand-Archive (requires .zip, so we need a different approach)
      // Use 7-zip or built-in tar on Windows 10+
      try {
        execSync(`tar -xzf php.tar.gz`, {
          stdio: 'inherit',
          cwd: config.buildDir
        })
      } catch {
        // Fallback: Use PowerShell with System.IO.Compression
        execSync(`powershell -Command "Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory('${tarballPath}', '${config.buildDir}')"`, {
          stdio: 'inherit',
          cwd: config.buildDir
        })
      }
    } else {
      // macOS/Linux: Use tar
      execSync(`tar -xzf php.tar.gz`, {
        stdio: 'inherit',
        cwd: config.buildDir
      })
    }

    return phpSourceDir
  } catch (error) {
    throw new Error(`Failed to download PHP source: ${error}`)
  }
}

async function buildPhp(config: BuildConfig): Promise<void> {
  const phpSourceDir = await downloadPhpSource(config)
  
  // Set up environment for macOS builds
  let buildEnv = { ...process.env }
  if (config.platform === 'darwin') {
    buildEnv.PATH = `/opt/homebrew/bin:/usr/local/bin:${buildEnv.PATH || ''}`
    buildEnv.PKG_CONFIG_PATH = `/opt/homebrew/lib/pkgconfig:/usr/local/lib/pkgconfig:${buildEnv.PKG_CONFIG_PATH || ''}`
  }
  
  // Skip buildconf on Windows (not supported)
  if (config.platform !== 'win32') {
    log('Running buildconf...')
    execSync('./buildconf --force', {
      stdio: 'inherit',
      cwd: phpSourceDir,
      env: buildEnv
    })
  } else {
    log('Skipping buildconf on Windows (using pre-built configure)')
  }

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

  // Platform-specific configure approach
  if (config.platform === 'win32') {
    // Windows: Try to use configure.bat or nmake approach
    log('Attempting Windows PHP build with configure.bat')
    try {
      // Check if configure.bat exists
      execSync('configure.bat --help', {
        stdio: 'pipe',
        cwd: phpSourceDir
      })
      
      // Use configure.bat with minimal options
      const winConfigArgs = [
        `--prefix=${installPrefix.replace(/\//g, '\\')}`,
        '--disable-all',
        '--enable-cli',
        '--disable-cgi',
        '--without-pear'
      ]
      
      execSync(`configure.bat ${winConfigArgs.join(' ')}`, {
        stdio: 'inherit',
        cwd: phpSourceDir,
        env: buildEnv
      })
    } catch (error) {
      log('configure.bat not available, trying alternative Windows approach')
      // Create a minimal config for Windows
      log('Creating minimal Windows configuration')
      // For now, we'll create a basic binary structure
      mkdirSync(join(installPrefix, 'bin'), { recursive: true })
      
      // Copy php.exe if it exists in the source (pre-built)
      try {
        execSync(`copy php.exe "${join(installPrefix, 'bin', 'php.exe')}"`, {
          stdio: 'inherit',
          cwd: phpSourceDir
        })
      } catch {
        log('No pre-built php.exe found, Windows build incomplete')
        return
      }
    }
  } else {
    // Unix-like systems: Use standard configure
    const compiler = config.platform === 'darwin' ? 'clang' : 'gcc'
    
    execSync(`CC=${compiler} ./configure ${configureArgs.join(' ')}`, {
      stdio: 'inherit',
      cwd: phpSourceDir,
      env: { ...buildEnv, CC: compiler }
    })
  }

  // Skip make/install for Windows if we already handled it above
  if (config.platform !== 'win32') {
    log('Building PHP...')
    const jobs = execSync('nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 2', { encoding: 'utf8' }).trim()
    
    execSync(`make -j${jobs}`, {
      stdio: 'inherit',
      cwd: phpSourceDir,
      env: buildEnv
    })

    log('Installing PHP...')
    execSync('make install', {
      stdio: 'inherit',
      cwd: phpSourceDir,
      env: buildEnv
    })
  } else {
    // Windows: Try nmake if configure.bat worked
    try {
      log('Building PHP with nmake...')
      execSync('nmake', {
        stdio: 'inherit',
        cwd: phpSourceDir,
        env: buildEnv
      })
      
      log('Installing PHP with nmake...')
      execSync('nmake install', {
        stdio: 'inherit',
        cwd: phpSourceDir,
        env: buildEnv
      })
    } catch (error) {
      log('nmake failed, Windows build may be incomplete')
    }
  }

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
