/* eslint-disable no-console */
import type { GitHubRelease } from './types'
import { Buffer } from 'node:buffer'
import { execSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'
import process from 'node:process'
import { config } from './config'

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
    // Default to Laravel MySQL (most common setup)
    return 'laravel-mysql'
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
      'cli', 'fpm', 'mbstring', 'opcache', 'intl', 'exif', 'bcmath', 'calendar', 'ftp',
      'sysvmsg', 'sysvsem', 'sysvshm', 'wddx', 'pdo-mysql', 'pdo-pgsql', 'pdo-sqlite',
      'pdo-odbc', 'mysqli', 'pgsql', 'sqlite3', 'curl', 'openssl', 'gd', 'soap', 'sockets',
      'zip', 'bz2', 'readline', 'libxml', 'zlib', 'pcntl', 'posix', 'gettext', 'gmp',
      'ldap', 'xsl', 'sodium', 'iconv', 'fileinfo', 'json', 'phar', 'filter', 'hash',
      'session', 'tokenizer', 'ctype', 'dom', 'simplexml', 'xml', 'xmlreader', 'xmlwriter', 'shmop'
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
    if (phpConfig?.strategy === 'precompiled-binary' && phpConfig?.manual?.configuration) {
      console.log(`🔧 Using manual configuration: ${phpConfig.manual.configuration}`)
      return phpConfig.manual.configuration
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
              // Default to MySQL for Laravel
              return 'laravel-mysql'
            }
            return 'laravel-mysql'
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

      // Default to Laravel MySQL (most popular setup)
      return 'laravel-mysql'
    }
    catch {
      return 'laravel-mysql'
    }
  }

  /**
   * Download and parse the binary manifest from GitHub releases
   */
  private async downloadManifest(): Promise<BinaryManifest> {
    console.log('📋 Downloading precompiled binary manifest...')

    const manifestUrl = `${this.GITHUB_API}/repos/${this.GITHUB_REPO}/releases/latest`

    try {
      const response = await fetch(manifestUrl, {
        headers: {
          'User-Agent': 'Launchpad Binary Downloader',
          'Accept': 'application/vnd.github.v3+json',
        },
      })

      if (!response.ok) {
        throw new Error(`GitHub API error: ${response.status} ${response.statusText}`)
      }

      const release = await response.json() as GitHubRelease

      // Find manifest.json in release assets
      const manifestAsset = release.assets?.find(asset => asset.name === 'manifest.json')
      if (!manifestAsset) {
        throw new Error('No manifest.json found in latest release')
      }

      // Download manifest content
      const manifestResponse = await fetch(manifestAsset.browser_download_url)
      if (!manifestResponse.ok) {
        throw new Error(`Failed to download manifest: ${manifestResponse.statusText}`)
      }

      const manifest = await manifestResponse.json() as BinaryManifest

      // Add download URLs to binaries
      manifest.binaries = manifest.binaries.map((binary) => {
        const asset = release.assets?.find(asset => asset.name === binary.filename)
        return {
          ...binary,
          download_url: asset?.browser_download_url || '',
        }
      })

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
🚨 **Unsupported PHP Configuration Detected**

We don't have a precompiled binary for your setup yet. Please help us improve!

**Your Setup:**
- Configuration: \`${detectedConfig}\`
- Platform: \`${platform}\`
- Architecture: \`${architecture}\`

**How to help:**
1. Join our Discord: https://discord.gg/stacksjs
2. Share this error in the #launchpad channel
3. Tell us about your project setup so we can add support

**Workaround:**
- Launchpad will automatically fall back to source compilation
- This will take longer but will work for your configuration

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

    console.log(`⬇️ Downloading precompiled PHP ${binary.php_version} (${binary.configuration})...`)
    console.log(`📊 Size: ${Math.round(binary.size / 1024 / 1024 * 10) / 10}MB`)

    const response = await fetch(binary.download_url, {
      headers: {
        'User-Agent': 'Launchpad Binary Downloader',
      },
    })

    if (!response.ok) {
      throw new Error(`Download failed: ${response.status} ${response.statusText}`)
    }

    const buffer = await response.arrayBuffer()
    await fs.promises.writeFile(cachedPath, Buffer.from(buffer))

    console.log(`✅ Downloaded: ${binary.filename}`)
    return cachedPath
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
      // Extract the tarball
      execSync(`tar -xzf "${binaryPath}" -C "${path.dirname(packageDir)}" --strip-components=1`, {
        stdio: 'pipe',
        timeout: 60000, // 1 minute timeout
      })

      const phpBinary = path.join(packageDir, 'bin', 'php')

      if (!fs.existsSync(phpBinary)) {
        throw new Error('PHP binary not found after extraction')
      }

      // Verify the installation
      const versionOutput = execSync(`"${phpBinary}" --version`, {
        encoding: 'utf-8',
        timeout: 10000,
      })

      console.log(`✅ PHP ${binary.php_version} installed successfully`)
      console.log(`🐘 Version: ${versionOutput.split('\n')[0]}`)

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
      console.log('🚀 Installing PHP from precompiled binaries...')
      console.log(`🔍 Target: ${this.getPlatform()}-${this.getArchitecture()}`)

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
        const detectedConfig = this.detectFrameworkAndDatabase()

        // Generate helpful Discord error message
        const discordMessage = this.generateDiscordErrorMessage(await detectedConfig, platform, arch)
        console.log(`\n${discordMessage}\n`)

        throw new Error(
          `No precompiled binary found for ${platform}-${arch} with ${detectedConfig} configuration${
            requestedVersion ? ` and PHP ${requestedVersion}` : ''
          }. See Discord message above for help.`,
        )
      }

      console.log(`🎯 Selected: PHP ${binary.php_version} (${binary.configuration})`)
      console.log(`📦 Extensions: ${binary.extensions.split(',').length} included`)

      // Download binary
      const binaryPath = await this.downloadBinary(binary)

      // Extract and install
      const packageDir = await this.extractBinary(binaryPath, binary)

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

  console.log(`🎉 PHP ${result.version} (${result.configuration}) installed successfully!`)
  console.log(`📁 Location: ${result.packageDir}`)
  console.log(`🔌 Extensions: ${result.extensions.length} loaded`)

  return [result.packageDir]
}
