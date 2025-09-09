import { execSync, spawn } from 'node:child_process'
import { existsSync, mkdirSync, writeFileSync, rmSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { homedir, platform, arch } from 'node:os'
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
        '--enable-cli',
        '--enable-fpm',
        '--enable-mbstring',
        '--enable-opcache',
        // Phar is enabled by default in PHP, but we explicitly ensure it's not disabled
        '--enable-phar',
        '--enable-filter',
        '--enable-hash',
        '--enable-json',
        '--enable-ctype',
        '--enable-tokenizer',
        '--enable-session',
        '--enable-fileinfo',
        '--enable-dom',
        '--enable-xml',
        '--enable-xmlreader',
        '--enable-xmlwriter',
        '--enable-simplexml',
        '--with-curl',
        '--with-openssl',
        '--with-zip',
        '--with-libxml',
        '--with-zlib',
        '--with-iconv',
        // Ensure phar.readonly is disabled for full phar functionality
        '--enable-phar'
      ],
      mysql: [
        '--enable-exif',
        '--enable-bcmath',
        '--with-pdo-mysql',
        '--with-mysqli',
        '--enable-gd',
        '--with-readline'
      ],
      postgres: [
        '--enable-exif',
        '--enable-bcmath',
        '--with-pdo-pgsql',
        '--with-pgsql',
        '--enable-gd',
        '--with-readline'
      ],
      sqlite: [
        '--enable-exif',
        '--enable-bcmath',
        '--with-pdo-sqlite',
        '--with-sqlite3',
        '--enable-gd',
        '--with-readline'
      ],
      enterprise: [
        '--enable-exif',
        '--enable-bcmath',
        '--with-pdo-mysql',
        '--with-pdo-pgsql',
        '--with-pdo-sqlite',
        '--with-mysqli',
        '--with-pgsql',
        '--with-sqlite3',
        '--enable-gd',
        '--enable-soap',
        '--enable-sockets',
        '--with-bz2',
        '--with-readline',
        '--enable-pcntl',
        '--enable-posix',
        '--with-gettext',
        '--with-gmp',
        '--with-ldap',
        '--with-xsl',
        '--with-sodium'
      ],
      wordpress: [
        '--enable-exif',
        '--with-pdo-mysql',
        '--with-mysqli',
        '--enable-gd'
      ],
      fullStack: [
        '--enable-exif',
        '--enable-bcmath',
        '--enable-calendar',
        '--enable-ftp',
        '--enable-sysvmsg',
        '--enable-sysvsem',
        '--enable-sysvshm',
        '--with-pdo-mysql',
        '--with-pdo-pgsql',
        '--with-pdo-sqlite',
        '--with-mysqli',
        '--with-pgsql',
        '--with-sqlite3',
        '--enable-gd',
        '--enable-soap',
        '--enable-sockets',
        '--with-bz2',
        '--with-readline',
        '--enable-pcntl',
        '--enable-posix',
        '--with-gettext',
        '--with-gmp',
        '--with-ldap',
        '--with-xsl',
        '--with-sodium',
        '--enable-shmop'
      ]
    }
  }

  private setupEnvironment(): void {
    const currentPlatform = this.config.platform

    if (currentPlatform === 'darwin') {
      this.setupMacOSEnvironment()
    } else if (currentPlatform === 'linux') {
      this.setupLinuxEnvironment()
    } else if (currentPlatform === 'win32') {
      this.setupWindowsEnvironment()
    }
  }

  private setupMacOSEnvironment(): void {
    // Simplified environment setup - minimal variables only
    this.env = {
      CC: 'clang',
      CXX: 'clang++',
      CPP: 'clang -E'
    }
  }

  private setupLinuxEnvironment(): void {
    // Simplified environment setup - minimal variables only
    this.env = {
      CC: 'gcc',
      CXX: 'g++',
      CPP: 'gcc -E'
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
      'full-stack': [...this.extensions.base, ...this.extensions.fullStack!]
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
      // Use the Launchpad-installed wget directly with SSL bypass
      const wgetPath = `${process.env.HOME}/.local/gnu.org/wget/v1.25.0/bin/wget`

      execSync(`"${wgetPath}" --no-check-certificate -O "${tarballPath}" "${tarballUrl}"`, {
        stdio: 'inherit',
        cwd: this.config.buildDir
      })

      logUniqueMessage('Extracting PHP source...')
      execSync(`tar -xzf php.tar.gz`, {
        stdio: 'inherit',
        cwd: this.config.buildDir
      })

      return phpSourceDir
    } catch (error) {
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
        env: { ...process.env, ...this.env }
      })
    } catch (error) {
      logUniqueMessage('⚠️ buildconf --force failed, trying without --force')
      execSync('./buildconf', {
        stdio: 'inherit',
        cwd: phpSourceDir,
        env: { ...process.env, ...this.env }
      })
    }
  }

  async configure(phpSourceDir: string): Promise<void> {
    const installPrefix = join(this.config.outputDir, this.getBinaryName())
    mkdirSync(installPrefix, { recursive: true })

    // Use proper configure approach with required extensions
    const extensions = this.getConfigureExtensions()
    const configureArgs = [
      `--prefix=${installPrefix}`,
      '--disable-cgi',
      '--without-pear',
      '--without-pcre-jit',
      ...extensions.split(' ')
    ]

    logUniqueMessage(`Configuring PHP with minimal approach: ${configureArgs.join(' ')}`)

    try {
      // Use simple CC=clang configure without complex environment variables
      execSync(`CC=clang ./configure ${configureArgs.join(' ')}`, {
        stdio: 'inherit',
        cwd: phpSourceDir,
        env: { ...process.env, CC: 'clang' }
      })
    } catch (error) {
      // Show config.log on failure
      try {
        const configLog = join(phpSourceDir, 'config.log')
        if (existsSync(configLog)) {
          logUniqueMessage('❌ Configure failed. Config.log contents:')
          execSync(`tail -n 100 config.log`, { stdio: 'inherit', cwd: phpSourceDir })
        }
      } catch {}
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
        env: { ...process.env, ...this.env }
      })
    } catch (error) {
      throw new Error(`Build failed: ${error}`)
    }
  }

  async install(phpSourceDir: string): Promise<void> {
    logUniqueMessage('Installing PHP...')

    try {
      execSync('make install', {
        stdio: 'inherit',
        cwd: phpSourceDir,
        env: { ...process.env, ...this.env }
      })
    } catch (error) {
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
    } catch (error) {
      logUniqueMessage(`❌ PHP build failed: ${error}`)
      throw error
    }
  }
}
