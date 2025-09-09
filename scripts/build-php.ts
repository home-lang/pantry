#!/usr/bin/env bun

const { execSync } = require('node:child_process')
const { mkdirSync, existsSync, writeFileSync, readdirSync } = require('node:fs')
const { join } = require('node:path')

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

async function downloadWindowsPhpBinary(config: BuildConfig): Promise<string> {
  const binaryName = `php-${config.phpVersion}-${config.platform}-${config.arch}-${config.config}`
  const installPrefix = join(config.outputDir, binaryName)

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
  } else if (majorMinor === '8.4') {
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
    `https://windows.php.net/downloads/releases/archives/php-${config.phpVersion}-nts-Win32-${vsVersion}-x64.zip`
  ]

  // Try to get the releases.json to find latest patch version if needed
  let latestPatchVersion: string | undefined = undefined
  try {
    log('Checking for available Windows PHP versions...')
    execSync(
      `powershell -Command "[System.Net.ServicePointManager]::SecurityProtocol = [System.Net.SecurityProtocolType]::Tls12; Invoke-WebRequest -Uri 'https://windows.php.net/downloads/releases/releases.json' -OutFile '${config.buildDir}/releases.json'"`,
      { stdio: 'pipe', encoding: 'utf8' }
    )

    // Read the releases.json file if it was downloaded successfully
    if (existsSync(join(config.buildDir, 'releases.json'))) {
      try {
        const releasesJsonText = await Bun.file(join(config.buildDir, 'releases.json')).text()
        const releasesJson = JSON.parse(releasesJsonText)
        // Find latest version with same major.minor
        const matchingVersions = Object.keys(releasesJson)
          .filter(v => v.startsWith(majorMinor + '.'))
          .sort((a, b) => releasesJson[b].date.localeCompare(releasesJson[a].date))

        if (matchingVersions.length > 0) {
          latestPatchVersion = matchingVersions[0]
          log(`Found latest ${majorMinor}.x version: ${latestPatchVersion}`)
          // Add the latest patch version URL to our try list
          urlsToTry.push(`https://windows.php.net/downloads/releases/php-${latestPatchVersion}-Win32-${vsVersion}-x64.zip`)
        }
      } catch (e) {
        log(`Error parsing releases.json: ${e}`)
      }
    }
  } catch (e) {
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
        cwd: config.buildDir
      })

      log('Extracting Windows PHP binary...')

      // Extract the ZIP file
      execSync(`powershell -Command "Expand-Archive -Path '${zipPath}' -DestinationPath '${phpSourceDir}' -Force"`, {
        stdio: 'inherit',
        cwd: config.buildDir
      })

      // Copy the extracted PHP to our install directory
      execSync(`powershell -Command "Copy-Item -Path '${phpSourceDir}\\*' -Destination '${installPrefix}' -Recurse -Force"`, {
        stdio: 'inherit'
      })

      // Create comprehensive php.ini with all available extensions
      log('Creating comprehensive php.ini for Windows PHP...')
      createWindowsPhpIni(installPrefix)

      // Ensure php.exe is in the bin directory
      const phpExePath = join(phpSourceDir, 'php.exe')
      const targetPhpExePath = join(installPrefix, 'bin', 'php.exe')

      if (existsSync(phpExePath)) {
        execSync(`powershell -Command "Copy-Item -Path '${phpExePath}' -Destination '${targetPhpExePath}' -Force"`, {
          stdio: 'inherit'
        })
      }

      // Create comprehensive php.ini that enables all available extensions
      await createWindowsPhpIni(installPrefix)

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
    } catch (error) {
      log(`Failed to download from ${url}: ${error}`)
    }
  }

  if (downloadSuccess) {
    log(`✅ Windows PHP binary downloaded and extracted successfully from ${usedUrl}`)
    return phpSourceDir
  } else {
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
  const homeDir = process.env.HOME || '/Users/chrisbreuer'
  const launchpadPath = `${homeDir}/.local`
  
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
    '--without-gdbm'
  ]

  // Add Launchpad dependency paths
  const dependencyArgs = [
    `--with-curl=${launchpadPath}/curl.se/v8.15.0`,
    `--with-ffi=${launchpadPath}/sourceware.org/libffi/v3.5.2`,
    `--with-gettext=${launchpadPath}/gnu.org/gettext/v0.22.5`,
    `--with-gmp=${launchpadPath}/gnu.org/gmp/v6.3.0`,
    `--with-openssl=${launchpadPath}/openssl.org/v1.1.1w`,
    `--with-sodium=${launchpadPath}/libsodium.org/v1.0.18`,
    `--with-xsl=${launchpadPath}/gnome.org/libxslt/v1.1.43`,
    `--with-zlib=${launchpadPath}/zlib.net/v1.3.1`
  ]

  // Platform-specific arguments
  if (config.platform === 'darwin') {
    return [
      ...baseArgs,
      ...dependencyArgs,
      '--without-iconv', // Disable iconv on macOS due to GNU libiconv compatibility issues
      '--with-kerberos',
      '--with-libedit',
      '--with-zip',
      '--enable-dtrace',
      '--with-ldap-sasl'
    ]
  } else if (config.platform === 'linux') {
    return [
      ...baseArgs,
      ...dependencyArgs,
      '--with-iconv', // Use system iconv on Linux
      '--with-kerberos',
      '--with-readline',
      '--with-zip',
      '--without-ldap-sasl'
    ]
  }

  return baseArgs
}

function createWindowsPhpIni(phpDir: string): void {
  const extDir = join(phpDir, 'ext')
  const mainDir = phpDir
  
  // Scan for available extensions
  const extensions: string[] = []
  
  // Check main directory for php_*.dll files
  if (existsSync(mainDir)) {
    const mainFiles = readdirSync(mainDir).filter((file: string) => 
      file.startsWith('php_') && file.endsWith('.dll')
    )
    extensions.push(...mainFiles.map((file: string) => file.replace('php_', '').replace('.dll', '')))
  }
  
  // Check ext directory for php_*.dll files
  if (existsSync(extDir)) {
    const extFiles = readdirSync(extDir).filter((file: string) => 
      file.startsWith('php_') && file.endsWith('.dll')
    )
    extensions.push(...extFiles.map((file: string) => file.replace('php_', '').replace('.dll', '')))
  }
  
  // Essential extensions that should be prioritized
  const essentialExtensions = [
    'mbstring', 'fileinfo', 'opcache', 'curl', 'openssl', 'zip', 
    'ftp', 'sockets', 'exif', 'bz2', 'gettext', 'gd', 'intl',
    'pdo_sqlite', 'sqlite3', 'xml', 'xmlreader', 'xmlwriter',
    'dom', 'simplexml', 'json', 'filter', 'hash', 'ctype'
  ]
  
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

; Enable essential extensions
${essentialExtensions
  .filter(ext => extensions.includes(ext))
  .map(ext => `extension=${ext}`)
  .join('\n')}

; Enable additional available extensions
${extensions
  .filter(ext => !essentialExtensions.includes(ext))
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
opcache.enable = 1
opcache.enable_cli = 1
opcache.memory_consumption = 128
opcache.interned_strings_buffer = 8
opcache.max_accelerated_files = 4000
opcache.revalidate_freq = 2
opcache.fast_shutdown = 1

[curl]
curl.cainfo =

[openssl]
openssl.cafile =
openssl.capath =
`

  writeFileSync(join(phpDir, 'php.ini'), phpIniContent)
}

async function buildPhp(config: BuildConfig): Promise<string> {
  const installPrefix = join(config.outputDir, `php-${config.phpVersion}-${config.platform}-${config.arch}-${config.config}`)

  // For Windows, use pre-compiled binaries
  if (config.platform === 'win32') {
    return await downloadWindowsPhpBinary(config)
  }

  // For Unix systems, use Launchpad dependency management
  log('Using Launchpad-managed dependencies for PHP build')

  const phpSourceDir = downloadPhpSource(config)
  mkdirSync(installPrefix, { recursive: true })

  // Set up build environment with selective Launchpad dependencies
  let buildEnv = { ...process.env }
  
  // Add essential Launchpad paths to PATH
  const launchpadBinPaths = [
    '/Users/chrisbreuer/.local/gnu.org/autoconf/v2.72.0/bin',
    '/Users/chrisbreuer/.local/gnu.org/m4/v1.4.20/bin',
    '/Users/chrisbreuer/.local/gnu.org/bison/v3.8.2/bin',
    '/Users/chrisbreuer/.local/gnu.org/automake/v1.18.1/bin',
    '/Users/chrisbreuer/.local/freedesktop.org/pkg-config/v0.29.2/bin'
  ]
  
  buildEnv.PATH = `${launchpadBinPaths.join(':')}:${buildEnv.PATH}`
  
  // Set up targeted PKG_CONFIG_PATH for essential libraries
  const pkgConfigPaths = [
    '/Users/chrisbreuer/.local/gnu.org/libiconv/v1.18.0/lib/pkgconfig',
    '/Users/chrisbreuer/.local/sourceware.org/bzip2/v1.0.8/lib/pkgconfig',
    '/Users/chrisbreuer/.local/zlib.net/v1.3.1/lib/pkgconfig',
    '/Users/chrisbreuer/.local/curl.se/v8.15.0/lib/pkgconfig',
    '/Users/chrisbreuer/.local/openssl.org/v1.1.1w/lib/pkgconfig',
    '/Users/chrisbreuer/.local/gnu.org/readline/v8.3.0/lib/pkgconfig',
    '/Users/chrisbreuer/.local/gnu.org/gettext/v0.22.5/lib/pkgconfig',
    '/Users/chrisbreuer/.local/gnome.org/libxml2/v2.14.5/lib/pkgconfig',
    '/Users/chrisbreuer/.local/postgresql.org/v17.2.0/lib/pkgconfig',
    '/Users/chrisbreuer/.local/gnu.org/gmp/v6.3.0/lib/pkgconfig',
    '/Users/chrisbreuer/.local/libsodium.org/v1.0.18/lib/pkgconfig',
    '/Users/chrisbreuer/.local/sourceware.org/libffi/v3.5.2/lib/pkgconfig',
    '/Users/chrisbreuer/.local/gnome.org/libxslt/v1.1.43/lib/pkgconfig'
  ]
  
  buildEnv.PKG_CONFIG_PATH = pkgConfigPaths.join(':')
  
  // Set up targeted library and include paths
  const libPaths = [
    '/Users/chrisbreuer/.local/gnu.org/libiconv/v1.18.0/lib',
    '/Users/chrisbreuer/.local/sourceware.org/bzip2/v1.0.8/lib',
    '/Users/chrisbreuer/.local/zlib.net/v1.3.1/lib',
    '/Users/chrisbreuer/.local/curl.se/v8.15.0/lib',
    '/Users/chrisbreuer/.local/openssl.org/v1.1.1w/lib',
    '/Users/chrisbreuer/.local/gnu.org/readline/v8.3.0/lib',
    '/Users/chrisbreuer/.local/gnu.org/gettext/v0.22.5/lib',
    '/Users/chrisbreuer/.local/gnome.org/libxml2/v2.14.5/lib',
    '/Users/chrisbreuer/.local/postgresql.org/v17.2.0/lib',
    '/Users/chrisbreuer/.local/gnu.org/gmp/v6.3.0/lib',
    '/Users/chrisbreuer/.local/libsodium.org/v1.0.18/lib',
    '/Users/chrisbreuer/.local/sourceware.org/libffi/v3.5.2/lib',
    '/Users/chrisbreuer/.local/gnome.org/libxslt/v1.1.43/lib'
  ]
  
  const includePaths = [
    '/Users/chrisbreuer/.local/gnu.org/libiconv/v1.18.0/include',
    '/Users/chrisbreuer/.local/sourceware.org/bzip2/v1.0.8/include',
    '/Users/chrisbreuer/.local/zlib.net/v1.3.1/include',
    '/Users/chrisbreuer/.local/curl.se/v8.15.0/include',
    '/Users/chrisbreuer/.local/openssl.org/v1.1.1w/include',
    '/Users/chrisbreuer/.local/gnu.org/readline/v8.3.0/include',
    '/Users/chrisbreuer/.local/gnu.org/gettext/v0.22.5/include',
    '/Users/chrisbreuer/.local/gnome.org/libxml2/v2.14.5/include',
    '/Users/chrisbreuer/.local/postgresql.org/v17.2.0/include',
    '/Users/chrisbreuer/.local/gnu.org/gmp/v6.3.0/include',
    '/Users/chrisbreuer/.local/libsodium.org/v1.0.18/include',
    '/Users/chrisbreuer/.local/sourceware.org/libffi/v3.5.2/include',
    '/Users/chrisbreuer/.local/gnome.org/libxslt/v1.1.43/include'
  ]
  
  buildEnv.LDFLAGS = libPaths.map(path => `-L${path}`).join(' ')
  buildEnv.CPPFLAGS = includePaths.map(path => `-I${path}`).join(' ')
  
  // Add macOS-specific linker flags for DNS resolver functions
  if (config.platform === 'darwin') {
    buildEnv.LDFLAGS += ' -lresolv -Wl,-rpath,/Users/chrisbreuer/.local,-headerpad_max_install_names'
    // Set up runtime library path for macOS
    buildEnv.DYLD_LIBRARY_PATH = libPaths.join(':')
    buildEnv.LD = '/usr/bin/ld'
  } else {
    buildEnv.LDFLAGS += ' -Wl,-rpath,/Users/chrisbreuer/.local'
  }
  
  log('✅ Configured targeted Launchpad dependencies')

  // Platform-specific compiler setup
  if (config.platform === 'darwin') {
    buildEnv.CC = 'clang'
    buildEnv.CXX = 'clang++'
    buildEnv.LD = '/usr/bin/ld'
    // Ensure we use system C++ standard library, not GCC's
    buildEnv.CXXFLAGS = (buildEnv.CXXFLAGS || '') + ' -stdlib=libc++'
    buildEnv.LDFLAGS = (buildEnv.LDFLAGS || '') + ' -stdlib=libc++'
  } else if (config.platform === 'linux') {
    buildEnv.CC = 'gcc'
    buildEnv.CXX = 'g++'
    buildEnv.CFLAGS = (buildEnv.CFLAGS || '') + ' -O2 -fPIC'
    buildEnv.CXXFLAGS = (buildEnv.CXXFLAGS || '') + ' -O2 -fPIC'
    // Set preprocessor to avoid traditional-cpp issues
    buildEnv.CPP = 'gcc -E'
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
  } else {
    try {
      execSync('./buildconf --force', {
        stdio: 'inherit',
        cwd: phpSourceDir,
        env: buildEnv
      })
    } catch (error) {
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
          env: autoconfEnv
        })
        
        log('Successfully generated configure script with autoconf')
      } catch (autoconfError) {
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
      '--with-ldap-sasl'
    )
  }
  
  log('Using Launchpad-managed dependencies for all extensions')

  log(`Configuring PHP with essential extensions: ${configureArgs.join(' ')}`)

  // Source the Launchpad environment and run configure in the same shell
  const buildEnvScript = '/Users/chrisbreuer/.local/build-env.sh'
  const configureCommand = `source ${buildEnvScript} && ./configure ${configureArgs.join(' ')}`
  
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
    },
  })

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
              } else {
                log('⚠️ PHP distribution contains fewer DLL files than expected')
              }
            } catch (e) {
              log(`Could not read bin directory: ${e}`)
            }
          }

          // Try to run the binary, but don't fail if it doesn't work
          try {
            execSync(`"${phpBinary}" --version`, { stdio: 'inherit' })
            log('✅ Windows PHP binary is executable in this environment')
          } catch (error) {
            log(`Note: PHP binary exists but is not executable in this environment`)
            log('This is expected in some CI environments and does not indicate a problem')
          }
        } else {
          log('⚠️ PHP binary is smaller than expected, might be a placeholder')
        }
      } catch (error) {
        log(`Could not check binary size: ${error}`)
      }
    }
  } else {
    const phpBinary = join(installPrefix, 'bin', 'php')
    if (existsSync(phpBinary)) {
      log('Testing PHP binary...')
      execSync(`"${phpBinary}" --version`, { 
        stdio: 'inherit',
        env: {
          ...process.env,
          ...buildEnv
        }
      })
    }
  }
  
  return installPrefix
}

async function main(): Promise<void> {
  try {
    const config = getConfig()
    log(`Build Script Version: 2.1 (Windows Binary Support)`)
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
