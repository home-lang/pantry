/* eslint-disable no-console */
import type { GitHubRelease } from './types'
import { Buffer } from 'node:buffer'
import { execSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'
import process from 'node:process'
import { config } from './config'
import { createShims } from './install-helpers'
import { logUniqueMessage } from './logging'

export interface BinaryInfo {
  filename: string
  size: number
  php_version: string
  platform: string
  architecture: string
  configuration: string
  built_at: string
  extensions: string
  download_url: string
}

export interface BinaryManifest {
  version: string
  built_at: string
  commit: string
  binaries: BinaryInfo[]
}

export class PrecompiledBinaryDownloader {
  private readonly GITHUB_REPO = 'stacksjs/launchpad'
  private readonly GITHUB_API = 'https://api.github.com'
  private readonly BINARY_CACHE_DIR: string

  constructor(private installPath: string) {
    this.BINARY_CACHE_DIR = path.join(installPath, '.cache', 'precompiled-binaries')
  }

  /**
   * Get the platform identifier for the current system
   */
  private getPlatform(): string {
    const platform = process.platform
    switch (platform) {
      case 'darwin': return 'darwin'
      case 'linux': return 'linux'
      case 'win32': return 'windows'
      default: throw new Error(`Unsupported platform: ${platform}`)
    }
  }

  /**
   * Get the architecture identifier for the current system
   */
  private getArchitecture(): string {
    const arch = process.arch
    switch (arch) {
      case 'x64': return 'x86_64'
      case 'arm64': return 'arm64'
      default: throw new Error(`Unsupported architecture: ${arch}`)
    }
  }

  /**
   * Detect the optimal PHP configuration based on the system and requirements
   */
  private getOptimalConfiguration(): string {
    // Default to full-stack (most comprehensive setup)
    return 'full-stack'
  }

  /**
   * Check if user has customized PHP extensions that require source build
   */
  private async hasCustomExtensions(): Promise<{ hasCustom: boolean, customExtensions: string[], reason: string }> {
    const phpConfig = config.services?.php

    // Auto-detection strategy - no custom extensions needed
    if (phpConfig?.strategy === 'auto-detect') {
      return { hasCustom: false, customExtensions: [], reason: 'Using auto-detection strategy' }
    }

    // Precompiled binary strategy - no custom extensions needed
    if (phpConfig?.strategy === 'precompiled-binary') {
      return { hasCustom: false, customExtensions: [], reason: 'Using precompiled binary strategy' }
    }

    // Legacy support for manual extension configuration (deprecated)
    if ((phpConfig as any)?.extensions) {
      console.warn('⚠️ Manual extension configuration is deprecated. Use auto-detection or manual configuration instead.')
      return { hasCustom: false, customExtensions: [], reason: 'Legacy extension configuration detected' }
    }

    return { hasCustom: false, customExtensions: [], reason: 'No custom extensions configured' }
  }

  /**
   * Check if user extensions are compatible with full-stack configuration
   */
  private isCompatibleWithFullStack(userExtensions: string[]): boolean {
    // Define what full-stack includes
    const fullStackExtensions = [
      'cli',
      'fpm',
      'mbstring',
      'opcache',
      'intl',
      'exif',
      'bcmath',
      'calendar',
      'ftp',
      'sysvmsg',
      'sysvsem',
      'sysvshm',
      'wddx',
      'pdo-mysql',
      'pdo-pgsql',
      'pdo-sqlite',
      'mysqli',
      'pgsql',
      'sqlite3',
      'curl',
      'openssl',
      'gd',
      'soap',
      'sockets',
      'zip',
      'bz2',
      'readline',
      'libxml',
      'zlib',
      'pcntl',
      'posix',
      'gettext',
      'gmp',
      'ldap',
      'xsl',
      'sodium',
      'iconv',
      'fileinfo',
      'json',
      'phar',
      'filter',
      'hash',
      'session',
      'tokenizer',
      'ctype',
      'dom',
      'simplexml',
      'xml',
      'xmlreader',
      'xmlwriter',
      'shmop',
    ]

    // Check if all user extensions are included in full-stack
    return userExtensions.every(ext => fullStackExtensions.includes(ext))
  }

  /**
   * Detect Laravel framework and suggest optimal configuration
   */
  private async detectFrameworkAndDatabase(): Promise<string> {
    const phpConfig = config.services?.php

    // Use manual configuration if specified
    if (phpConfig?.configuration) {
      if (config.verbose) {
        console.log(`🔧 Using manual configuration: ${phpConfig.configuration}`)
      }
      return phpConfig.configuration
    }

    // Use auto-detection if enabled
    if (phpConfig?.strategy === 'auto-detect') {
      try {
        const { PHPAutoDetector } = await import('./php/auto-detector')
        const detector = new PHPAutoDetector()
        const analysis = await detector.analyzeProject()

        console.log(detector.getConfigurationExplanation(analysis))

        return analysis.recommendedConfig
      }
      catch (error) {
        console.warn(`⚠️ Auto-detection failed: ${error instanceof Error ? error.message : String(error)}`)
        console.warn('🔄 Falling back to basic detection...')
      }
    }

    // Fallback to basic detection
    try {
      // eslint-disable-next-line ts/no-require-imports
      const fs = require('node:fs')

      // Check for Laravel
      if (fs.existsSync('artisan') && fs.existsSync('composer.json')) {
        try {
          const composerJson = JSON.parse(fs.readFileSync('composer.json', 'utf-8'))

          // Check if it's Laravel
          if (composerJson.require?.['laravel/framework']) {
            // Check database configuration
            const envPath = '.env'
            if (fs.existsSync(envPath)) {
              const envContent = fs.readFileSync(envPath, 'utf-8')

              if (envContent.includes('DB_CONNECTION=pgsql') || envContent.includes('DB_CONNECTION=postgres')) {
                return 'laravel-postgres'
              }
              else if (envContent.includes('DB_CONNECTION=sqlite')) {
                return 'laravel-sqlite'
              }
              // Default to full-stack for Laravel
              return 'full-stack'
            }
            return 'full-stack'
          }

          // Check for API-only Laravel (Lumen-like)
          if (composerJson.require?.['laravel/lumen-framework']) {
            return 'api-only'
          }

          // Check for WordPress
          if (fs.existsSync('wp-config.php') || fs.existsSync('wp-config-sample.php')) {
            return 'wordpress'
          }
        }
        catch {
          // Fall through to default
        }
      }

      // Check for WordPress without Laravel
      if (fs.existsSync('wp-config.php') || fs.existsSync('wp-config-sample.php')) {
        return 'wordpress'
      }

      // Default to full-stack (most comprehensive setup)
      return 'full-stack'
    }
    catch {
      return 'full-stack'
    }
  }

  /**
   * Download and parse the binary manifest from GitHub releases
   */
  private async downloadManifest(): Promise<BinaryManifest> {
    console.log('📋 Downloading precompiled binary manifest...')

    // First, get all releases to find the latest binaries release
    const releasesUrl = `${this.GITHUB_API}/repos/${this.GITHUB_REPO}/releases`

    try {
      const releasesResponse = await fetch(releasesUrl, {
        headers: {
          'User-Agent': 'Launchpad Binary Downloader',
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (!releasesResponse.ok) {
        if (releasesResponse.status === 403) {
          throw new Error('GitHub API rate limit exceeded. Please try again later.')
        }
        throw new Error(`GitHub API error: ${releasesResponse.status} ${releasesResponse.statusText}`)
      }

      const releases = await releasesResponse.json() as GitHubRelease[]

      // Find the latest release with binaries- prefix
      const binariesReleases = releases.filter(release =>
        release.tag_name.startsWith('binaries-'),
      ).sort((a, b) => {
        // Sort by release number (binaries-1234)
        const aNum = Number.parseInt(a.tag_name.replace('binaries-', ''), 10)
        const bNum = Number.parseInt(b.tag_name.replace('binaries-', ''), 10)
        return bNum - aNum // Latest first
      })

      if (binariesReleases.length === 0) {
        throw new Error('No binaries releases found. The precompile workflow may not have run yet.')
      }

      const binariesRelease = binariesReleases[0]
      console.log(`📦 Found binaries release: ${binariesRelease.tag_name}`)

      // Find manifest.json in release assets
      const manifestAsset = binariesRelease.assets?.find(asset => asset.name === 'manifest.json')
      if (!manifestAsset) {
        throw new Error('No manifest.json found in binaries release')
      }

      // Download manifest content
      const manifestResponse = await fetch(manifestAsset.browser_download_url)
      if (!manifestResponse.ok) {
        throw new Error(`Failed to download manifest: ${manifestResponse.statusText}`)
      }

      const manifest = await manifestResponse.json() as BinaryManifest

      // Add download URLs to binaries
      manifest.binaries = manifest.binaries.map((binary) => {
        const asset = binariesRelease.assets?.find(asset => asset.name === binary.filename)
        if (!asset) {
          console.warn(`⚠️ No asset found for binary: ${binary.filename}`)
        }
        return {
          ...binary,
          download_url: asset?.browser_download_url || '',
        }
      }).filter(binary => binary.download_url) // Remove binaries without download URLs

      console.log(`📋 Manifest loaded: ${manifest.binaries.length} binaries available`)

      if (manifest.binaries.length === 0) {
        throw new Error('No valid binaries found in manifest. The release may be incomplete.')
      }

      return manifest
    }
    catch (error) {
      throw new Error(`Failed to fetch binary manifest: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Find the best matching binary for the current system and requirements
   */
  private async findMatchingBinary(manifest: BinaryManifest, phpVersion?: string): Promise<BinaryInfo | null> {
    const platform = this.getPlatform()
    const architecture = this.getArchitecture()
    const detectedConfig = await this.detectFrameworkAndDatabase()

    console.log(`🔍 Detected configuration: ${detectedConfig}`)

    // Try exact match first
    let compatibleBinaries = manifest.binaries.filter(binary =>
      binary.platform === platform
      && binary.architecture === architecture
      && binary.configuration === detectedConfig,
    )

    // If no exact match, try fallback configurations
    if (compatibleBinaries.length === 0) {
      console.log(`⚠️ No exact match for ${detectedConfig}, trying fallbacks...`)

      const fallbackConfigs = this.getFallbackConfigurations(detectedConfig)
      for (const fallbackConfig of fallbackConfigs) {
        compatibleBinaries = manifest.binaries.filter(binary =>
          binary.platform === platform
          && binary.architecture === architecture
          && binary.configuration === fallbackConfig,
        )

        if (compatibleBinaries.length > 0) {
          console.log(`✅ Using fallback configuration: ${fallbackConfig}`)
          break
        }
      }
    }

    if (compatibleBinaries.length === 0) {
      return null
    }

    // If specific version requested, find exact match
    if (phpVersion) {
      const exactMatch = compatibleBinaries.find(binary => binary.php_version === phpVersion)
      if (exactMatch)
        return exactMatch
    }

    // Otherwise, get the latest version (assuming they're sorted)
    // Sort by version in descending order
    compatibleBinaries.sort((a, b) => {
      const aVersion = a.php_version.split('.').map(Number)
      const bVersion = b.php_version.split('.').map(Number)

      for (let i = 0; i < Math.max(aVersion.length, bVersion.length); i++) {
        const aPart = aVersion[i] || 0
        const bPart = bVersion[i] || 0

        if (aPart !== bPart) {
          return bPart - aPart // Descending order
        }
      }

      return 0
    })

    return compatibleBinaries[0] || null
  }

  /**
   * Get fallback configurations if the detected one isn't available
   */
  private getFallbackConfigurations(detectedConfig: string): string[] {
    switch (detectedConfig) {
      case 'laravel-mysql':
        return ['enterprise', 'full-stack', 'laravel-postgres', 'laravel-sqlite']
      case 'laravel-postgres':
        return ['enterprise', 'full-stack', 'laravel-mysql', 'laravel-sqlite']
      case 'laravel-sqlite':
        return ['laravel-mysql', 'enterprise', 'full-stack', 'laravel-postgres']
      case 'api-only':
        return ['laravel-mysql', 'enterprise', 'full-stack', 'laravel-postgres', 'laravel-sqlite']
      case 'wordpress':
        return ['laravel-mysql', 'enterprise', 'full-stack']
      case 'enterprise':
        return ['full-stack', 'laravel-mysql', 'laravel-postgres']
      case 'full-stack':
        return ['enterprise', 'laravel-mysql', 'laravel-postgres']
      default:
        return ['laravel-mysql', 'enterprise', 'full-stack', 'laravel-postgres', 'laravel-sqlite']
    }
  }

  /**
   * Generate Discord help message for unsupported configurations
   */
  private generateDiscordErrorMessage(detectedConfig: string, platform: string, architecture: string): string {
    return `
🚨 **PHP Binary Not Available**

We don't have a precompiled binary for your setup yet. Please help us improve!

**Your Setup:**
- Configuration: \`${detectedConfig}\`
- Platform: \`${platform}\`
- Architecture: \`${architecture}\`

**How to help:**
1. Join our Discord: https://discord.gg/stacksjs
2. Share this error in the #launchpad channel
3. Tell us about your project setup so we can add support

**Available Configurations:**
- laravel-mysql: Laravel with MySQL/MariaDB
- laravel-postgres: Laravel with PostgreSQL
- laravel-sqlite: Laravel with SQLite
- api-only: Minimal API applications
- enterprise: Full-featured enterprise build
- wordpress: WordPress-optimized
- full-stack: Complete PHP with all major extensions

**Next Steps:**
- Try a different PHP version if available
- Check if your platform/architecture is supported
- Request support for your specific configuration

Thanks for helping us make Launchpad better! 🙏
    `.trim()
  }

  /**
   * Download and cache a binary
   */
  private async downloadBinary(binary: BinaryInfo): Promise<string> {
    await fs.promises.mkdir(this.BINARY_CACHE_DIR, { recursive: true })

    const cachedPath = path.join(this.BINARY_CACHE_DIR, binary.filename)

    // Check if already cached
    if (fs.existsSync(cachedPath)) {
      console.log(`📦 Using cached binary: ${binary.filename}`)
      return cachedPath
    }

    if (config.verbose) {
      console.log(`⬇️ Downloading precompiled PHP ${binary.php_version} (${binary.configuration})...`)
      console.log(`📊 Size: ${Math.round(binary.size / 1024 / 1024 * 10) / 10}MB`)
    }

    const response = await fetch(binary.download_url, {
      headers: {
        'User-Agent': 'Launchpad Binary Downloader',
      },
    })

    if (!response.ok || !response.body) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`)
    }

    // Show download progress like other packages
    const contentLength = response.headers.get('content-length')
    const totalBytes = contentLength ? Number.parseInt(contentLength, 10) : 0

    if (totalBytes > 0) {
      const reader = response.body.getReader()
      const chunks: Uint8Array[] = []
      let downloadedBytes = 0
      let lastProgressUpdate = 0

      while (true) {
        const { done, value } = await reader.read()
        if (done)
          break

        if (value) {
          chunks.push(value)
          downloadedBytes += value.length

          // Throttle progress updates to every 100ms
          const now = Date.now()
          const progress = (downloadedBytes / totalBytes * 100)
          const progressPercent = Math.floor(progress / 5) * 5 // Round to nearest 5%

          if (now - lastProgressUpdate > 100 || progress >= 100 || downloadedBytes === value.length) {
            const progressMsg = config.verbose
              ? `⬇️  ${downloadedBytes}/${totalBytes} bytes (${progressPercent}%) - php.net v${binary.php_version}`
              : `⬇️  ${downloadedBytes}/${totalBytes} bytes (${progressPercent}%)`

            if (process.env.LAUNCHPAD_SHELL_INTEGRATION === '1') {
              process.stderr.write(`\r${progressMsg}`)
              if (process.stderr.isTTY) {
                try {
                  fs.writeSync(process.stderr.fd, '')
                }
                catch { /* ignore */ }
              }
            }
            else {
              process.stdout.write(`\r${progressMsg}`)
              if (process.stdout.isTTY) {
                try {
                  fs.writeSync(process.stdout.fd, '')
                }
                catch { /* ignore */ }
              }
            }
            lastProgressUpdate = now
          }
        }
      }

      // Clear the progress line
      if (process.env.LAUNCHPAD_SHELL_INTEGRATION === '1') {
        process.stderr.write('\r\x1B[K')
        if (process.stderr.isTTY) {
          try {
            fs.writeSync(process.stderr.fd, '')
          }
          catch { /* ignore */ }
        }
      }
      else {
        process.stdout.write('\r\x1B[K')
        if (process.stdout.isTTY) {
          try {
            fs.writeSync(process.stdout.fd, '')
          }
          catch { /* ignore */ }
        }
      }

      // Combine all chunks
      const totalLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0)
      const buffer = new Uint8Array(totalLength)
      let offset = 0
      for (const chunk of chunks) {
        buffer.set(chunk, offset)
        offset += chunk.length
      }

      await fs.promises.writeFile(cachedPath, buffer)
    }
    else {
      // Fallback for unknown content length - show simple download indicator
      const downloadMsg = config.verbose
        ? `⬇️  Downloading php.net v${binary.php_version} (size unknown)...`
        : `⬇️  Downloading php.net v${binary.php_version}...`

      if (process.env.LAUNCHPAD_SHELL_INTEGRATION === '1') {
        process.stderr.write(`\r${downloadMsg}`)
        if (process.stderr.isTTY) {
          try {
            fs.writeSync(process.stderr.fd, '')
          }
          catch { /* ignore */ }
        }
      }
      else {
        process.stdout.write(`\r${downloadMsg}`)
        if (process.stdout.isTTY) {
          try {
            fs.writeSync(process.stdout.fd, '')
          }
          catch { /* ignore */ }
        }
      }

      const buffer = await response.arrayBuffer()
      await fs.promises.writeFile(cachedPath, Buffer.from(buffer))

      // Clear the download message
      if (process.env.LAUNCHPAD_SHELL_INTEGRATION === '1') {
        process.stderr.write('\r\x1B[K')
        if (process.stderr.isTTY) {
          try {
            fs.writeSync(process.stderr.fd, '')
          }
          catch { /* ignore */ }
        }
      }
      else {
        process.stdout.write('\r\x1B[K')
        if (process.stdout.isTTY) {
          try {
            fs.writeSync(process.stdout.fd, '')
          }
          catch { /* ignore */ }
        }
      }
    }

    if (config.verbose) {
      console.log(`✅ Downloaded: ${binary.filename}`)
    }
    return cachedPath
  }

  /**
   * Get PHP dependencies from ts-pkgx pantry
   */
  private async getPhpDependenciesFromPantry(): Promise<string[]> {
    try {
      // Import ts-pkgx pantry
      const { pantry } = await import('ts-pkgx')

      // Get PHP package info
      const phpPackage = pantry.phpnet

      if (!phpPackage) {
        console.warn('⚠️ PHP package not found in pantry')
        return []
      }

      // Get dependencies from the package
      const dependencies = phpPackage.dependencies || []

      return dependencies.map((dep: any) => {
        // Convert dependency format to domain format if needed
        let packageName = ''

        if (typeof dep === 'string') {
          packageName = dep
        }
        else if (dep && typeof dep === 'object' && 'project' in dep) {
          packageName = dep.project as string
        }
        else {
          packageName = String(dep)
        }

        // Remove version constraints and platform prefixes to get clean package names
        // Examples: "curl.se^8" -> "curl.se", "darwin:zlib.net^1" -> "zlib.net"
        packageName = packageName.replace(/^[^:]+:/, '') // Remove platform prefix
        packageName = packageName.replace(/[~^<>=].*$/, '') // Remove version constraints

        return packageName
      }).filter(Boolean)
    }
    catch (error) {
      console.warn(`⚠️ Failed to get PHP dependencies from pantry: ${error instanceof Error ? error.message : String(error)}`)

      // Fallback to essential dependencies if pantry access fails
      return [
        'gnu.org/readline', // Essential for PHP CLI
        'openssl.org', // Essential for HTTPS
        'curl.se', // Essential for HTTP functions
        'zlib.net', // Essential for compression
      ]
    }
  }

  /**
   * Create PHP shims with proper library paths
   */
  async createPhpShims(packageDir: string, version: string): Promise<void> {
    try {
      const binDir = path.join(packageDir, 'bin')
      if (!fs.existsSync(binDir))
        return

      // Find Launchpad-installed readline library
      const launchpadLibraryPaths = await this.findLaunchpadLibraryPaths()

      // Get all PHP binaries
      const binaries = fs.readdirSync(binDir).filter((file) => {
        const fullPath = path.join(binDir, file)
        const stat = fs.statSync(fullPath)
        return stat.isFile() && (stat.mode & 0o111) // is executable
      })

      for (const binary of binaries) {
        const originalBinary = path.join(binDir, binary)
        const shimPath = path.join(binDir, `${binary}.original`)

        // Move original binary
        fs.renameSync(originalBinary, shimPath)

        // Create wrapper script with library paths including Launchpad libraries
        let libraryPaths = '/usr/local/lib:/usr/lib:/lib'
        if (launchpadLibraryPaths.length > 0) {
          libraryPaths = `${launchpadLibraryPaths.join(':')}:${libraryPaths}`
        }

        const wrapperScript = `#!/bin/sh
# Launchpad PHP binary wrapper with library paths
# Auto-generated wrapper for ${binary} v${version}

# Set up library paths to find Launchpad-installed libraries first, then system libraries
export DYLD_LIBRARY_PATH="${libraryPaths}:$DYLD_LIBRARY_PATH"
export DYLD_FALLBACK_LIBRARY_PATH="${libraryPaths}:$DYLD_FALLBACK_LIBRARY_PATH"
export LD_LIBRARY_PATH="${libraryPaths}:$LD_LIBRARY_PATH"

# Execute the original binary
exec "${shimPath}" "$@"
`

        fs.writeFileSync(originalBinary, wrapperScript)
        fs.chmodSync(originalBinary, 0o755)
      }

      console.log(`🔗 Created PHP shims with Launchpad library paths for ${binaries.length} binaries`)

      // Also try to create Homebrew-compatible symlinks for the precompiled binaries
      await this.createHomebrewCompatSymlinks(launchpadLibraryPaths)
    }
    catch (error) {
      console.warn(`⚠️ Failed to create PHP shims: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Find Launchpad-installed library paths for PHP dependencies
   */
  private async findLaunchpadLibraryPaths(): Promise<string[]> {
    const paths: string[] = []

    try {
      // Get dynamic PHP dependencies from ts-pkgx pantry
      const phpDependencies = await this.getPhpDependenciesFromPantry()

      console.log(`🔍 Scanning library paths for ${phpDependencies.length} PHP dependencies...`)

      for (const depName of phpDependencies) {
        // Check local environment installation first (where dependencies are actually installed)
        const localDepDir = path.join(this.installPath, depName)
        if (fs.existsSync(localDepDir)) {
          // Find version directories
          const versionDirs = fs.readdirSync(localDepDir).filter((item) => {
            const fullPath = path.join(localDepDir, item)
            return fs.statSync(fullPath).isDirectory() && item.startsWith('v')
          })

          for (const versionDir of versionDirs) {
            const libDir = path.join(localDepDir, versionDir, 'lib')
            if (fs.existsSync(libDir)) {
              paths.push(libDir)
              console.log(`📚 Found local library: ${libDir}`)
            }
          }
        }

        // Also check global installation as fallback
        const globalDepDir = path.join(process.env.HOME || '', '.local', 'share', 'launchpad', 'global', depName)
        if (fs.existsSync(globalDepDir)) {
          const versions = fs.readdirSync(globalDepDir).filter(d => d.startsWith('v')).sort().reverse()
          for (const version of versions) {
            const libDir = path.join(globalDepDir, version, 'lib')
            if (fs.existsSync(libDir)) {
              paths.push(libDir)
            }
          }
        }
      }

      if (paths.length > 0) {
        console.log(`🔍 Found Launchpad library paths for PHP: ${paths.length} paths`)
      }
      else {
        console.warn('⚠️ No Launchpad libraries found for PHP dependencies')
      }
    }
    catch (error) {
      console.warn(`⚠️ Error finding Launchpad libraries: ${error instanceof Error ? error.message : String(error)}`)
    }

    return paths
  }

  /**
   * Create Homebrew-compatible symlinks for precompiled PHP binaries
   */
  private async createHomebrewCompatSymlinks(launchpadLibraryPaths: string[]): Promise<void> {
    if (launchpadLibraryPaths.length === 0) {
      console.warn('⚠️ No Launchpad readline found, skipping Homebrew compatibility symlinks')
      return
    }

    try {
      // Find the best readline library file
      let readlineLibPath = ''
      for (const libDir of launchpadLibraryPaths) {
        const possibleFiles = [
          path.join(libDir, 'libreadline.8.dylib'),
          path.join(libDir, 'libreadline.dylib'),
          path.join(libDir, 'libreadline.so.8'),
          path.join(libDir, 'libreadline.so'),
        ]

        for (const file of possibleFiles) {
          if (fs.existsSync(file)) {
            readlineLibPath = file
            break
          }
        }

        if (readlineLibPath)
          break
      }

      if (!readlineLibPath) {
        if (config.verbose) {
          console.warn('⚠️ No readable readline library file found')
        }
        return
      }

      // Create the expected Homebrew directory structure in the package directory
      // This avoids permission issues with system directories
      const homebrewCompatDir = path.join(this.installPath, '.homebrew-compat', 'opt', 'homebrew', 'opt', 'readline', 'lib')
      const targetSymlink = path.join(homebrewCompatDir, 'libreadline.8.dylib')

      try {
        await fs.promises.mkdir(homebrewCompatDir, { recursive: true })

        if (!fs.existsSync(targetSymlink)) {
          await fs.promises.symlink(readlineLibPath, targetSymlink)
          console.log(`🔗 Created Homebrew-compat readline symlink: ${targetSymlink} -> ${readlineLibPath}`)
        }
      }
      catch (error) {
        console.warn(`⚠️ Could not create Homebrew compatibility symlinks: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
    catch (error) {
      console.warn(`⚠️ Failed to create Homebrew compatibility symlinks: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Validate that PHP installation works
   */
  async validatePhpInstallation(packageDir: string, version: string): Promise<void> {
    try {
      const phpBinary = path.join(packageDir, 'bin', 'php')

      if (!fs.existsSync(phpBinary)) {
        throw new Error('PHP binary not found after installation')
      }

      // Try to run php --version with the shim
      const versionOutput = execSync(`"${phpBinary}" --version`, {
        encoding: 'utf-8',
        timeout: 10000,
      })

      if (config.verbose) {
        console.log(`✅ PHP ${version} installed and validated successfully`)
        console.log(`🐘 Version: ${versionOutput.split('\n')[0]}`)
      }
    }
    catch (error) {
      if (config.verbose) {
        console.warn(`⚠️ PHP validation failed: ${error instanceof Error ? error.message : String(error)}`)
        console.warn('💡 The binary was installed but may have library dependency issues')
      }
      // Don't throw here - let the installation continue
    }
  }

  /**
   * Extract and install a binary
   */
  private async extractBinary(binaryPath: string, binary: BinaryInfo): Promise<string> {
    const packageDir = path.join(this.installPath, 'php.net', `v${binary.php_version}`)

    // Remove existing installation
    if (fs.existsSync(packageDir)) {
      await fs.promises.rm(packageDir, { recursive: true, force: true })
    }

    await fs.promises.mkdir(packageDir, { recursive: true })

    console.log(`📂 Extracting PHP ${binary.php_version} to ${packageDir}...`)

    try {
      // Extract the tarball directly into the target version directory
      execSync(`tar -xzf "${binaryPath}" -C "${packageDir}" --strip-components=1`, {
        stdio: 'pipe',
        timeout: 60000, // 1 minute timeout
      })

      const phpBinary = path.join(packageDir, 'bin', 'php')

      if (!fs.existsSync(phpBinary)) {
        throw new Error('PHP binary not found after extraction')
      }

      // Note: Skip validation here since the binary might need library paths
      // Validation will happen after shims are created

      console.log(`📂 PHP ${binary.php_version} extracted successfully`)

      return packageDir
    }
    catch (error) {
      // Clean up on failure
      if (fs.existsSync(packageDir)) {
        await fs.promises.rm(packageDir, { recursive: true, force: true })
      }
      throw new Error(`Binary extraction failed: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Provide helpful suggestions about extension configuration
   */
  private provideSuggestions(customCheck: { hasCustom: boolean, customExtensions: string[], reason: string }): void {
    if (customCheck.hasCustom && config.verbose) {
      console.log('\n🚨 Custom Extensions Detected')
      console.log(`❌ Missing: ${customCheck.customExtensions.join(', ')}`)
      console.log('\n💡 Options:')
      console.log('1. 📦 Use source build (automatic fallback)')
      console.log('2. 🔧 Modify your launchpad.config.ts to use standard extensions')
      console.log('3. 💬 Request these extensions on Discord: https://discord.gg/stacksjs')
      console.log('\n📋 Available precompiled configs:')
      console.log('- laravel-mysql: MySQL-focused Laravel')
      console.log('- laravel-postgres: PostgreSQL-focused Laravel')
      console.log('- laravel-sqlite: SQLite-focused Laravel')
      console.log('- api-only: Minimal API applications')
      console.log('- enterprise: All common extensions')
      console.log('- wordpress: WordPress-optimized')
      console.log('')
    }
  }

  /**
   * Main function to download and install a precompiled PHP binary
   */
  async downloadAndInstallPHP(requestedVersion?: string): Promise<{
    success: boolean
    packageDir: string
    version: string
    configuration: string
    extensions: string[]
    error?: string
  }> {
    try {
      if (config.verbose) {
        console.log('🚀 Installing PHP from precompiled binaries...')
        console.log(`🔍 Target: ${this.getPlatform()}-${this.getArchitecture()}`)
      }

      // Check for custom extensions first
      const customCheck = await this.hasCustomExtensions()
      if (customCheck.hasCustom) {
        this.provideSuggestions(customCheck)
        throw new Error(`Custom extensions required: ${customCheck.reason}`)
      }

      // Download manifest
      const manifest = await this.downloadManifest()
      console.log(`📋 Found ${manifest.binaries.length} available binaries`)

      // Find matching binary
      const binary = await this.findMatchingBinary(manifest, requestedVersion)

      if (!binary) {
        const platform = this.getPlatform()
        const arch = this.getArchitecture()
        const detectedConfig = await this.detectFrameworkAndDatabase()

        // Show available binaries for debugging
        const availableBinaries = manifest.binaries.filter(b =>
          b.platform === platform && b.architecture === arch,
        )

        console.log(`\n🔍 Available binaries for ${platform}-${arch}:`)
        if (availableBinaries.length > 0) {
          availableBinaries.forEach((b) => {
            console.log(`  - PHP ${b.php_version} (${b.configuration})`)
          })
        }
        else {
          console.log(`  ❌ No binaries available for ${platform}-${arch}`)
        }

        // Generate helpful Discord error message
        const discordMessage = this.generateDiscordErrorMessage(detectedConfig, platform, arch)
        console.log(`\n${discordMessage}\n`)

        throw new Error(
          `No precompiled binary found for ${platform}-${arch} with ${detectedConfig} configuration${
            requestedVersion ? ` and PHP ${requestedVersion}` : ''
          }. See available binaries above and Discord message for help.`,
        )
      }

      if (config.verbose) {
        console.log(`🎯 Selected: PHP ${binary.php_version} (${binary.configuration})`)
        console.log(`📦 Extensions: ${binary.extensions.split(',').length} included`)
      }

      // Download binary
      const binaryPath = await this.downloadBinary(binary)

      // Extract and install
      const packageDir = await this.extractBinary(binaryPath, binary)

      // Skip shim creation during installation - will be created later after all dependencies are installed
      if (config.verbose) {
        console.log(`📦 PHP ${binary.php_version} binary installed, shims will be created after dependencies are ready`)
      }

      // Skip validation for now - will be done after shims are created

      return {
        success: true,
        packageDir,
        version: binary.php_version,
        configuration: binary.configuration,
        extensions: binary.extensions.split(',').filter(Boolean),
      }
    }
    catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      console.error(`❌ Failed to install precompiled PHP: ${errorMessage}`)

      return {
        success: false,
        packageDir: '',
        version: '',
        configuration: '',
        extensions: [],
        error: errorMessage,
      }
    }
  }

  /**
   * Check if precompiled binaries are available for the current platform
   */
  async isSupported(): Promise<boolean> {
    try {
      // First check if user has custom extensions
      const customCheck = await this.hasCustomExtensions()
      if (customCheck.hasCustom) {
        if (config.verbose) {
          console.log(`🔧 Custom extensions detected: ${customCheck.customExtensions.join(', ')}`)
          console.log('📦 Falling back to source build for custom configuration')
        }
        return false
      }

      const manifest = await this.downloadManifest()
      const binary = await this.findMatchingBinary(manifest)
      return binary !== null
    }
    catch {
      return false
    }
  }

  /**
   * List all available binaries for the current platform
   */
  async listAvailableBinaries(): Promise<BinaryInfo[]> {
    const manifest = await this.downloadManifest()
    const platform = this.getPlatform()
    const architecture = this.getArchitecture()

    return manifest.binaries.filter(binary =>
      binary.platform === platform
      && binary.architecture === architecture,
    )
  }
}

/**
 * Convenience function to download and install PHP using precompiled binaries
 */
export async function downloadPhpBinary(installPath: string, requestedVersion?: string): Promise<string[]> {
  const downloader = new PrecompiledBinaryDownloader(installPath)

  const result = await downloader.downloadAndInstallPHP(requestedVersion)

  if (!result.success) {
    throw new Error(`Failed to install PHP binary: ${result.error}`)
  }

  // Create shims in installPath/bin and sbin so php is available on PATH
  try {
    const installedBinaries = await createShims(result.packageDir, installPath, 'php.net', result.version)
    // Optionally report number of binaries installed in verbose
    if (config.verbose) {
      console.log(`🎉 Successfully installed php.net (${installedBinaries.length} ${installedBinaries.length === 1 ? 'binary' : 'binaries'})`)
      console.log(`📁 Location: ${result.packageDir}`)
      console.log(`🔌 Extensions: ${result.extensions.length} loaded`)
    }
  }
  catch (error) {
    // Don't fail installation if shim creation has issues, but report in verbose
    if (config.verbose) {
      console.warn(`⚠️ Failed to create php shims: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  // Show standardized success message
  logUniqueMessage(`✅ php.net \x1B[2m\x1B[3m(v${result.version})\x1B[0m`)

  // Keep return shape for compatibility
  return [result.packageDir]
}
