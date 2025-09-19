import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import * as fs from 'node:fs'
import { join } from 'node:path'
import { logUniqueMessage } from '../logging'

export interface PhpBuildConfig {
  version: string
  config: 'laravel-mysql' | 'laravel-postgres' | 'laravel-sqlite' | 'api-only' | 'enterprise' | 'wordpress' | 'full-stack'
  platform: 'linux' | 'darwin' | 'win32'
  arch: 'x64' | 'arm64' | 'x86_64'
  outputDir: string
  buildDir: string
}

export interface PhpExtensions {
  base: string[]
  mysql?: string[]
  postgres?: string[]
  sqlite?: string[]
  enterprise?: string[]
  wordpress?: string[]
  fullStack?: string[]
}

export class PhpPrecompiler {
  private config: PhpBuildConfig
  private extensions: PhpExtensions
  private env: Record<string, string> = {}

  constructor(config: PhpBuildConfig) {
    this.config = config
    this.extensions = this.getExtensionsForConfig()
    this.setupEnvironment()
  }

  private getExtensionsForConfig(): PhpExtensions {
    return {
      base: [
        // Core CLI and FPM
        '--enable-cli',
        '--enable-fpm',

        // Essential string and encoding extensions
        '--enable-mbstring',
        '--with-iconv',
        '--enable-iconv',

        // Core extensions required by Composer and Laravel
        '--enable-filter',
        '--enable-hash',
        '--enable-json',
        '--enable-ctype',
        '--enable-tokenizer',
        '--enable-session',
        '--enable-fileinfo',
        '--enable-opcache',

        // Phar support (essential for Composer)
        '--enable-phar',

        // XML processing (required by many packages)
        '--enable-dom',
        '--enable-xml',
        '--enable-xmlreader',
        '--enable-xmlwriter',
        '--enable-simplexml',
        '--enable-libxml',
        '--with-libxml',

        // Network and crypto
        '--with-curl',
        '--with-openssl',
        '--enable-openssl',

        // Compression
        '--with-zip',
        '--with-zlib',
        '--enable-zlib',

        // PCRE (Perl Compatible Regular Expressions)
        '--enable-pcre',

        // Date and time
        '--enable-calendar',

        // File operations
        '--enable-ftp',

        // Process control (useful for Laravel queues)
        '--enable-pcntl',
        '--enable-posix',

        // Shared memory (useful for caching)
        '--enable-shmop',
        '--enable-sysvmsg',
        '--enable-sysvsem',
        '--enable-sysvshm',

        // Socket support
        '--enable-sockets',

        // Additional useful extensions
        '--enable-exif',
        '--enable-bcmath',
        '--with-bz2',
        '--with-gettext',
        '--with-readline',
      ],
      mysql: [
        '--with-pdo-mysql',
        '--with-mysqli',
        '--enable-gd',
        '--with-jpeg',
        '--with-png',
        '--with-webp',
        '--with-freetype',
      ],
      postgres: [
        '--with-pdo-pgsql',
        '--with-pgsql',
        '--enable-gd',
        '--with-jpeg',
        '--with-png',
        '--with-webp',
        '--with-freetype',
      ],
      sqlite: [
        '--with-pdo-sqlite',
        '--with-sqlite3',
        '--enable-gd',
        '--with-jpeg',
        '--with-png',
        '--with-webp',
        '--with-freetype',
      ],
      enterprise: [
        '--with-pdo-mysql',
        '--with-pdo-pgsql',
        '--with-pdo-sqlite',
        '--with-mysqli',
        '--with-pgsql',
        '--with-sqlite3',
        '--enable-gd',
        '--with-jpeg',
        '--with-png',
        '--with-webp',
        '--with-freetype',
        '--enable-soap',
        '--with-gmp',
        '--with-ldap',
        '--with-xsl',
        '--with-sodium',
        '--enable-intl',
        '--with-tidy',
      ],
      wordpress: [
        '--with-pdo-mysql',
        '--with-mysqli',
        '--enable-gd',
        '--with-jpeg',
        '--with-png',
        '--with-webp',
        '--with-freetype',
        '--enable-soap',
      ],
      fullStack: [
        '--with-pdo-mysql',
        '--with-pdo-pgsql',
        '--with-pdo-sqlite',
        '--with-mysqli',
        '--with-pgsql',
        '--with-sqlite3',
        '--enable-gd',
        '--with-jpeg',
        '--with-png',
        '--with-webp',
        '--with-freetype',
        '--enable-soap',
        '--with-gmp',
        '--with-ldap',
        '--with-xsl',
        '--with-sodium',
        '--enable-intl',
        '--with-tidy',
        '--enable-dba',
        '--with-enchant',
        '--with-snmp',
      ],
    }
  }

  private setupEnvironment(): void {
    const currentPlatform = this.config.platform

    if (currentPlatform === 'darwin') {
      this.setupMacOSEnvironment()
    }
    else if (currentPlatform === 'linux') {
      this.setupLinuxEnvironment()
    }
    else if (currentPlatform === 'win32') {
      this.setupWindowsEnvironment()
    }
  }

  private setupMacOSEnvironment(): void {
    // Simplified environment setup - minimal variables only
    this.env = {
      CC: 'clang',
      CXX: 'clang++',
      CPP: 'clang -E',
    }
  }

  private setupLinuxEnvironment(): void {
    // Simplified environment setup - minimal variables only
    this.env = {
      CC: 'gcc',
      CXX: 'g++',
      CPP: 'gcc -E',
    }
  }

  private setupWindowsEnvironment(): void {
    this.env = {
      // Windows environment setup would go here
    }
  }

  private getCXXFlags(): string {
    const phpVersion = this.config.version
    const [major, minor] = phpVersion.split('.').map(Number)

    if (major === 8 && minor >= 2) {
      return '-std=c++17 -stdlib=libc++'
    }
    return '-std=c++14 -stdlib=libc++'
  }

  private getMacOSLDFlags(launchpadDir: string): string {
    const libDirs = this.findLatestLibDirs(launchpadDir)

    // Add specific path for libintl (gettext)
    const gettextLibDir = `${launchpadDir}/gnu.org/gettext/v0.22.5/lib`
    if (!libDirs.includes(gettextLibDir)) {
      libDirs.push(gettextLibDir)
    }

    const ldflags = libDirs.map(dir => `-L${dir}`).join(' ')
    const rpath = libDirs.map(dir => `-Wl,-rpath,${dir}`).join(' ')
    return `${ldflags} ${rpath} -Wl,-search_paths_first -stdlib=libc++`
  }

  private getMacOSCPPFlags(launchpadDir: string): string {
    const includeDirs = this.findLatestIncludeDirs(launchpadDir)
    return includeDirs.map(dir => `-I${dir}`).join(' ')
  }

  private getMacOSPkgConfigPath(launchpadDir: string): string {
    const pkgConfigDirs = this.findLatestPkgConfigDirs(launchpadDir)
    return pkgConfigDirs.join(':')
  }

  private getMacOSDyldPath(launchpadDir: string): string {
    const libDirs = this.findLatestLibDirs(launchpadDir)
    return libDirs.join(':')
  }

  private findLatestLibDirs(launchpadDir: string): string[] {
    // Implementation to find latest version directories
    // This would scan for domain directories and find latest versions
    return []
  }

  private findLatestIncludeDirs(launchpadDir: string): string[] {
    // Implementation to find latest include directories
    return []
  }

  private findLatestPkgConfigDirs(launchpadDir: string): string[] {
    // Implementation to find latest pkg-config directories
    return []
  }

  private getConfigureExtensions(): string {
    const configExtensions = {
      'laravel-mysql': [...this.extensions.base, ...this.extensions.mysql!],
      'laravel-postgres': [...this.extensions.base, ...this.extensions.postgres!],
      'laravel-sqlite': [...this.extensions.base, ...this.extensions.sqlite!],
      'api-only': this.extensions.base,
      'enterprise': [...this.extensions.base, ...this.extensions.enterprise!],
      'wordpress': [...this.extensions.base, ...this.extensions.wordpress!],
      'full-stack': [...this.extensions.base, ...this.extensions.fullStack!],
    }

    return configExtensions[this.config.config].join(' ')
  }

  async downloadPhpSource(): Promise<string> {
    const phpSourceDir = join(this.config.buildDir, `php-${this.config.version}`)

    if (existsSync(phpSourceDir)) {
      logUniqueMessage(`PHP source already exists at ${phpSourceDir}`)
      return phpSourceDir
    }

    mkdirSync(this.config.buildDir, { recursive: true })

    const tarballUrl = `https://www.php.net/distributions/php-${this.config.version}.tar.gz`
    const tarballPath = join(this.config.buildDir, 'php.tar.gz')

    logUniqueMessage(`Downloading PHP ${this.config.version} from ${tarballUrl}`)

    try {
      // Try curl first (available by default on macOS/Linux), then fallback to wget
      try {
        execSync(`curl -L -k -o "${tarballPath}" "${tarballUrl}"`, {
          stdio: 'inherit',
          cwd: this.config.buildDir,
        })
      }
      catch (curlError) {
        // Fallback to wget if curl fails
        const wgetPath = `${process.env.HOME}/.local/gnu.org/wget/v1.25.0/bin/wget`
        execSync(`"${wgetPath}" --no-check-certificate -O "${tarballPath}" "${tarballUrl}"`, {
          stdio: 'inherit',
          cwd: this.config.buildDir,
        })
      }

      logUniqueMessage('Extracting PHP source...')
      execSync(`tar -xzf php.tar.gz`, {
        stdio: 'inherit',
        cwd: this.config.buildDir,
      })

      return phpSourceDir
    }
    catch (error) {
      throw new Error(`Failed to download PHP source: ${error}`)
    }
  }

  async prepareBuildEnvironment(phpSourceDir: string): Promise<void> {
    logUniqueMessage('Preparing build environment...')

    // Clean any existing autoconf cache
    const cacheFiles = ['autom4te.cache', 'config.cache']
    for (const file of cacheFiles) {
      const filePath = join(phpSourceDir, file)
      if (existsSync(filePath)) {
        rmSync(filePath, { recursive: true, force: true })
      }
    }
  }

  async runBuildconf(phpSourceDir: string): Promise<void> {
    logUniqueMessage('Running buildconf...')

    try {
      execSync('./buildconf --force', {
        stdio: 'inherit',
        cwd: phpSourceDir,
        env: { ...process.env, ...this.env },
      })
    }
    catch (error) {
      logUniqueMessage('⚠️ buildconf --force failed, trying without --force')
      execSync('./buildconf', {
        stdio: 'inherit',
        cwd: phpSourceDir,
        env: { ...process.env, ...this.env },
      })
    }
  }

  async configure(phpSourceDir: string): Promise<void> {
    const installPrefix = join(this.config.outputDir, this.getBinaryName())
    mkdirSync(installPrefix, { recursive: true })

    // Use proper configure approach with required extensions
    const extensions = this.getConfigureExtensions()
    const baseArgs = [
      `--prefix=${installPrefix}`,
      '--disable-cgi',
      '--without-pear',
      '--without-pcre-jit',
      // Force enable essential extensions that might be auto-disabled
      '--enable-mbstring',
      '--enable-filter',
      '--enable-ctype',
      '--enable-tokenizer',
      '--enable-session',
      '--enable-fileinfo',
      '--enable-opcache',
      '--enable-dom',
      '--enable-xml',
      '--enable-xmlreader',
      '--enable-xmlwriter',
      '--enable-simplexml',
      '--enable-calendar',
      '--enable-ftp',
      '--enable-pcntl',
      '--enable-posix',
      '--enable-shmop',
      '--enable-sockets',
      '--enable-exif',
      '--enable-bcmath',
      '--with-readline',
      '--with-curl',
      '--with-openssl',
      '--with-zip',
      '--with-zlib',
      ...extensions.split(' '),
    ]

    // Platform-specific dependency paths
    // Platform-specific configure arguments
    if (this.config.platform === 'darwin') {
      // macOS: Use Homebrew paths if available, otherwise system paths
      const brewPrefix = '/opt/homebrew'
      const brewPrefixIntel = '/usr/local'

      // Helper function to find Homebrew or system paths
      const findLibPath = (libName: string): string | null => {
        const paths = [
          `${brewPrefix}/opt/${libName}`,
          `${brewPrefixIntel}/opt/${libName}`,
          `/usr/local/opt/${libName}`,
          `/usr/local`,
        ]

        for (const path of paths) {
          if (existsSync(path)) {
            return path
          }
        }
        return null
      }

      // Add explicit paths for dependencies that need them
      const iconvPath = findLibPath('libiconv')
      if (iconvPath) {
        baseArgs.push(`--with-iconv=${iconvPath}`)
      }
      else {
        baseArgs.push('--with-iconv')
      }

      const gettextPath = findLibPath('gettext')
      if (gettextPath) {
        baseArgs.push(`--with-gettext=${gettextPath}`)
      }
      else {
        baseArgs.push('--with-gettext')
      }

      const bz2Path = findLibPath('bzip2')
      if (bz2Path) {
        baseArgs.push(`--with-bz2=${bz2Path}`)
      }
      else {
        // Try system bz2
        if (existsSync('/usr/lib/libbz2.dylib') || existsSync('/usr/local/lib/libbz2.dylib')) {
          baseArgs.push('--with-bz2')
        }
        else {
          baseArgs.push('--without-bz2')
        }
      }
    }
    else {
      // Linux: Use standard flags
      baseArgs.push('--with-iconv', '--with-bz2', '--with-gettext')
    }

    logUniqueMessage(`Configuring PHP with comprehensive extensions: ${baseArgs.join(' ')}`)

    // Set up environment for configure
    const configureEnv: Record<string, string> = {
      ...process.env,
      CC: 'clang',
      CXX: 'clang++',
    }

    // Platform-specific library paths
    if (this.config.platform === 'darwin') {
      // macOS: Set up proper environment for Launchpad dependencies
      const homeDir = process.env.HOME
      if (!homeDir) {
        throw new Error('HOME environment variable must be set for macOS builds')
      }
      const launchpadLibs = `${homeDir}/.local`

      // Use existing environment variables from Launchpad
      if (process.env.PKG_CONFIG_PATH) {
        configureEnv.PKG_CONFIG_PATH = process.env.PKG_CONFIG_PATH
      }
      if (process.env.CPPFLAGS) {
        configureEnv.CPPFLAGS = process.env.CPPFLAGS.trim()
      }
      if (process.env.LDFLAGS) {
        // Add resolver library for DNS functions on macOS
        const baseFlags = process.env.LDFLAGS.trim()
        configureEnv.LDFLAGS = `${baseFlags} -lresolv`
      }
      else {
        configureEnv.LDFLAGS = '-lresolv'
      }
      if (process.env.DYLD_LIBRARY_PATH) {
        configureEnv.DYLD_LIBRARY_PATH = process.env.DYLD_LIBRARY_PATH
      }
    }
    else {
      // Linux: Use standard pkg-config paths
      configureEnv.PKG_CONFIG_PATH = '/usr/lib/pkgconfig:/usr/share/pkgconfig:/usr/local/lib/pkgconfig'
      configureEnv.CPPFLAGS = '-I/usr/include -I/usr/local/include'
      configureEnv.LDFLAGS = '-L/usr/lib -L/usr/local/lib'
    }

    try {
      execSync(`./configure ${baseArgs.join(' ')}`, {
        stdio: 'inherit',
        cwd: phpSourceDir,
        env: configureEnv,
      })

      // Verify that extensions were actually configured
      logUniqueMessage('Verifying configured extensions...')
      try {
        const makefileContent = fs.readFileSync(join(phpSourceDir, 'Makefile'), 'utf-8')
        const essentialExts = ['mbstring', 'iconv', 'filter', 'ctype', 'tokenizer', 'session', 'fileinfo', 'opcache', 'dom', 'xml']
        const missingExts = essentialExts.filter(ext => !makefileContent.includes(ext))

        if (missingExts.length > 0) {
          logUniqueMessage(`⚠️ Warning: Some extensions may not be configured: ${missingExts.join(', ')}`)
        }
        else {
          logUniqueMessage('✅ All essential extensions appear to be configured')
        }
      }
      catch (verifyError) {
        logUniqueMessage('⚠️ Could not verify extension configuration')
      }
    }
    catch (error) {
      // Show config.log on failure
      try {
        const configLog = join(phpSourceDir, 'config.log')
        if (existsSync(configLog)) {
          logUniqueMessage('❌ Configure failed. Config.log contents:')
          execSync(`tail -n 100 config.log`, { stdio: 'inherit', cwd: phpSourceDir })
        }
      }
      catch {}
      throw new Error(`Configure failed: ${error}`)
    }
  }

  async build(phpSourceDir: string): Promise<void> {
    const jobs = this.config.platform === 'darwin'
      ? execSync('sysctl -n hw.ncpu', { encoding: 'utf8' }).trim()
      : execSync('nproc', { encoding: 'utf8' }).trim()

    logUniqueMessage(`Building PHP with ${jobs} parallel jobs`)

    try {
      execSync(`make -j${jobs}`, {
        stdio: 'inherit',
        cwd: phpSourceDir,
        env: { ...process.env, ...this.env },
      })
    }
    catch (error) {
      throw new Error(`Build failed: ${error}`)
    }
  }

  async install(phpSourceDir: string): Promise<void> {
    logUniqueMessage('Installing PHP...')

    try {
      execSync('make install', {
        stdio: 'inherit',
        cwd: phpSourceDir,
        env: { ...process.env, ...this.env },
      })
    }
    catch (error) {
      throw new Error(`Install failed: ${error}`)
    }
  }

  private getBinaryName(): string {
    return `php-${this.config.version}-${this.config.platform}-${this.config.arch}-${this.config.config}`
  }

  async buildPhp(): Promise<string> {
    logUniqueMessage(`Starting PHP ${this.config.version} build for ${this.config.platform}-${this.config.arch} (${this.config.config})`)

    try {
      const phpSourceDir = await this.downloadPhpSource()
      await this.prepareBuildEnvironment(phpSourceDir)
      await this.runBuildconf(phpSourceDir)
      await this.configure(phpSourceDir)
      await this.build(phpSourceDir)
      await this.install(phpSourceDir)

      const binaryPath = join(this.config.outputDir, this.getBinaryName())
      logUniqueMessage(`PHP build completed successfully: ${binaryPath}`)
      return binaryPath
    }
    catch (error) {
      logUniqueMessage(`❌ PHP build failed: ${error}`)
      throw error
    }
  }
}
