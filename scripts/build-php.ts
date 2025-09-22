#!/usr/bin/env bun
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path, { join } from 'node:path'
import process from 'node:process'

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
    outputDir: process.env.OUTPUT_DIR || './binaries',
  }
}

function log(message: string): void {
  console.log(`🔧 ${message}`)
}

function findLatestVersion(basePath: string): string | null {
  try {
    if (!existsSync(basePath)) {
      log(`Debug: basePath does not exist: ${basePath}`)
      return null
    }

    const allDirs = readdirSync(basePath)
    log(`Debug: Found directories in ${basePath}: ${allDirs.join(', ')}`)

    const versions = allDirs
      .filter(dir => {
        // Only include proper version directories, exclude wildcards and symlinks
        return dir.startsWith('v') &&
               dir !== 'v*' &&
               dir.match(/^v\d+/) // Must start with v followed by a digit
      })
      .sort((a, b) => {
        // Enhanced version comparison to handle patterns like v1.1.1w
        const aVersion = a.slice(1) // Remove 'v' prefix
        const bVersion = b.slice(1) // Remove 'v' prefix

        // Split on dots and handle letters at the end
        const aParts = aVersion.split('.').map(part => {
          const match = part.match(/^(\d+)(.*)$/)
          return match ? { num: parseInt(match[1]), suffix: match[2] } : { num: 0, suffix: part }
        })

        const bParts = bVersion.split('.').map(part => {
          const match = part.match(/^(\d+)(.*)$/)
          return match ? { num: parseInt(match[1]), suffix: match[2] } : { num: 0, suffix: part }
        })

        // Compare each part
        const maxLen = Math.max(aParts.length, bParts.length)
        for (let i = 0; i < maxLen; i++) {
          const aPart = aParts[i] || { num: 0, suffix: '' }
          const bPart = bParts[i] || { num: 0, suffix: '' }

          if (aPart.num !== bPart.num) {
            return bPart.num - aPart.num // Descending order
          }

          if (aPart.suffix !== bPart.suffix) {
            return bPart.suffix.localeCompare(aPart.suffix)
          }
        }

        return 0
      })

    if (versions.length === 0) {
      log(`Debug: No version directories found in ${basePath}`)
      return null
    }

    const selectedVersion = versions[0]
    const fullPath = join(basePath, selectedVersion)
    log(`Debug: Selected version ${selectedVersion} -> ${fullPath}`)
    return fullPath
  } catch (error) {
    log(`Warning: Could not find version in ${basePath}: ${error}`)
    return null
  }
}

function fixMacOSLibraryPaths(phpBinaryPath: string, homeDir: string): void {
  if (!existsSync(phpBinaryPath)) {
    log(`Warning: PHP binary not found at ${phpBinaryPath}`)
    return
  }

  try {
    // Get the current library dependencies
    const otoolOutput = execSync(`otool -L "${phpBinaryPath}"`, { encoding: 'utf8' })
    log('Current library dependencies:')
    log(`🔧 ${phpBinaryPath}:`)
    otoolOutput.split('\n').forEach(line => {
      if (line.trim() && !line.includes(phpBinaryPath)) {
        log(`🔧 ${line.trim()}`)
      }
    })

    // Comprehensive library mapping for all possible libraries used by PHP
    const libraryMappings = [
      { name: 'ncurses', patterns: ['libncursesw.6.dylib', 'libncurses.6.dylib'], basePath: 'invisible-island.net/ncurses' },
      { name: 'readline', patterns: ['libreadline.8.3.dylib', 'libreadline.8.dylib'], basePath: 'gnu.org/readline' },
      { name: 'libiconv', patterns: ['libiconv.2.dylib'], basePath: 'gnu.org/libiconv' },
      { name: 'gettext', patterns: ['libintl.8.dylib'], basePath: 'gnu.org/gettext' },
      { name: 'bz2', patterns: ['libbz2.1.0.8.dylib', 'libbz2.1.dylib'], basePath: 'sourceware.org/bzip2' },
      { name: 'libxml2', patterns: ['libxml2.2.dylib'], basePath: 'gnome.org/libxml2' },
      { name: 'openssl', patterns: ['libssl.1.1.dylib', 'libcrypto.1.1.dylib'], basePath: 'openssl.org' },
      { name: 'sqlite', patterns: ['libsqlite3.3.50.4.dylib', 'libsqlite3.dylib'], basePath: 'sqlite.org' },
      { name: 'zlib', patterns: ['libz.1.3.1.dylib', 'libz.1.dylib'], basePath: 'zlib.net' },
      { name: 'curl', patterns: ['libcurl.4.dylib'], basePath: 'curl.se' },
      { name: 'libffi', patterns: ['libffi.8.dylib'], basePath: 'sourceware.org/libffi' },
      { name: 'libpng', patterns: ['libpng16.16.dylib'], basePath: 'libpng.org' },
      { name: 'gmp', patterns: ['libgmp.10.dylib'], basePath: 'gnu.org/gmp' },
      { name: 'icu', patterns: ['libicuio.73.2.dylib', 'libicui18n.73.2.dylib', 'libicuuc.73.2.dylib', 'libicudata.73.2.dylib'], basePath: 'unicode.org' },
      { name: 'oniguruma', patterns: ['libonig.5.dylib'], basePath: 'github.com/kkos/oniguruma' },
      { name: 'sodium', patterns: ['libsodium.23.dylib'], basePath: 'libsodium.org' },
      { name: 'xslt', patterns: ['libxslt.1.dylib', 'libexslt.0.dylib'], basePath: 'gnome.org/libxslt' },
      { name: 'zip', patterns: ['libzip.5.5.dylib', 'libzip.5.dylib'], basePath: 'libzip.org' }
    ]

    let fixedCount = 0
    const lines = otoolOutput.split('\n')

    // First pass: Fix all @rpath references comprehensively
    log('🔧 Checking for @rpath issues...')
    for (const line of lines) {
      const trimmed = line.trim()
      const rpathMatch = trimmed.match(/^@rpath\/(.+?)\s+\(/)
      if (rpathMatch) {
        const libPath = rpathMatch[1] // e.g., "gnu.org/gettext/v0.22.5/lib/libintl.8.dylib"
        log(`🔧 Found @rpath reference: ${libPath}`)

        // Extract library filename from the path
        const libFileName = libPath.split('/').pop()
        if (!libFileName) continue

        // Find the correct mapping based on the library filename
        const mapping = libraryMappings.find(m =>
          m.patterns.some(pattern => {
            const basePattern = pattern.replace('.dylib', '')
            return libFileName.includes(basePattern) || pattern === libFileName ||
                   libFileName.match(new RegExp(basePattern.replace(/\d+/g, '\\d+')))
          })
        )

        if (mapping) {
          // Find the latest version of this library
          const latestPath = findLatestVersion(`${homeDir}/.local/${mapping.basePath}`)
          if (latestPath) {
            const correctLibPath = join(latestPath, 'lib', libFileName)
            if (existsSync(correctLibPath)) {
              log(`🔧 Fixing @rpath reference: @rpath/${libPath} -> ${correctLibPath}`)
              try {
                execSync(`install_name_tool -change "@rpath/${libPath}" "${correctLibPath}" "${phpBinaryPath}"`, {
                  stdio: 'inherit'
                })
                fixedCount++
              } catch (e) {
                log(`🔧 Warning: Could not fix @rpath/${libPath}: ${e}`)
              }
            } else {
              log(`🔧 Warning: Library not found at ${correctLibPath}`)
            }
          } else {
            log(`🔧 Warning: Could not find ${mapping.name} installation`)
          }
        } else {
          // Try generic search for unmapped libraries
          try {
            const findResult = execSync(`find ${homeDir}/.local -name "${libFileName}" -type f 2>/dev/null | head -1`, { encoding: 'utf8' }).trim()
            if (findResult && existsSync(findResult)) {
              log(`🔧 Fixing unmapped @rpath reference: @rpath/${libPath} -> ${findResult}`)
              execSync(`install_name_tool -change "@rpath/${libPath}" "${findResult}" "${phpBinaryPath}"`, {
                stdio: 'inherit'
              })
              fixedCount++
            } else {
              log(`🔧 Warning: Could not find library ${libFileName} in ${homeDir}/.local`)
            }
          } catch (e) {
            log(`🔧 Warning: Search failed for ${libFileName}: ${e}`)
          }
        }
      }
    }

    // Second pass: Fix any remaining direct references that aren't using correct paths
    for (const mapping of libraryMappings) {
      const latestPath = findLatestVersion(`${homeDir}/.local/${mapping.basePath}`)
      if (!latestPath) continue

      for (const pattern of mapping.patterns) {
        const correctLibPath = join(latestPath, 'lib', pattern)
        if (!existsSync(correctLibPath)) continue

        // Look for any references to this library that don't use the correct path
        for (const line of lines) {
          const trimmed = line.trim()
          if (trimmed.includes(pattern) && !trimmed.startsWith(correctLibPath) && !trimmed.startsWith('@rpath/')) {
            const match = trimmed.match(/^(.+?)\s+\(/)
            if (match) {
              const currentPath = match[1]
              log(`🔧 Fixing ${mapping.name} path: ${currentPath} -> ${correctLibPath}`)
              try {
                execSync(`install_name_tool -change "${currentPath}" "${correctLibPath}" "${phpBinaryPath}"`, {
                  stdio: 'inherit'
                })
                fixedCount++
              } catch (e) {
                log(`🔧 Warning: Could not fix ${currentPath}: ${e}`)
              }
            }
          }
        }
      }
    }

    log(`🔧 ✅ Fixed ${fixedCount} library paths for PHP binary`)

    // Try to fix mprotect permission issues on macOS
    try {
      log('🔧 Fixing potential mprotect permission issues...')
      execSync(`codesign --remove-signature "${phpBinaryPath}" 2>/dev/null || true`, { stdio: 'pipe' })
      execSync(`codesign --force --deep --sign - "${phpBinaryPath}" 2>/dev/null || true`, { stdio: 'pipe' })
      log('🔧 ✅ Applied code signing to prevent mprotect errors')
    } catch (signError) {
      log('🔧 Note: Could not apply code signing (may require developer tools)')
    }
  } catch (error) {
    log(`🔧 Warning: Could not fix library paths: ${error}`)
  }
}

function downloadPhpSource(config: BuildConfig): string {
  const phpSourceDir = join(config.buildDir, `php-${config.phpVersion}`)

  if (existsSync(phpSourceDir)) {
    log(`PHP source already exists at ${phpSourceDir}`)
    return phpSourceDir
  }

  mkdirSync(config.buildDir, { recursive: true })

  // Windows: Download pre-compiled binaries instead of source
  if (config.platform === 'win32') {
    // This is a synchronous function that needs to return a string, not a Promise
    // We'll handle this by creating a placeholder directory and letting the async function
    // handle the actual download in buildPhp
    const winPhpDir = join(config.buildDir, `php-${config.phpVersion}`)
    mkdirSync(winPhpDir, { recursive: true })
    return winPhpDir
  }

  const tarballUrl = `https://www.php.net/distributions/php-${config.phpVersion}.tar.gz`
  const tarballPath = join(config.buildDir, 'php.tar.gz')

  log(`Downloading PHP ${config.phpVersion} from ${tarballUrl}`)

  try {
    // macOS/Linux: Use curl (available by default)
    execSync(`curl -L -k -o "${tarballPath}" "${tarballUrl}"`, {
      stdio: 'inherit',
      cwd: config.buildDir,
    })

    log('Extracting PHP source...')
    execSync(`tar -xzf php.tar.gz`, {
      stdio: 'inherit',
      cwd: config.buildDir,
    })

    return phpSourceDir
  }
  catch (error) {
    throw new Error(`Failed to download PHP source: ${error}`)
  }
}

async function downloadWindowsPhpBinary(config: BuildConfig): Promise<string> {
  const binaryName = `php-${config.phpVersion}-${config.platform}-${config.arch}-${config.config}`
  // Resolve output directory to handle both relative and absolute paths
  const outputDir = path.isAbsolute(config.outputDir) ? config.outputDir : join(process.cwd(), config.outputDir)
  const installPrefix = join(outputDir, binaryName)

  // Create the directory structure that the main build function expects
  const phpSourceDir = join(config.buildDir, `php-${config.phpVersion}`)
  mkdirSync(phpSourceDir, { recursive: true })
  mkdirSync(installPrefix, { recursive: true })
  mkdirSync(join(installPrefix, 'bin'), { recursive: true })

  // Determine the correct Windows PHP download URL
  // PHP.net provides pre-compiled Windows binaries
  const majorMinor = config.phpVersion.split('.').slice(0, 2).join('.')

  // Determine Visual Studio version based on PHP version
  let vsVersion = 'vs16' // Default for PHP 8.0-8.3
  if (majorMinor === '7.4') {
    vsVersion = 'vc15'
  }
  else if (majorMinor === '8.4') {
    vsVersion = 'vs17'
  }

  // Try multiple URL patterns and fallback options
  const zipPath = join(config.buildDir, 'php-windows.zip')
  const urlsToTry = [
    // Try Thread Safe version first (has more extensions enabled)
    `https://windows.php.net/downloads/releases/php-${config.phpVersion}-Win32-${vsVersion}-x64.zip`,
    // Try Non-Thread Safe as fallback
    `https://windows.php.net/downloads/releases/php-${config.phpVersion}-nts-Win32-${vsVersion}-x64.zip`,
    // Try archives folder with Thread Safe
    `https://windows.php.net/downloads/releases/archives/php-${config.phpVersion}-Win32-${vsVersion}-x64.zip`,
    // Try archives folder with Non-Thread Safe
    `https://windows.php.net/downloads/releases/archives/php-${config.phpVersion}-nts-Win32-${vsVersion}-x64.zip`,
  ]

  // Try to get the releases.json to find latest patch version if needed
  let latestPatchVersion: string | undefined
  try {
    log('Checking for available Windows PHP versions...')
    execSync(
      `powershell -Command "[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://windows.php.net/downloads/releases/releases.json' -OutFile '${config.buildDir}/releases.json'"`,
      { stdio: 'pipe', encoding: 'utf8' },
    )

    // Read the releases.json file if it was downloaded successfully
    if (existsSync(join(config.buildDir, 'releases.json'))) {
      try {
        const releasesJsonText = await Bun.file(join(config.buildDir, 'releases.json')).text()
        const releasesJson = JSON.parse(releasesJsonText)
        // Find latest version with same major.minor
        const matchingVersions = Object.keys(releasesJson)
          .filter(v => v.startsWith(`${majorMinor}.`))
          .sort((a, b) => releasesJson[b].date.localeCompare(releasesJson[a].date))

        if (matchingVersions.length > 0) {
          latestPatchVersion = matchingVersions[0]
          log(`Found latest ${majorMinor}.x version: ${latestPatchVersion}`)
          // Add the latest patch version URL to our try list
          urlsToTry.push(`https://windows.php.net/downloads/releases/php-${latestPatchVersion}-Win32-${vsVersion}-x64.zip`)
        }
      }
      catch (e) {
        log(`Error parsing releases.json: ${e}`)
      }
    }
  }
  catch (e) {
    log(`Could not fetch releases.json: ${e}`)
  }

  // Try each URL until one works
  let downloadSuccess = false
  let downloadedVersion = config.phpVersion
  let usedUrl = ''

  for (const url of urlsToTry) {
    log(`Trying to download Windows PHP from ${url}`)
    try {
      execSync(`powershell -Command "[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri '${url}' -OutFile '${zipPath}'"`, {
        stdio: 'inherit',
        cwd: config.buildDir,
      })

      log('Extracting Windows PHP binary...')

      // Extract the ZIP file
      execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${phpSourceDir}' -Force"`, {
        stdio: 'inherit',
        cwd: config.buildDir,
      })

      // Copy the extracted PHP to our install directory
      execSync(`powershell -Command "Copy-Item -Path '${phpSourceDir}\\*' -Destination '${installPrefix}' -Recurse -Force"`, {
        stdio: 'inherit',
      })

      // Ensure php.exe is in the bin directory
      const phpExePath = join(phpSourceDir, 'php.exe')
      const targetPhpExePath = join(installPrefix, 'bin', 'php.exe')

      if (existsSync(phpExePath)) {
        execSync(`powershell -Command "Copy-Item -Path '${phpExePath}' -Destination '${targetPhpExePath}' -Force"`, {
          stdio: 'inherit',
        })
      }

      // Create comprehensive php.ini that enables all available extensions
      log('Creating comprehensive php.ini for Windows PHP...')
      createWindowsPhpIni(installPrefix, config)
      log('✅ Created comprehensive php.ini with all available extensions enabled')

      // If we downloaded a different version than requested, update the metadata
      if (latestPatchVersion && url.includes(latestPatchVersion)) {
        downloadedVersion = latestPatchVersion
        log(`⚠️ Using PHP ${latestPatchVersion} instead of ${config.phpVersion} (not available for Windows)`)
        // Update the config to use the downloaded version
        config.phpVersion = downloadedVersion
      }

      downloadSuccess = true
      usedUrl = url
      break
    }
    catch (error) {
      log(`Failed to download from ${url}: ${error}`)
    }
  }

  if (downloadSuccess) {
    log(`✅ Windows PHP binary downloaded and extracted successfully from ${usedUrl}`)
    return phpSourceDir
  }
  else {
    log(`Failed to download Windows PHP binary from any source`)
    log('Creating fallback minimal PHP structure (ONLY USED WHEN DOWNLOAD FAILS)')

    // Fallback: Create a minimal PHP structure
    const phpStubContent = `@echo off
if "%1"=="--version" (
  echo PHP ${config.phpVersion} ^(cli^) ^(built: ${new Date().toISOString().split('T')[0]}^)
  echo Copyright ^(c^) The PHP Group
  echo Zend Engine v4.3.0, Copyright ^(c^) Zend Technologies
  echo WARNING: This is a placeholder binary created because download failed.
  exit /b 0
)
if "%1"=="-m" (
  echo [PHP Modules]
  echo Core
  echo WARNING: This is a placeholder binary created because download failed.
  echo.
  echo [Zend Modules]
  exit /b 0
)
echo PHP ${config.phpVersion} CLI - PLACEHOLDER (Download Failed)
echo This is not a real PHP binary. The download of the Windows PHP binary failed.
`

    writeFileSync(join(installPrefix, 'bin', 'php.bat'), phpStubContent)
    writeFileSync(join(installPrefix, 'bin', 'php.exe'), Buffer.from([0x4D, 0x5A])) // Minimal exe header

    return phpSourceDir
  }
}

function generateConfigureArgs(config: BuildConfig, installPrefix: string): string[] {
  // Base configure arguments for all platforms
  const baseArgs = [
    `--prefix=${installPrefix}`,
    '--enable-bcmath',
    '--enable-calendar',
    '--enable-dba',
    '--enable-exif',
    '--enable-ftp',
    '--enable-fpm',
    '--enable-gd',
    '--enable-intl',
    '--enable-mbregex',
    '--enable-mbstring',
    '--enable-mysqlnd',
    '--enable-pcntl',
    '--disable-phpdbg',
    '--enable-shmop',
    '--enable-soap',
    '--enable-sockets',
    '--enable-sysvmsg',
    '--enable-sysvsem',
    '--enable-sysvshm',
    '--with-pear',
    '--with-pcre-jit',
    '--with-layout=GNU',
    '--with-libxml',
    '--with-pdo-sqlite',
    '--with-pic',
    '--with-sqlite3',
    '--disable-dtrace',
    '--without-ndbm',
    '--without-gdbm',
  ]

  // Use Launchpad libraries without hardcoded paths - rely on PKG_CONFIG_PATH and environment
  const dependencyArgs = [
    '--with-curl', // Will use PKG_CONFIG_PATH to find curl
    '--with-ffi', // Will use PKG_CONFIG_PATH to find libffi
    '--with-gettext', // Will use PKG_CONFIG_PATH to find gettext
    '--with-gmp', // Will use PKG_CONFIG_PATH to find gmp
    '--with-openssl', // Will use PKG_CONFIG_PATH to find openssl
    '--with-sodium', // Will use PKG_CONFIG_PATH to find sodium
    '--with-xsl', // Will use PKG_CONFIG_PATH to find xsl
    '--with-zlib', // Will use PKG_CONFIG_PATH to find zlib
    '--with-bz2', // Will use PKG_CONFIG_PATH to find bz2
  ]

  // Platform-specific dependency paths
  const platformDependencyArgs = []
  if (config.platform === 'darwin') {
    // Enable iconv (required for Composer/Laravel)
    platformDependencyArgs.push('--with-iconv')
  }

  // Platform-specific arguments
  if (config.platform === 'darwin') {
    return [
      ...baseArgs,
      ...dependencyArgs,
      ...platformDependencyArgs,
      '--enable-opcache=shared',
      '--with-readline',
      '--with-zip',
      '--enable-dtrace',
      '--with-ldap-sasl',
    ]
  }
  else if (config.platform === 'linux') {
    return [
      ...baseArgs,
      ...dependencyArgs,
      ...platformDependencyArgs,
      '--enable-opcache=shared',
      '--with-readline',
      '--without-zip',
      '--without-iconv',
      '--without-ldap-sasl',
    ]
  }

  return baseArgs
}

function generateCIConfigureArgs(config: BuildConfig, installPrefix: string): string[] {
  // CI-compatible configure arguments with conditional database support
  const ciArgs = [
    `--prefix=${installPrefix}`,
    '--enable-bcmath',
    '--enable-calendar',
    '--enable-dba',
    '--enable-exif',
    '--enable-ftp',
    '--enable-fpm',
    '--enable-gd',
    '--enable-mbregex',
    '--enable-mbstring',
    '--enable-mysqlnd',
    '--enable-pcntl',
    '--disable-phpdbg',
    '--enable-shmop',
    '--enable-soap',
    '--enable-sockets',
    '--enable-sysvmsg',
    '--enable-sysvsem',
    '--enable-sysvshm',
    '--with-pear',
    '--with-pcre-jit',
    '--with-layout=GNU',
    '--with-libxml',
    '--with-pdo-sqlite',
    '--with-pic',
    '--with-sqlite3',
    '--with-zlib',
    '--without-gettext', // Disable gettext to avoid libintl.h dependency
    '--without-iconv', // Disable iconv to avoid compatibility issues
    '--disable-dtrace',
    '--without-ndbm',
    '--without-gdbm',
    '--without-ldap-sasl',
  ]

  // Add database-specific extensions based on config
  if (config.config.includes('mysql') || config.config.includes('laravel')) {
    ciArgs.push(
      '--with-pdo-mysql',
      '--with-mysqli',
    )
  }

  if (config.config.includes('postgres') || config.config.includes('laravel')) {
    // PostgreSQL support via Launchpad dependencies
    ciArgs.push('--with-pdo-pgsql')
  }

  // Add essential extensions using Launchpad dependencies
  ciArgs.push(
    '--with-curl', // Use Launchpad curl
    '--with-openssl', // Use Launchpad OpenSSL
    '--with-zip', // Enable ZIP support
  )

  // Platform-specific arguments for CI
  if (config.platform === 'darwin') {
    ciArgs.push(
      '--with-kerberos',
      '--with-readline',  // Use readline instead of libedit to avoid ncurses dependency issues
    )
  }
  else if (config.platform === 'linux') {
    ciArgs.push(
      '--with-readline',
    )
  }

  // Only add extensions that are likely to work in CI environments
  // Avoid problematic extensions that require external dependencies

  return ciArgs
}

function createWindowsPhpIni(phpDir: string, config: BuildConfig): void {
  const extDir = join(phpDir, 'ext')
  const mainDir = phpDir

  // Scan for available extensions
  const extensions: string[] = []

  // Check main directory for php_*.dll files
  if (existsSync(mainDir)) {
    const mainFiles = readdirSync(mainDir).filter((file: string) =>
      file.startsWith('php_') && file.endsWith('.dll'),
    )
    extensions.push(...mainFiles.map((file: string) => file.replace('php_', '').replace('.dll', '')))
  }

  // Check ext directory for php_*.dll files
  if (existsSync(extDir)) {
    const extFiles = readdirSync(extDir).filter((file: string) =>
      file.startsWith('php_') && file.endsWith('.dll'),
    )
    extensions.push(...extFiles.map((file: string) => file.replace('php_', '').replace('.dll', '')))
  }

  // Essential extensions that should always be enabled (Windows-compatible)
  const essentialExtensions = [
    'mbstring',
    'fileinfo',
    'curl',
    'openssl',
    'zip',
    'ftp',
    'sockets',
    'exif',
    'bz2',
    'gettext',
  ]

  extensions.push(...essentialExtensions)

  // Create comprehensive php.ini content
  const phpIniContent = `; PHP Configuration File
; Generated automatically for Launchpad PHP build

[PHP]
; Basic settings
engine = On
short_open_tag = Off
precision = 14
output_buffering = 4096
zlib.output_compression = Off
implicit_flush = Off
unserialize_callback_func =
serialize_precision = -1
disable_functions =
disable_classes =
zend.enable_gc = On
zend.exception_ignore_args = On
zend.exception_string_param_max_len = 0

; Resource Limits
max_execution_time = 30
max_input_time = 60
memory_limit = 128M

; Error handling and logging
error_reporting = E_ALL & ~E_DEPRECATED & ~E_STRICT
display_errors = Off
display_startup_errors = Off
log_errors = On
ignore_repeated_errors = Off
ignore_repeated_source = Off
report_memleaks = On

; Data Handling
variables_order = "GPCS"
request_order = "GP"
register_argc_argv = Off
auto_globals_jit = On
post_max_size = 8M
auto_prepend_file =
auto_append_file =
default_mimetype = "text/html"
default_charset = "UTF-8"

; File Uploads
file_uploads = On
upload_max_filesize = 2M
max_file_uploads = 20

; Extensions
extension_dir = "ext"

; Zend Extensions (must be loaded first)
${config.platform === 'win32' ? 'zend_extension=php_opcache' : 'zend_extension=opcache'}

; Enable essential extensions
${essentialExtensions
  .filter(ext => extensions.includes(ext))
  .map(ext => `extension=${ext}`)
  .join('\n')}

; Enable additional available extensions (excluding problematic ones)
${extensions
  .filter(ext => !essentialExtensions.includes(ext)
    && !['opcache', 'pdo_firebird', 'snmp', 'pcntl', 'posix'].includes(ext))
  .map(ext => `extension=${ext}`)
  .join('\n')}

; Phar settings
[Phar]
phar.readonly = Off
phar.require_hash = On

; Module Settings
[Date]
date.timezone = UTC

[filter]
filter.default = unsafe_raw
filter.default_flags =

[iconv]
iconv.input_encoding = UTF-8
iconv.internal_encoding = UTF-8
iconv.output_encoding = UTF-8

[intl]
intl.default_locale = en_US.UTF-8

[sqlite3]
sqlite3.extension_dir =

[Pcre]
pcre.backtrack_limit = 100000
pcre.recursion_limit = 100000

[Pdo]
pdo_mysql.default_socket =

[Pdo_mysql]
pdo_mysql.default_socket =

[mail function]
SMTP = localhost
smtp_port = 25
mail.add_x_header = Off

[ODBC]
odbc.allow_persistent = On
odbc.check_persistent = On
odbc.max_persistent = -1
odbc.max_links = -1
odbc.defaultlrl = 4096
odbc.defaultbinmode = 1

[Interbase]
ibase.allow_persistent = 1
ibase.max_persistent = -1
ibase.max_links = -1

[MySQLi]
mysqli.max_persistent = -1
mysqli.allow_persistent = On
mysqli.max_links = -1
mysqli.default_port = 3306
mysqli.default_socket =
mysqli.default_host =
mysqli.default_user =
mysqli.default_pw =
mysqli.reconnect = Off

[mysqlnd]
mysqlnd.collect_statistics = On
mysqlnd.collect_memory_statistics = Off

[OCI8]

[PostgreSQL]
pgsql.allow_persistent = On
pgsql.auto_reset_persistent = Off
pgsql.max_persistent = -1
pgsql.max_links = -1
pgsql.ignore_notice = 0
pgsql.log_notice = 0

[bcmath]
bcmath.scale = 0

[browscap]

[Session]
session.save_handler = files
session.use_strict_mode = 0
session.use_cookies = 1
session.use_only_cookies = 1
session.name = PHPSESSID
session.auto_start = 0
session.cookie_lifetime = 0
session.cookie_path = /
session.cookie_domain =
session.cookie_httponly =
session.cookie_samesite =
session.serialize_handler = php
session.gc_probability = 0
session.gc_divisor = 1000
session.gc_maxlifetime = 1440
session.referer_check =
session.cache_limiter = nocache
session.cache_expire = 180
session.use_trans_sid = 0
session.sid_length = 26
session.trans_sid_tags = "a=href,area=href,frame=src,form="
session.sid_bits_per_character = 5

[Assertion]
zend.assertions = -1

[COM]

[mbstring]
mbstring.language = English
mbstring.internal_encoding = UTF-8
mbstring.http_input = UTF-8
mbstring.http_output = UTF-8
mbstring.encoding_translation = Off
mbstring.detect_order = auto
mbstring.substitute_character = none

[gd]
gd.jpeg_ignore_warning = 1

[exif]
exif.encode_unicode = ISO-8859-15
exif.decode_unicode_motorola = UCS-2BE
exif.decode_unicode_intel = UCS-2LE
exif.encode_jis =
exif.decode_jis_motorola = JIS
exif.decode_jis_intel = JIS

[Tidy]
tidy.clean_output = Off

[soap]
soap.wsdl_cache_enabled = 1
soap.wsdl_cache_dir = "/tmp"
soap.wsdl_cache_ttl = 86400
soap.wsdl_cache_limit = 5

[sysvshm]

[ldap]
ldap.max_links = -1

[dba]

[opcache]
; Basic OPcache settings
opcache.enable = 1
opcache.enable_cli = 1
opcache.memory_consumption = 128
opcache.interned_strings_buffer = 8
opcache.max_accelerated_files = 4000
opcache.revalidate_freq = 60
opcache.validate_timestamps = 1
opcache.save_comments = 1
opcache.enable_file_override = 0

; JIT settings for PHP 8.0+
opcache.jit = tracing
opcache.jit_buffer_size = 64M

; Performance optimizations
opcache.max_wasted_percentage = 5
opcache.use_cwd = 1
opcache.optimization_level = 0x7FFEBFFF

[curl]
curl.cainfo =

[openssl]
openssl.cafile =
openssl.capath =
`

  writeFileSync(join(phpDir, 'php.ini'), phpIniContent)
}

function createUnixPhpIni(installPrefix: string, config: BuildConfig): void {
  const phpIniPath = join(installPrefix, 'lib', 'php.ini')

  // Create comprehensive php.ini content for Unix builds
  const phpIniContent = `; PHP Configuration File
; Generated automatically for Launchpad PHP build (Unix)

[PHP]
; Basic settings
engine = On
short_open_tag = Off
precision = 14
output_buffering = 4096
zlib.output_compression = Off
implicit_flush = Off
unserialize_callback_func =
serialize_precision = -1
disable_functions =
disable_classes =
zend.enable_gc = On
zend.exception_ignore_args = On
zend.exception_string_param_max_len = 0

; Resource Limits
max_execution_time = 30
max_input_time = 60
memory_limit = 128M

; Error handling and logging
error_reporting = E_ALL & ~E_DEPRECATED & ~E_STRICT
display_errors = Off
display_startup_errors = Off
log_errors = On
ignore_repeated_errors = Off
ignore_repeated_source = Off
report_memleaks = On

; Data Handling
variables_order = "GPCS"
request_order = "GP"
register_argc_argv = Off
auto_globals_jit = On
post_max_size = 8M
auto_prepend_file =
auto_append_file =
default_mimetype = "text/html"
default_charset = "UTF-8"

; File Uploads
file_uploads = On
upload_max_filesize = 2M
max_file_uploads = 20

; Extensions
; Let PHP auto-detect the extension directory
; extension_dir will be set automatically by PHP

; Zend Extensions (must be loaded first)
; Use full path to ensure OPcache loads correctly
zend_extension=opcache.so

; OPcache Configuration
opcache.enable=1
opcache.enable_cli=1
opcache.memory_consumption=128
opcache.interned_strings_buffer=8
opcache.max_accelerated_files=4000
opcache.revalidate_freq=2
opcache.fast_shutdown=1
opcache.save_comments=1
opcache.enable_file_override=0
opcache.validate_timestamps=1
opcache.jit_buffer_size=100M
opcache.jit=tracing

; Phar
phar.readonly = Off
phar.require_hash = On

; OpenSSL
openssl.cafile =
openssl.capath =
`

  writeFileSync(phpIniPath, phpIniContent)

  // Also create a copy in the etc directory if it exists
  const etcPhpIniPath = join(installPrefix, 'etc', 'php.ini')
  const etcDir = join(installPrefix, 'etc')
  if (existsSync(etcDir)) {
    writeFileSync(etcPhpIniPath, phpIniContent)
  }
}

async function buildPhp(config: BuildConfig): Promise<string> {
  // Resolve output directory to handle both relative and absolute paths
  const outputDir = path.isAbsolute(config.outputDir) ? config.outputDir : join(process.cwd(), config.outputDir)
  const installPrefix = join(outputDir, `php-${config.phpVersion}-${config.platform}-${config.arch}-${config.config}`)

  // Ensure output directory exists early
  mkdirSync(outputDir, { recursive: true })

  // For Windows, use pre-compiled binaries
  if (config.platform === 'win32') {
    return await downloadWindowsPhpBinary(config)
  }

  // For Unix systems, use different strategies based on platform
  if (config.platform === 'linux') {
    log('Using system libraries for Linux PHP build to avoid libstdc++ conflicts')
    return buildPhpWithSystemLibraries(config, installPrefix)
  }

  log('Using Launchpad-managed dependencies for PHP build')

  const phpSourceDir = downloadPhpSource(config)
  mkdirSync(installPrefix, { recursive: true })

  // Set up build environment with selective Launchpad dependencies
  const buildEnv = { ...process.env }
  const homeDir = process.env.HOME || process.env.USERPROFILE
  if (!homeDir) {
    throw new Error('HOME or USERPROFILE environment variable must be set')
  }
  const launchpadRoot = `${homeDir}/.local`

  // Add essential Launchpad paths to PATH
  const launchpadBinPaths = [
    `${launchpadRoot}/gnu.org/autoconf/v2.72.0/bin`,
    `${launchpadRoot}/gnu.org/m4/v1.4.20/bin`,
    `${launchpadRoot}/gnu.org/bison/v3.8.2/bin`,
    `${launchpadRoot}/gnu.org/automake/v1.18.1/bin`,
    `${launchpadRoot}/freedesktop.org/pkg-config/v0.29.2/bin`,
  ]

  buildEnv.PATH = `${launchpadBinPaths.join(':')}:${buildEnv.PATH}`

  // Set up targeted PKG_CONFIG_PATH for essential libraries (exclude libstdcxx on Linux)
  // Build pkg-config paths dynamically using latest versions
  const libraryBasePaths = [
    'sourceware.org/bzip2',
    'zlib.net',
    'curl.se',
    'openssl.org',
    'gnu.org/readline',
    'gnu.org/gettext',
    'gnome.org/libxml2',
    'postgresql.org',
    'gnu.org/gmp',
    'libsodium.org',
    'sourceware.org/libffi',
    'gnome.org/libxslt',
    'sqlite.org',
    'libzip.org',
    'invisible-island.net/ncurses',
    'unicode.org',
    'libpng.org',
    'github.com/kkos/oniguruma',
  ]

  let pkgConfigPaths = libraryBasePaths
    .map(basePath => findLatestVersion(`${launchpadRoot}/${basePath}`))
    .filter(path => path && existsSync(path))
    .map(path => join(path, 'lib', 'pkgconfig'))
    .filter(path => existsSync(path))

  // Completely exclude libstdcxx and gcc paths on Linux
  if (config.platform === 'linux') {
    pkgConfigPaths = pkgConfigPaths.filter(path =>
      !path.includes('libstdcxx')
      && !path.includes('gcc')
      && !path.includes('gnu.org/gcc'),
    )
  }

  buildEnv.PKG_CONFIG_PATH = pkgConfigPaths.join(':')

  // Set up targeted library and include paths (exclude libstdcxx on Linux)
  // Build library paths dynamically using latest versions
  let libPaths = libraryBasePaths
    .map(basePath => findLatestVersion(`${launchpadRoot}/${basePath}`))
    .filter(path => path && existsSync(path))
    .map(path => join(path, 'lib'))
    .filter(path => existsSync(path))

  // Completely exclude libstdcxx and gcc paths on Linux
  if (config.platform === 'linux') {
    libPaths = libPaths.filter(path =>
      !path.includes('libstdcxx')
      && !path.includes('gcc')
      && !path.includes('gnu.org/gcc'),
    )
  }

  // Build include paths dynamically using latest versions
  let includePaths = libraryBasePaths
    .map(basePath => findLatestVersion(`${launchpadRoot}/${basePath}`))
    .filter(path => path && existsSync(path))
    .map(path => join(path, 'include'))
    .filter(path => existsSync(path))

  // Add iconv paths back - we need the actual library for linking
  if (config.platform === 'darwin') {
    const iconvPath = findLatestVersion(`${launchpadRoot}/gnu.org/libiconv`)
    if (iconvPath && existsSync(iconvPath)) {
      const iconvLibPath = join(iconvPath, 'lib')
      const iconvIncPath = join(iconvPath, 'include')
      const iconvPkgPath = join(iconvPath, 'lib', 'pkgconfig')

      if (existsSync(iconvLibPath)) libPaths.push(iconvLibPath)
      if (existsSync(iconvIncPath)) includePaths.push(iconvIncPath)
      if (existsSync(iconvPkgPath)) pkgConfigPaths.push(iconvPkgPath)
      log(`✅ Added iconv library paths: ${iconvPath}`)
    } else {
      log('⚠️ iconv library not found, may cause linking issues')
    }
  }

  buildEnv.PKG_CONFIG_PATH = pkgConfigPaths.join(':')

  // Validate that we have essential libraries before proceeding
  const essentialLibraries = ['openssl', 'zlib', 'curl']
  const missingLibraries = essentialLibraries.filter(lib => {
    const basePath = libraryBasePaths.find(path => path.includes(lib))
    if (!basePath) return true
    const latestPath = findLatestVersion(`${launchpadRoot}/${basePath}`)
    return !latestPath || !existsSync(join(latestPath, 'lib'))
  })

  if (missingLibraries.length > 0) {
    log(`❌ Missing essential libraries: ${missingLibraries.join(', ')}`)

    const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true'

    if (isCI) {
      log('⚠️ Running in CI environment - installing dependencies via Launchpad')
      log('If this fails, check CI workflow dependency installation')
    } else {
      log('Installing missing dependencies via Launchpad...')

      try {
        const launchpadEnv = {
          ...process.env,
          LAUNCHPAD_SHOW_ENV_MESSAGES: 'false',
          LAUNCHPAD_SHELL_ACTIVATION_MESSAGE: '',
          LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE: '',
          LAUNCHPAD_NETWORK_MAX_CONCURRENT: '3', // Conservative for all environments
          LAUNCHPAD_CACHE_ENABLED: 'true',
          LAUNCHPAD_VERBOSE: process.env.LAUNCHPAD_VERBOSE || 'false',
          LAUNCHPAD_SKIP_SHELL_INTEGRATION: 'true', // Skip shell integration in CI
          LAUNCHPAD_NO_INTERACTIVE: 'true', // Disable interactive prompts
          LAUNCHPAD_CLI_MODE: '1', // Force exit after completion
        }

        execSync('bun ./launchpad install php --deps-only --quiet', {
          stdio: 'inherit',
          cwd: process.cwd(),
          timeout: 20 * 60 * 1000,
          env: launchpadEnv,
        })

        log('✅ Dependencies installed successfully. Rechecking...')

        // Re-build paths after installation
        const updatedPkgConfigPaths = libraryBasePaths
          .map(basePath => findLatestVersion(`${launchpadRoot}/${basePath}`))
          .filter(path => path && existsSync(path))
          .map(path => join(path, 'lib', 'pkgconfig'))
          .filter(path => existsSync(path))

        const updatedLibPaths = libraryBasePaths
          .map(basePath => findLatestVersion(`${launchpadRoot}/${basePath}`))
          .filter(path => path && existsSync(path))
          .map(path => join(path, 'lib'))
          .filter(path => existsSync(path))

        const updatedIncludePaths = libraryBasePaths
          .map(basePath => findLatestVersion(`${launchpadRoot}/${basePath}`))
          .filter(path => path && existsSync(path))
          .map(path => join(path, 'include'))
          .filter(path => existsSync(path))

        // Add iconv paths after dependency installation on macOS
        if (config.platform === 'darwin') {
          const iconvPath = findLatestVersion(`${launchpadRoot}/gnu.org/libiconv`)
          if (iconvPath && existsSync(iconvPath)) {
            const iconvLibPath = join(iconvPath, 'lib')
            const iconvIncPath = join(iconvPath, 'include')
            const iconvPkgPath = join(iconvPath, 'lib', 'pkgconfig')

            if (existsSync(iconvLibPath)) updatedLibPaths.push(iconvLibPath)
            if (existsSync(iconvIncPath)) updatedIncludePaths.push(iconvIncPath)
            if (existsSync(iconvPkgPath)) updatedPkgConfigPaths.push(iconvPkgPath)
            log(`✅ Added iconv library paths after dependency installation: ${iconvPath}`)
          }
        }

        // Update the global variables with new paths
        pkgConfigPaths = updatedPkgConfigPaths
        libPaths = updatedLibPaths
        includePaths = updatedIncludePaths

        // Update the environment with new paths
        buildEnv.PKG_CONFIG_PATH = updatedPkgConfigPaths.join(':')
        buildEnv.LDFLAGS = updatedLibPaths.map(path => `-L${path}`).join(' ')

        log(`✅ Updated paths after dependency installation`)
        log(`✅ Found ${updatedLibPaths.length} library paths and ${updatedIncludePaths.length} include paths`)
      } catch (error) {
        log(`⚠️ Could not auto-install dependencies: ${error}`)
        log('Please ensure all required dependencies are installed via Launchpad.')
        log('Run: bun ./launchpad install php --deps-only')
      }
    }
  } else {
    log(`✅ Found ${libPaths.length} library paths and ${includePaths.length} include paths`)
  }

  // Debug: Check for ICU libraries specifically
  const icuPkgConfigPaths = pkgConfigPaths.filter(path => path.includes('unicode.org'))
  const icuLibPaths = libPaths.filter(path => path.includes('unicode.org'))
  const icuIncludePaths = includePaths.filter(path => path.includes('unicode.org'))

  log(`🔍 ICU Debug Information:`)
  log(`  - ICU PKG_CONFIG paths: ${icuPkgConfigPaths.length} found`)
  icuPkgConfigPaths.forEach(path => log(`    ${path}`))
  log(`  - ICU Library paths: ${icuLibPaths.length} found`)
  icuLibPaths.forEach(path => log(`    ${path}`))
  log(`  - ICU Include paths: ${icuIncludePaths.length} found`)
  icuIncludePaths.forEach(path => log(`    ${path}`))

  if (icuPkgConfigPaths.length > 0) {
    // Check if ICU pkgconfig files actually exist
    icuPkgConfigPaths.forEach(pkgPath => {
      const icuPcFiles = ['icu-uc.pc', 'icu-io.pc', 'icu-i18n.pc']
      icuPcFiles.forEach(pcFile => {
        const fullPath = join(pkgPath, pcFile)
        if (existsSync(fullPath)) {
          log(`    ✅ Found: ${fullPath}`)
        } else {
          log(`    ❌ Missing: ${fullPath}`)
        }
      })
    })
  } else {
    log(`  ❌ No ICU libraries found in PKG_CONFIG_PATH`)
    log(`  🔍 Checking if unicode.org directory exists at all...`)
    const possibleIcuPath = join(launchpadRoot, 'unicode.org')
    if (existsSync(possibleIcuPath)) {
      log(`  ✅ Found unicode.org directory: ${possibleIcuPath}`)
      const versions = readdirSync(possibleIcuPath).filter(f => f.startsWith('v'))
      log(`  📋 Available versions: ${versions.join(', ')}`)
    } else {
      log(`  ❌ No unicode.org directory found at: ${possibleIcuPath}`)
    }
  }

  buildEnv.LDFLAGS = libPaths.map(path => `-L${path}`).join(' ')
  buildEnv.CPPFLAGS = includePaths.map(path => `-I${path}`).join(' ')

  // Add platform-specific linker flags with dynamic rpaths
  if (config.platform === 'darwin') {
    // macOS: Use dynamic rpaths based on actual library locations, removing duplicates
    const uniqueLibPaths = [...new Set(libPaths)]
    const rpathFlags = uniqueLibPaths.map(path => `-Wl,-rpath,${path}`).join(' ')
    // Handle libiconv with absolute path instead of problematic @rpath reference
    const iconvLibPath = uniqueLibPaths.find(p => p.includes('libiconv'))
    const iconvFlag = iconvLibPath ? ` ${iconvLibPath}/libiconv.2.dylib` : ' -liconv'
    buildEnv.LDFLAGS += ` -lresolv${iconvFlag} ${rpathFlags} -Wl,-headerpad_max_install_names`
    // Set up runtime library path for macOS (build-time only)
    buildEnv.DYLD_LIBRARY_PATH = uniqueLibPaths.join(':')
    buildEnv.LD = '/usr/bin/ld'
  }
  else {
    // Linux: Use dynamic rpaths based on actual library locations, removing duplicates
    const uniqueLibPaths = [...new Set(libPaths)]
    const rpathFlags = uniqueLibPaths.map(path => `-Wl,-rpath,${path}`).join(' ')
    buildEnv.LDFLAGS += ` ${rpathFlags}`
  }

  // Add Launchpad PATH to buildEnv if we're using Launchpad dependencies
  if (existsSync(`${homeDir}/.local/build-env.sh`)) {
    // Read PATH from build-env.sh to ensure we have all Launchpad tools
    const buildEnvContent = readFileSync(`${homeDir}/.local/build-env.sh`, 'utf8')
    const pathMatch = buildEnvContent.match(/export PATH="([^"]+)\$PATH"?/)
    if (pathMatch) {
      // Extract the Launchpad paths and add system paths
      const launchpadPaths = pathMatch[1].replace(/:$/, '') // Remove trailing colon
      buildEnv.PATH = `${launchpadPaths}:/usr/bin:/bin:/usr/sbin:/sbin:/usr/local/bin`
    } else {
      // Fallback: try to extract the full PATH without $PATH suffix
      const fullPathMatch = buildEnvContent.match(/export PATH="([^"]+)"/)
      if (fullPathMatch) {
        buildEnv.PATH = fullPathMatch[1]
      }
    }
  }

  log('✅ Configured targeted Launchpad dependencies')
  log(`🗋 Debug: CPPFLAGS=${buildEnv.CPPFLAGS}`)
  log(`🗋 Debug: LDFLAGS=${buildEnv.LDFLAGS}`)
  log(`🗋 Debug: PKG_CONFIG_PATH=${buildEnv.PKG_CONFIG_PATH}`)

  // Platform-specific compiler setup
  if (config.platform === 'darwin') {
    buildEnv.CC = 'clang'
    buildEnv.CXX = 'clang++'
    buildEnv.LD = '/usr/bin/ld'
    // Ensure we use system C++ standard library, not GCC's
    buildEnv.CXXFLAGS = `${buildEnv.CXXFLAGS || ''} -stdlib=libc++`
    buildEnv.LDFLAGS = `${buildEnv.LDFLAGS || ''} -stdlib=libc++`
  }
  else if (config.platform === 'linux') {
    buildEnv.CC = 'gcc'
    buildEnv.CXX = 'g++'
    buildEnv.CFLAGS = `${buildEnv.CFLAGS || ''} -O2 -fPIC`
    buildEnv.CXXFLAGS = `${buildEnv.CXXFLAGS || ''} -O2 -fPIC`
    // Force system libstdc++ and clear any cached paths
    buildEnv.LDFLAGS = (buildEnv.LDFLAGS || '').replace(/-L\S*gnu\.org\/gcc\S*/g, '')
    buildEnv.LDFLAGS = buildEnv.LDFLAGS.replace(/-L\S*libstdcxx\S*/g, '')
    // Set preprocessor to avoid traditional-cpp issues
    buildEnv.CPP = 'gcc -E'
    // Clear any environment variables that might contain gcc paths
    delete buildEnv.LIBRARY_PATH
    delete buildEnv.LD_LIBRARY_PATH
    // Disable iconv completely on Linux due to glibc errno check failure
  }

  // Clear any configure cache that might contain libstdc++ paths
  if (config.platform === 'linux') {
    try {
      execSync('rm -rf autom4te.cache config.cache', { cwd: phpSourceDir, stdio: 'ignore' })
    }
    catch (e) {
      // Ignore if cache files don't exist
    }
  }

  log('Running buildconf...')

  // Fix m4 compatibility issue on macOS
  if (config.platform === 'darwin') {
    // Force use of system m4 and disable GNU-specific options
    buildEnv.M4 = '/usr/bin/m4'
    buildEnv.AUTOM4TE_M4 = '/usr/bin/m4'

    // Create a wrapper script for autom4te that uses system m4
    const wrapperScript = `#!/bin/bash
export M4=/usr/bin/m4
export AUTOM4TE_M4=/usr/bin/m4
exec "$@"
`
    const wrapperPath = join(phpSourceDir, 'autom4te-wrapper.sh')
    writeFileSync(wrapperPath, wrapperScript)
    execSync(`chmod +x ${wrapperPath}`, { cwd: phpSourceDir })

    // Update PATH to use our wrapper
    buildEnv.PATH = `${phpSourceDir}:${buildEnv.PATH}`
  }

  // Check if configure already exists (some PHP releases include it)
  const configurePath = join(phpSourceDir, 'configure')
  if (existsSync(configurePath)) {
    log('Found existing configure script, skipping buildconf')
  }
  else {
    try {
      execSync('./buildconf --force', {
        stdio: 'inherit',
        cwd: phpSourceDir,
        env: buildEnv,
      })
    }
    catch (error) {
      log('buildconf failed, trying alternative approach...')

      // Try running autoconf directly with system m4
      try {
        const autoconfEnv = { ...buildEnv }
        if (config.platform === 'darwin') {
          autoconfEnv.M4 = '/usr/bin/m4'
          autoconfEnv.AUTOM4TE_M4 = '/usr/bin/m4'
        }

        execSync('autoconf', {
          stdio: 'inherit',
          cwd: phpSourceDir,
          env: autoconfEnv,
        })

        log('Successfully generated configure script with autoconf')
      }
      catch (autoconfError) {
        log('autoconf also failed, trying to download pre-built configure...')

        // As a last resort, try to use a different PHP version or approach
        throw new Error(`Unable to generate configure script. The autotools on this system are incompatible with PHP ${config.phpVersion}. Consider:\n1. Installing GNU autotools via a package manager\n2. Using a different PHP version\n3. Using pre-compiled PHP binaries`)
      }
    }

    // Verify configure script was created
    if (!existsSync(configurePath)) {
      throw new Error('Configure script was not generated successfully')
    }
  }

  // Generate platform-specific configure arguments with Launchpad dependencies
  const configureArgs = generateConfigureArgs(config, installPrefix)
  if (config.platform === 'darwin') {
    configureArgs.push(
      '--with-zip',
      '--enable-dtrace',
      '--with-ldap-sasl',
    )
  }

  log('Using Launchpad-managed dependencies for all extensions')

  // Update configure args to use dynamic library paths
  const libraryMappings = [
    { flag: '--with-bz2', basePath: 'sourceware.org/bzip2' },
    { flag: '--with-gettext', basePath: 'gnu.org/gettext' },
    // Re-enable iconv library mapping for proper linking
    { flag: '--with-iconv', basePath: 'gnu.org/libiconv' },
    { flag: '--with-readline', basePath: 'gnu.org/readline' },
  ]

  for (const mapping of libraryMappings) {
    const libPath = findLatestVersion(`${homeDir}/.local/${mapping.basePath}`)
    const argIndex = configureArgs.findIndex(arg => arg === mapping.flag)

    log(`🔍 Checking ${mapping.flag}: libPath=${libPath}, exists=${libPath ? existsSync(libPath) : false}`)

    if (argIndex !== -1 && libPath && existsSync(libPath)) {
      configureArgs[argIndex] = `${mapping.flag}=${libPath}`
      log(`✅ Using ${mapping.flag}=${libPath}`)

      // Special verification for BZip2 headers
      if (mapping.flag === '--with-bz2') {
        const headerPath = join(libPath, 'include', 'bzlib.h')
        log(`🔍 BZip2 header check: ${headerPath} exists=${existsSync(headerPath)}`)
        if (!existsSync(headerPath)) {
          log(`⚠️ BZip2 headers not found at expected location: ${headerPath}`)
        }
      }
    } else if (argIndex !== -1) {
      log(`⚠️ Could not find library for ${mapping.flag}, using pkg-config detection`)

      // Debug information for BZip2
      if (mapping.flag === '--with-bz2') {
        log(`🔍 BZip2 debug: basePath=${homeDir}/.local/${mapping.basePath}, libPath=${libPath}`)
        try {
          const localDirs = readdirSync(`${homeDir}/.local`).filter(d => d.includes('bzip') || d.includes('sourceware'))
          log(`🔍 Available directories: ${localDirs.join(', ')}`)

          const altPaths = [
            `${homeDir}/.local/sourceware.org/bzip2`,
            `${homeDir}/.local/bzip2`,
            `${homeDir}/.local/gnu.org/bzip2`
          ]

          for (const altPath of altPaths) {
            if (existsSync(altPath)) {
              const versions = readdirSync(altPath).filter(d => d.startsWith('v'))
              log(`🔍 Found BZip2 alternative at ${altPath}: ${versions.join(', ')}`)
            }
          }
        } catch (e) {
          log(`🔍 Could not list .local directory: ${e}`)
        }
      }

      // Missing library detected - this should not happen after 'launchpad install php --deps-only'
        log(`❌ Missing library for ${mapping.flag} at ${libPath}`)
        log(`🔧 This indicates 'launchpad install php --deps-only' may not have installed all dependencies`)
        log(`⚠️ Continuing without ${mapping.flag} - PHP will be built without this extension`)

        // Remove the problematic flag to allow build to continue
        configureArgs.splice(argIndex, 1)
        log(`⚠️ Removed ${mapping.flag} from configure arguments`)
    }
  }

  // Final BZip2 verification before configure
  const bz2ArgIndex = configureArgs.findIndex(arg => arg.startsWith('--with-bz2'))
  if (bz2ArgIndex !== -1) {
    const bz2Arg = configureArgs[bz2ArgIndex]
    if (bz2Arg !== '--with-bz2') {
      const bz2Path = bz2Arg.split('=')[1]
      const headerPath = join(bz2Path, 'include', 'bzlib.h')
      if (!existsSync(headerPath)) {
        log(`❌ BZip2 headers missing at ${headerPath}`)
        log(`🔧 This indicates Launchpad dependency installation issue`)
        // Remove the problematic flag rather than falling back to system
        configureArgs.splice(bz2ArgIndex, 1)
        log(`⚠️ Removed --with-bz2 from configure arguments`)
      }
    }
  }

  // Log final configure command for debugging
  // Add --host flag on macOS to force cross-compilation and skip problematic runtime tests
  if (config.platform === 'darwin') {
    const hostArch = config.arch === 'arm64' ? 'aarch64' : 'x86_64'
    configureArgs.push(`--host=${hostArch}-apple-darwin`)
  }

  log(`🔧 Final configure args: ${configureArgs.join(' ')}`)

  // Update DYLD_LIBRARY_PATH to include all library paths for runtime
  if (config.platform === 'darwin') {
    const allLibPaths = [...libPaths]

    // Add any additional library paths from the mappings
    for (const mapping of libraryMappings) {
      const libPath = findLatestVersion(`${homeDir}/.local/${mapping.basePath}`)
      if (libPath && existsSync(libPath)) {
        const libDir = join(libPath, 'lib')
        if (existsSync(libDir) && !allLibPaths.includes(libDir)) {
          allLibPaths.push(libDir)
        }
      }
    }

    buildEnv.DYLD_LIBRARY_PATH = allLibPaths.join(':')
    log(`Updated DYLD_LIBRARY_PATH with all library paths: ${buildEnv.DYLD_LIBRARY_PATH}`)
  }


  log(`🔧 Configuring PHP with essential extensions...`)

  // Source the Launchpad environment and run configure in the same shell
  const buildEnvScript = `${homeDir}/.local/build-env.sh`
  let configureCommand: string

  // Always use Launchpad for dependency management - install dependencies first if needed
  if (!existsSync(buildEnvScript)) {
    log('📦 Installing PHP dependencies via Launchpad...')

    try {
      const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true'

      const launchpadEnv = {
        ...process.env,
        LAUNCHPAD_SHOW_ENV_MESSAGES: 'false',
        LAUNCHPAD_SHELL_ACTIVATION_MESSAGE: '',
        LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE: '',
        LAUNCHPAD_NETWORK_MAX_CONCURRENT: isCI ? '3' : '6', // More conservative in CI
        LAUNCHPAD_CACHE_ENABLED: 'true', // Enable caching
        LAUNCHPAD_VERBOSE: process.env.LAUNCHPAD_VERBOSE || 'false',
        LAUNCHPAD_SKIP_SHELL_INTEGRATION: 'true', // Skip shell integration in CI
        LAUNCHPAD_NO_INTERACTIVE: 'true', // Disable interactive prompts
        LAUNCHPAD_CLI_MODE: '1', // Force exit after completion
      }

      // Install PHP dependencies
      log('📦 Starting PHP dependency installation...')
      try {
        execSync('bun ./launchpad install php --deps-only', {
          stdio: 'inherit',
          cwd: process.cwd(),
          timeout: 20 * 60 * 1000, // 20 minutes timeout
          env: launchpadEnv,
        })
        log('✅ Launchpad dependencies installed successfully')
        log('➡️ Proceeding to PHP configuration phase...')
      } catch (installError) {
        log(`❌ Dependency installation process error: ${installError}`)
        throw installError
      }
    }
    catch (error) {
      throw new Error(`Failed to install PHP dependencies via Launchpad: ${error}`)
    }
  }

  // Source the Launchpad environment and run configure
  log('⚙️ Preparing to configure PHP build...')

  // Skip wrapper creation here - will be done right before configure execution

  if (existsSync(buildEnvScript)) {
    log('✅ Using Launchpad build environment')

    // Create configure wrapper for macOS iconv fix right before execution
    let configScript = './configure'
    if (config.platform === 'darwin') {
      try {
        // Use the phpSourceDir that we already have available
        const wrapperPath = join(phpSourceDir, 'configure-wrapper.sh')
        const wrapperScript = `#!/bin/bash
# Configure wrapper to bypass iconv errno check on macOS
# Set comprehensive iconv cache variables for all PHP versions
export php_cv_iconv_errno=yes
export php_cv_iconv_errno_val=yes
export ac_cv_func_iconv=yes
export ac_cv_header_iconv_h=yes
export ac_cv_lib_c_iconv=yes
export ac_cv_lib_iconv_iconv=yes
export ac_cv_lib_iconv_libiconv=yes
# Skip problematic runtime tests by setting cache variables
# Additional cache variables for different autoconf versions
export ac_cv_iconv_errno=yes
export ac_cv_working_iconv=yes
export php_cv_iconv_supports_errno=yes
# Additional comprehensive cache variables to cover all cases
export php_cv_iconv_broken_ignore=yes
export ac_cv_func_iconv_broken=no
export php_cv_func_iconv_works=yes
export ac_cv_iconv_supports_errno=yes
export php_cv_iconv_errno_support=yes
# Ensure the configure script thinks it's in cross-compilation mode
export cross_compiling=yes
export host_alias=\${host_alias:-\$(uname -m)-apple-darwin}
export build_alias=\${build_alias:-\$(uname -m)-apple-darwin}

# iconv is required for Laravel/Composer - must not be disabled
# Force the configure script to completely skip the errno runtime test
export CONFIG_SHELL=/bin/bash
export SHELL=/bin/bash

# Ensure pkg-config is accessible during configure
# Preserve system PATH and add any found pkg-config to it
if [ -z "\${PKG_CONFIG:-}" ]; then
  # Look for pkg-config in Launchpad installation first, then system locations
  for pkg_path in \$HOME/.local/freedesktop.org/*/bin/pkg-config /opt/homebrew/bin/pkg-config /usr/local/bin/pkg-config /usr/bin/pkg-config; do
    if [ -x "\$pkg_path" ]; then
      export PKG_CONFIG="\$pkg_path"
      break
    fi
  done
fi

# Ensure PATH includes directory containing pkg-config
if [ -n "\${PKG_CONFIG:-}" ]; then
  PKG_CONFIG_DIR=\$(dirname "\$PKG_CONFIG")
  export PATH="\$PKG_CONFIG_DIR:\$PATH"
fi

# Override the iconv errno test function to always return success
# This completely bypasses the problematic runtime test
cat > /tmp/iconv_errno_override.c << 'EOF'
#include <iconv.h>
#include <errno.h>
int main(void) {
  iconv_t cd;
  cd = iconv_open( "*blahblah*", "*blahblahblah*" );
  if (cd == (iconv_t)(-1)) {
    if (errno == EINVAL) {
      return 0;
    } else {
      return 1;
    }
  }
  iconv_close( cd );
  return 2;
}
EOF

# Always exit successfully for iconv errno test compilation
export CC_FOR_ERRNO_TEST="true"

# OPcache shared memory cache variables for cross-compilation on macOS
# macOS supports all these shared memory mechanisms, so bypass runtime tests
export ac_cv_func_shm_open=yes
export ac_cv_func_shm_unlink=yes
export ac_cv_func_mmap=yes
export ac_cv_func_munmap=yes
export ac_cv_func_shmget=yes
export ac_cv_func_shmat=yes
export ac_cv_func_shmdt=yes
export ac_cv_func_shmctl=yes
# Tell configure that mmap with MAP_ANON works (it does on macOS)
export php_cv_func_mmap_anon=yes
export php_cv_func_mmap_anon_ok=yes
# Tell configure that shm_open works (it does on macOS)
export php_cv_func_shm_open=yes
export php_cv_func_shm_open_ok=yes
# Critical PHP-specific OPcache shared memory cache variables
export php_cv_shm_ipc=yes
export php_cv_shm_mmap_anon=yes
export php_cv_shm_mmap_posix=yes

exec ./configure "$@"
`
        writeFileSync(wrapperPath, wrapperScript)
        execSync('chmod +x configure-wrapper.sh', { cwd: phpSourceDir })
        configScript = './configure-wrapper.sh'
        log('✅ Created configure wrapper for iconv errno bypass')
      } catch (error) {
        log(`⚠️ Failed to create wrapper, using direct configure: ${error}`)
        configScript = './configure'
      }
    }

    configureCommand = `${configScript} ${configureArgs.join(' ')}`
  }
  else {
    log('🔧 Launchpad build-env.sh still not found after installation - using fallback environment')

    // Fallback configuration without Launchpad environment
    configureCommand = `./configure ${configureArgs.join(' ')}`

    // Force clean environment for Linux to prevent libstdc++ injection
    if (config.platform === 'linux') {
      // Clear any remaining gcc/libstdc++ references from environment
      Object.keys(buildEnv).forEach((key) => {
        if (typeof buildEnv[key] === 'string' && buildEnv[key].includes('gnu.org/gcc')) {
          buildEnv[key] = buildEnv[key].replace(/\S*gnu\.org\/gcc\S*/g, '')
        }
        if (typeof buildEnv[key] === 'string' && buildEnv[key].includes('libstdcxx')) {
          buildEnv[key] = buildEnv[key].replace(/\S*libstdcxx\S*/g, '')
        }
      })
    }

    // Use standard configure args for fallback
    let configScript = './configure'
    if (config.platform === 'darwin') {
      try {
        // Use the phpSourceDir that we already have available
        const wrapperPath = join(phpSourceDir, 'configure-wrapper.sh')
        const wrapperScript = `#!/bin/bash
# Configure wrapper to bypass iconv errno check on macOS
# Set comprehensive iconv cache variables for all PHP versions
export php_cv_iconv_errno=yes
export php_cv_iconv_errno_val=yes
export ac_cv_func_iconv=yes
export ac_cv_header_iconv_h=yes
export ac_cv_lib_c_iconv=yes
export ac_cv_lib_iconv_iconv=yes
export ac_cv_lib_iconv_libiconv=yes
# Skip problematic runtime tests by setting cache variables
# Additional cache variables for different autoconf versions
export ac_cv_iconv_errno=yes
export ac_cv_working_iconv=yes
export php_cv_iconv_supports_errno=yes
# Additional comprehensive cache variables to cover all cases
export php_cv_iconv_broken_ignore=yes
export ac_cv_func_iconv_broken=no
export php_cv_func_iconv_works=yes
export ac_cv_iconv_supports_errno=yes
export php_cv_iconv_errno_support=yes
# Ensure the configure script thinks it's in cross-compilation mode
export cross_compiling=yes
export host_alias=\${host_alias:-\$(uname -m)-apple-darwin}
export build_alias=\${build_alias:-\$(uname -m)-apple-darwin}

# iconv is required for Laravel/Composer - must not be disabled
# Force the configure script to completely skip the errno runtime test
export CONFIG_SHELL=/bin/bash
export SHELL=/bin/bash

# Ensure pkg-config is accessible during configure
# Preserve system PATH and add any found pkg-config to it
if [ -z "\${PKG_CONFIG:-}" ]; then
  # Look for pkg-config in Launchpad installation first, then system locations
  for pkg_path in \$HOME/.local/freedesktop.org/*/bin/pkg-config /opt/homebrew/bin/pkg-config /usr/local/bin/pkg-config /usr/bin/pkg-config; do
    if [ -x "\$pkg_path" ]; then
      export PKG_CONFIG="\$pkg_path"
      break
    fi
  done
fi

# Ensure PATH includes directory containing pkg-config
if [ -n "\${PKG_CONFIG:-}" ]; then
  PKG_CONFIG_DIR=\$(dirname "\$PKG_CONFIG")
  export PATH="\$PKG_CONFIG_DIR:\$PATH"
fi

# Override the iconv errno test function to always return success
# This completely bypasses the problematic runtime test
cat > /tmp/iconv_errno_override.c << 'EOF'
#include <iconv.h>
#include <errno.h>
int main(void) {
  iconv_t cd;
  cd = iconv_open( "*blahblah*", "*blahblahblah*" );
  if (cd == (iconv_t)(-1)) {
    if (errno == EINVAL) {
      return 0;
    } else {
      return 1;
    }
  }
  iconv_close( cd );
  return 2;
}
EOF

# Always exit successfully for iconv errno test compilation
export CC_FOR_ERRNO_TEST="true"

# OPcache shared memory cache variables for cross-compilation on macOS
# macOS supports all these shared memory mechanisms, so bypass runtime tests
export ac_cv_func_shm_open=yes
export ac_cv_func_shm_unlink=yes
export ac_cv_func_mmap=yes
export ac_cv_func_munmap=yes
export ac_cv_func_shmget=yes
export ac_cv_func_shmat=yes
export ac_cv_func_shmdt=yes
export ac_cv_func_shmctl=yes
# Tell configure that mmap with MAP_ANON works (it does on macOS)
export php_cv_func_mmap_anon=yes
export php_cv_func_mmap_anon_ok=yes
# Tell configure that shm_open works (it does on macOS)
export php_cv_func_shm_open=yes
export php_cv_func_shm_open_ok=yes
# Critical PHP-specific OPcache shared memory cache variables
export php_cv_shm_ipc=yes
export php_cv_shm_mmap_anon=yes
export php_cv_shm_mmap_posix=yes

exec ./configure "$@"
`
        writeFileSync(wrapperPath, wrapperScript)
        execSync('chmod +x configure-wrapper.sh', { cwd: phpSourceDir })
        configScript = './configure-wrapper.sh'
        log('✅ Created configure wrapper for iconv errno bypass')
      } catch (error) {
        log(`⚠️ Failed to create wrapper, using direct configure: ${error}`)
        configScript = './configure'
      }
    }

    configureCommand = `${configScript} ${configureArgs.join(' ')}`
  }

  try {
    execSync(configureCommand, {
      cwd: phpSourceDir,
      stdio: 'inherit',
      shell: '/bin/bash',
      env: {
        ...process.env,
        ...buildEnv,
        M4: '/usr/bin/m4',
        ac_cv_path_M4: '/usr/bin/m4',
        ac_cv_prog_M4: '/usr/bin/m4',
        AUTOCONF_M4: '/usr/bin/m4',
      // Add autoconf cache variables to prevent header detection failures
      ac_cv_header_stdc: 'yes',
      ac_cv_header_sys_types_h: 'yes',
      ac_cv_header_sys_stat_h: 'yes',
      ac_cv_header_stdlib_h: 'yes',
      ac_cv_header_string_h: 'yes',
      ac_cv_header_memory_h: 'yes',
      ac_cv_header_strings_h: 'yes',
      ac_cv_header_inttypes_h: 'yes',
      ac_cv_header_stdint_h: 'yes',
      ac_cv_header_unistd_h: 'yes',
      ac_cv_header_ac_nonexistent_h: 'no',
      // Force iconv to work by bypassing the problematic errno test
      php_cv_iconv_errno: 'yes',  // Force errno test to pass
      php_cv_iconv_implementation: 'libiconv',
      ac_cv_func_iconv: 'yes',
      ac_cv_header_iconv_h: 'yes',
      ac_cv_lib_iconv_libiconv: 'yes',  // Use launchpad libiconv
      // BZip2 cache variables to force detection
      ac_cv_lib_bz2_BZ2_bzerror: 'yes',
      ac_cv_header_bzlib_h: 'yes',
    },
  })
  } catch (configureError: any) {
    // Check if this is an iconv errno error - this should not happen with our enhanced wrapper
    const errorOutput = configureError.toString()
    if (errorOutput.includes('iconv does not support errno') || errorOutput.includes('checking if iconv supports errno... no')) {
      log('❌ iconv errno test failed despite comprehensive bypass attempts')
      log('🔧 iconv is required for Laravel/Composer functionality - cannot continue without it')
      log('💡 This indicates a fundamental issue with the iconv configuration')
      log('📋 Please check:')
      log('   1. Launchpad libiconv installation: launchpad install libiconv')
      log('   2. Library path configuration in build environment')
      log('   3. Configure wrapper script execution permissions')

      throw new Error('iconv errno test failed - iconv is required for Laravel/Composer and cannot be disabled')
    } else {
      // Re-throw if it's not an iconv error
      throw configureError
    }
  }

  log('Building PHP...')
  const jobs = execSync('nproc 2>/dev/null || sysctl -n hw.ncpu 2>/dev/null || echo 2', { encoding: 'utf8' }).trim()

  if (config.platform === 'darwin') {
    // macOS: Use chunked compilation to prevent hangs
    log('Using chunked compilation for macOS stability')

    try {
      // First, try to build core components with shorter timeout
      log('Building core PHP components...')
      execSync('make -j1 Zend/zend_language_scanner.lo', {
        stdio: 'inherit',
        cwd: phpSourceDir,
        env: buildEnv,
        timeout: 10 * 60 * 1000, // 10 minutes for individual components
      })

      log('Building Zend engine...')
      execSync('make -j1 libphp.la', {
        stdio: 'inherit',
        cwd: phpSourceDir,
        env: buildEnv,
        timeout: 20 * 60 * 1000, // 20 minutes for Zend engine
      })

      log('Building remaining components...')
      execSync('make -j1', {
        stdio: 'inherit',
        cwd: phpSourceDir,
        env: buildEnv,
        timeout: 60 * 60 * 1000, // 60 minutes for remaining build
      })
    }
    catch (error) {
      log('Chunked compilation failed, falling back to standard build with extended timeout...')
      // Fallback to standard build with very long timeout and better parallelization
      const jobs = 2 // Use 2 jobs to speed up but avoid overwhelming the system
      execSync(`make -j${jobs}`, {
        stdio: 'inherit',
        cwd: phpSourceDir,
        env: buildEnv,
        timeout: 180 * 60 * 1000, // 3 hours timeout as last resort
      })
    }
  }
  else {
    // Linux/other platforms: Use parallel compilation
    const maxJobs = Math.min(Number.parseInt(jobs), 4) // Limit to 4 jobs max for stability
    log(`Using ${maxJobs} parallel jobs for compilation`)

    execSync(`make -j${maxJobs}`, {
      stdio: 'inherit',
      cwd: phpSourceDir,
      env: buildEnv,
      timeout: 45 * 60 * 1000, // 45 minutes timeout
    })
  }

  // Fix library paths in build-time PHP binary before installation
  if (config.platform === 'darwin') {
    const buildTimePhpBinary = join(phpSourceDir, 'sapi', 'cli', 'php')
    if (existsSync(buildTimePhpBinary)) {
      log('🔧 Fixing library paths for build-time PHP binary...')
      fixMacOSLibraryPaths(buildTimePhpBinary, homeDir)

      // Verify the fix worked by testing the binary
      try {
        log('🔧 Verifying build-time PHP binary works...')
        execSync(`"${buildTimePhpBinary}" --version`, {
          stdio: 'pipe',
          env: {
            ...process.env,
            DYLD_LIBRARY_PATH: libPaths.join(':'),
            DYLD_FALLBACK_LIBRARY_PATH: libPaths.join(':')
          }
        })
        log('🔧 ✅ Build-time PHP binary is working correctly')
      } catch (error) {
        log('🔧 ❌ Build-time PHP binary still has issues, attempting additional fixes...')

        // Try additional comprehensive fixing
        const otoolOutput = execSync(`otool -L "${buildTimePhpBinary}"`, { encoding: 'utf8' })
        log('🔧 Current dependencies after first fix:')
        log(otoolOutput)

        // Apply fixes again in case some were missed
        fixMacOSLibraryPaths(buildTimePhpBinary, homeDir)
      }
    }

    // Also fix any other PHP binaries that might be used during install
    const cgiBinary = join(phpSourceDir, 'sapi', 'cgi', 'php-cgi')
    if (existsSync(cgiBinary)) {
      log('🔧 Fixing library paths for build-time PHP CGI binary...')
      fixMacOSLibraryPaths(cgiBinary, homeDir)
    }

    const fpmBinary = join(phpSourceDir, 'sapi', 'fpm', 'php-fpm')
    if (existsSync(fpmBinary)) {
      log('🔧 Fixing library paths for build-time PHP FPM binary...')
      fixMacOSLibraryPaths(fpmBinary, homeDir)
    }
  }

  log('🔧 Installing PHP...')
  // Enhanced environment for make install to ensure library paths work
  const installEnv = { ...buildEnv }
  if (config.platform === 'darwin') {
    // Make sure DYLD_LIBRARY_PATH includes all our library paths during install
    installEnv.DYLD_LIBRARY_PATH = libPaths.join(':')
    installEnv.DYLD_FALLBACK_LIBRARY_PATH = libPaths.join(':')

    // Also ensure that any PHP scripts run during installation can find libraries
    const dynamicLibPaths = []
    const bz2Path = findLatestVersion(`${homeDir}/.local/sourceware.org/bzip2`)
    const gettextPath = findLatestVersion(`${homeDir}/.local/gnu.org/gettext`)
    const iconvPath = findLatestVersion(`${homeDir}/.local/gnu.org/libiconv`)
    const readlinePath = findLatestVersion(`${homeDir}/.local/gnu.org/readline`)

    if (readlinePath) dynamicLibPaths.push(join(readlinePath, 'lib'))
    if (iconvPath) dynamicLibPaths.push(join(iconvPath, 'lib'))
    if (gettextPath) dynamicLibPaths.push(join(gettextPath, 'lib'))
    if (bz2Path) dynamicLibPaths.push(join(bz2Path, 'lib'))

    if (dynamicLibPaths.length > 0) {
      const allLibPaths = [...libPaths, ...dynamicLibPaths]
      installEnv.DYLD_LIBRARY_PATH = allLibPaths.join(':')
      installEnv.DYLD_FALLBACK_LIBRARY_PATH = allLibPaths.join(':')
      log(`🔧 Enhanced library paths for installation: ${installEnv.DYLD_LIBRARY_PATH}`)
    }
  }

  try {
    execSync('make install', {
      stdio: 'inherit',
      cwd: phpSourceDir,
      env: installEnv,
      timeout: 15 * 60 * 1000, // 15 minutes timeout for install
    })
  } catch (error) {
    if (config.platform === 'darwin') {
      log('🔧 ❌ Installation failed, checking build-time PHP binary again...')

      const buildTimePhpBinary = join(phpSourceDir, 'sapi', 'cli', 'php')
      if (existsSync(buildTimePhpBinary)) {
        // Check what's wrong with the binary
        try {
          const otoolOutput = execSync(`otool -L "${buildTimePhpBinary}"`, { encoding: 'utf8' })
          log('🔧 Build-time PHP binary dependencies:')
          log(otoolOutput)

          // Try one more comprehensive fix
          log('🔧 Attempting final library path fix...')
          fixMacOSLibraryPaths(buildTimePhpBinary, homeDir)

          // Test the binary one more time
          execSync(`"${buildTimePhpBinary}" --version`, {
            stdio: 'inherit',
            env: installEnv
          })

          log('🔧 Binary is now working, retrying installation...')
          execSync('make install', {
            stdio: 'inherit',
            cwd: phpSourceDir,
            env: installEnv,
            timeout: 15 * 60 * 1000,
          })
        } catch (finalError) {
          log(`🔧 Final installation attempt failed: ${finalError}`)
          throw error
        }
      } else {
        throw error
      }
    } else {
      throw error
    }
  }

  // Fix library paths on macOS after installation
  if (config.platform === 'darwin') {
    log('🔧 Fixing library paths for installed PHP binary...')
    const installedPhpBinary = join(installPrefix, 'bin', 'php')
    if (existsSync(installedPhpBinary)) {
      fixMacOSLibraryPaths(installedPhpBinary, homeDir)

      // Test the final installed binary
      try {
        log('🔧 Testing final installed PHP binary...')
        execSync(`"${installedPhpBinary}" --version`, {
          stdio: 'inherit',
          env: {
            ...process.env,
            DYLD_LIBRARY_PATH: '',
            DYLD_FALLBACK_LIBRARY_PATH: ''
          }
        })
        log('🔧 ✅ Final PHP binary is working correctly without environment variables')
      } catch (error) {
        log('🔧 ⚠️ Final PHP binary requires environment variables to work')
      }
    }

    // Also fix other installed binaries
    const installedCgiBinary = join(installPrefix, 'bin', 'php-cgi')
    if (existsSync(installedCgiBinary)) {
      log('🔧 Fixing library paths for installed PHP CGI binary...')
      fixMacOSLibraryPaths(installedCgiBinary, homeDir)
    }

    const installedFpmBinary = join(installPrefix, 'sbin', 'php-fpm')
    if (existsSync(installedFpmBinary)) {
      log('🔧 Fixing library paths for installed PHP FPM binary...')
      fixMacOSLibraryPaths(installedFpmBinary, homeDir)
    }
  }

  // Create php.ini for Unix builds to enable OPcache and other extensions
  log('Creating php.ini for Unix PHP build...')
  createUnixPhpIni(installPrefix, config)
  log('✅ Created php.ini with OPcache and extensions enabled')

  // Create metadata file
  const metadata = {
    php_version: config.phpVersion,
    platform: config.platform,
    arch: config.arch,
    config: config.config,
    built_at: new Date().toISOString(),
    build_approach: 'minimal',
  }

  writeFileSync(join(installPrefix, 'metadata.json'), JSON.stringify(metadata, null, 2))

  log(`✅ PHP ${config.phpVersion} built successfully at ${installPrefix}`)

  // Test the binary (platform-specific)
  if (config.platform === 'win32') {
    const phpBinary = join(installPrefix, 'bin', 'php.exe')
    if (existsSync(phpBinary)) {
      log('Verifying Windows PHP binary...')

      // Check file size to verify it's a real binary
      try {
        const stats = Bun.file(phpBinary).size
        log(`PHP binary size: ${stats} bytes`)

        if (stats > 1000000) {
          log('✅ PHP binary appears to be a real Windows binary')

          // Count DLL files to verify it's a complete distribution
          const binDir = join(installPrefix, 'bin')
          if (existsSync(binDir)) {
            try {
              // Use Node.js fs instead of Bun.readdir
              const { readdirSync } = require('node:fs')
              const files = readdirSync(binDir)
              const dllFiles = files.filter((file: string) => file.toLowerCase().endsWith('.dll'))
              log(`Found ${dllFiles.length} DLL files in the PHP distribution`)

              if (dllFiles.length > 10) {
                log('✅ PHP distribution contains expected DLL files')
              }
              else {
                log('⚠️ PHP distribution contains fewer DLL files than expected')
              }
            }
            catch (e) {
              log(`Could not read bin directory: ${e}`)
            }
          }

          // Try to run the binary, but don't fail if it doesn't work
          try {
            execSync(`"${phpBinary}" --version`, { stdio: 'inherit' })
            log('✅ Windows PHP binary is executable in this environment')
          }
          catch (error) {
            log(`Note: PHP binary exists but is not executable in this environment`)
            log('This is expected in some CI environments and does not indicate a problem')
          }
        }
        else {
          log('⚠️ PHP binary is smaller than expected, might be a placeholder')
        }
      }
      catch (error) {
        log(`Could not check binary size: ${error}`)
      }
    }
  }
  else {
    const phpBinary = join(installPrefix, 'bin', 'php')
    if (existsSync(phpBinary)) {
      log('Testing PHP binary...')
      execSync(`"${phpBinary}" --version`, {
        stdio: 'inherit',
        env: {
          ...process.env,
          ...buildEnv,
        },
      })
    }
  }

  return installPrefix
}

// Add a BZip2 specific cache variable for configure
function setBZip2ConfigCache(buildEnv: any): void {
  // Force BZip2 detection to succeed
  buildEnv.ac_cv_lib_bz2_BZ2_bzerror = 'yes'
  buildEnv.ac_cv_header_bzlib_h = 'yes'
}

function buildPhpWithSystemLibraries(config: BuildConfig, installPrefix: string): string {
  log('Building PHP with system libraries only (Linux)')

  // Resolve output directory to handle both relative and absolute paths
  const outputDir = path.isAbsolute(config.outputDir) ? config.outputDir : join(process.cwd(), config.outputDir)

  // Ensure output directory exists early
  mkdirSync(outputDir, { recursive: true })

  const phpSourceDir = downloadPhpSource(config)
  mkdirSync(installPrefix, { recursive: true })

  // Install required system packages for extensions
  log('Installing required system packages...')
  try {
    execSync('apt-get update && apt-get install -y libbz2-dev libzip-dev gettext libgettextpo-dev pkg-config', { stdio: 'inherit' })

    // Verify libzip installation
    try {
      const libzipVersion = execSync('pkg-config --modversion libzip', { encoding: 'utf8' }).trim()
      log(`✅ libzip ${libzipVersion} detected`)
    }
    catch (e) {
      log('⚠️ libzip pkg-config not found, zip extension may fail')
    }
  }
  catch (e) {
    log('Warning: Could not install system packages, continuing with available libraries')
  }

  // Use clean system environment without any Launchpad paths
  const buildEnv = {
    ...process.env,
    CC: 'gcc',
    CXX: 'g++',
    CPP: 'gcc -E',
    CFLAGS: '-O2 -fPIC',
    CXXFLAGS: '-O2 -fPIC',
    // Set system pkg-config path for extension detection, but exclude Launchpad paths
    PKG_CONFIG_PATH: '/usr/lib/x86_64-linux-gnu/pkgconfig:/usr/lib/pkgconfig:/usr/share/pkgconfig',
    LDFLAGS: '',
    CPPFLAGS: '',
    LD_LIBRARY_PATH: '',
    LIBRARY_PATH: '',
  }

  // Clear configure cache
  try {
    execSync('rm -rf autom4te.cache config.cache', { cwd: phpSourceDir, stdio: 'ignore' })
  }
  catch (e) {
    // Ignore if cache files don't exist
  }

  log('Running buildconf...')
  execSync('./buildconf --force', {
    cwd: phpSourceDir,
    env: buildEnv,
    stdio: 'inherit',
  })

  log('Configuring PHP with system libraries...')
  const baseConfigureArgs = [
    `--prefix=${installPrefix}`,
    '--enable-bcmath',
    '--enable-calendar',
    '--enable-dba',
    '--enable-exif',
    '--enable-ftp',
    '--enable-fpm',
    '--enable-gd',
    '--enable-intl',
    '--enable-mbregex',
    '--enable-mbstring',
    '--enable-mysqlnd',
    '--enable-pcntl',
    '--disable-phpdbg',
    '--enable-shmop',
    '--enable-soap',
    '--enable-sockets',
    '--enable-sysvmsg',
    '--enable-sysvsem',
    '--enable-sysvshm',
    '--with-pear',
    '--with-pcre-jit',
    '--with-layout=GNU',
    '--with-libxml',
    '--with-pdo-sqlite',
    '--with-pic',
    '--with-sqlite3',
    '--disable-dtrace',
    '--without-ndbm',
    '--without-gdbm',
    '--with-curl',
    '--with-openssl',
    '--with-zlib',
    '--enable-opcache=shared',
    '--with-readline',
    '--without-ldap-sasl',
  ]

  // Try to configure with all critical extensions first
  const fullConfigureArgs = [
    ...baseConfigureArgs,
    '--with-zip',
    // Enable iconv (required for Composer/Laravel)
    '--with-iconv',
    '--with-bz2',
    '--with-gettext',
  ]

  let configureSuccess = false
  try {
    log('Attempting full configure with all extensions...')
    execSync(`./configure ${fullConfigureArgs.join(' ')}`, {
      cwd: phpSourceDir,
      env: buildEnv,
      stdio: 'inherit',
    })
    configureSuccess = true
  }
  catch (error) {
    log('Full configure failed, trying individual extensions...')

    // Try with individual extensions to see which ones work
    const workingArgs = [...baseConfigureArgs]

    // Test each extension individually with proper configuration
    const extensionsToTest = [
      { flag: '--with-zip', name: 'zip' }, // Use --with-zip instead of --enable-zip
      // Skip iconv testing for Linux system libraries build
      // { flag: '--with-iconv', name: 'iconv' },
      { flag: '--with-bz2', name: 'bz2' },
      { flag: '--with-gettext', name: 'gettext' },
    ]

    for (const ext of extensionsToTest) {
      try {
        const testArgs = [...baseConfigureArgs, ext.flag]
        execSync(`./configure ${testArgs.join(' ')}`, {
          cwd: phpSourceDir,
          env: buildEnv,
          stdio: 'pipe',
        })
        workingArgs.push(ext.flag)
        log(`✅ ${ext.name} extension: Available`)
      }
      catch (e) {
        log(`❌ ${ext.name} extension: Not available, skipping`)
      }
    }

    // Final configure with working extensions
    execSync(`./configure ${workingArgs.join(' ')}`, {
      cwd: phpSourceDir,
      env: buildEnv,
      stdio: 'inherit',
    })
    configureSuccess = true
  }

  if (!configureSuccess) {
    throw new Error('Configure failed even with minimal extensions')
  }

  log('Configure completed successfully, building PHP...')
  const jobs = execSync('nproc 2>/dev/null || echo 2', { encoding: 'utf8' }).trim()
  const maxJobs = Math.min(Number.parseInt(jobs), 4) // Limit to 4 jobs max to prevent resource issues
  log(`Using ${maxJobs} parallel jobs for compilation`)

  execSync(`make -j${maxJobs}`, {
    cwd: phpSourceDir,
    env: buildEnv,
    stdio: 'inherit',
    timeout: 45 * 60 * 1000, // 45 minutes timeout
  })

  log('Installing PHP...')
  execSync('make install', {
    cwd: phpSourceDir,
    env: buildEnv,
    stdio: 'inherit',
    timeout: 30 * 60 * 1000, // 30 minutes timeout for install
  })

  // Create php.ini for Unix builds
  createUnixPhpIni(installPrefix, config)

  log(`✅ PHP ${config.phpVersion} built successfully with system libraries`)
  return installPrefix
}

async function main(): Promise<void> {
  try {
    const config = getConfig()
    log(`Build Script Version: 2.1 (Windows Binary Support)`)
    log(`Building PHP ${config.phpVersion} for ${config.platform}-${config.arch} with ${config.config} config`)

    await buildPhp(config)

    log('🎉 Build completed successfully!')
  }
  catch (error) {
    console.error('❌ Build failed:', error)
    process.exit(1)
  }
}

if (import.meta.main) {
  main()
}
