/* eslint-disable no-console */
import { Buffer } from 'node:buffer'
import { execSync } from 'node:child_process'
import * as fs from 'node:fs'
import * as path from 'node:path'
import process from 'node:process'
import { config } from './config'
import type { GitHubRelease } from './types'

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
  private hasCustomExtensions(): { hasCustom: boolean, customExtensions: string[], reason: string } {
    const { extensions } = config.services.php

    // Get all user-configured extensions
    const userExtensions = [
      ...extensions.core,
      ...extensions.database,
      ...extensions.web,
      ...extensions.utility,
      ...extensions.optional,
    ]

    // Define what each precompiled config includes
    const precompiledConfigs = {
      'laravel-mysql': ['cli', 'fpm', 'mbstring', 'opcache', 'intl', 'exif', 'bcmath', 'pdo-mysql', 'mysqli', 'curl', 'openssl', 'gd', 'zip', 'readline', 'libxml', 'zlib'],
      'laravel-postgres': ['cli', 'fpm', 'mbstring', 'opcache', 'intl', 'exif', 'bcmath', 'pdo-pgsql', 'pgsql', 'curl', 'openssl', 'gd', 'zip', 'readline', 'libxml', 'zlib'],
      'laravel-sqlite': ['cli', 'fpm', 'mbstring', 'opcache', 'intl', 'exif', 'bcmath', 'pdo-sqlite', 'sqlite3', 'curl', 'openssl', 'gd', 'zip', 'readline', 'libxml', 'zlib'],
      'api-only': ['cli', 'fpm', 'mbstring', 'opcache', 'bcmath', 'pdo-mysql', 'mysqli', 'curl', 'openssl', 'zip', 'libxml', 'zlib'],
      'enterprise': ['cli', 'fpm', 'mbstring', 'opcache', 'intl', 'exif', 'bcmath', 'pdo-mysql', 'pdo-pgsql', 'pdo-sqlite', 'mysqli', 'pgsql', 'sqlite3', 'curl', 'openssl', 'gd', 'soap', 'sockets', 'zip', 'bz2', 'readline', 'libxml', 'zlib', 'pcntl', 'posix', 'gettext', 'gmp', 'ldap', 'xsl', 'sodium'],
      'wordpress': ['cli', 'fpm', 'mbstring', 'opcache', 'exif', 'pdo-mysql', 'mysqli', 'curl', 'openssl', 'gd', 'zip', 'libxml', 'zlib'],
    }

    // Find the best matching config based on framework detection
    const detectedConfig = this.detectFrameworkAndDatabase()
    const availableExtensions = precompiledConfigs[detectedConfig as keyof typeof precompiledConfigs] || precompiledConfigs['laravel-mysql']

    // Check if user wants extensions not in any precompiled config
    const missingExtensions = userExtensions.filter((ext) => {
      // Check if this extension exists in ANY precompiled config
      return !Object.values(precompiledConfigs).some(configExts => configExts.includes(ext))
    })

    if (missingExtensions.length > 0) {
      return {
        hasCustom: true,
        customExtensions: missingExtensions,
        reason: `Custom extensions not available in precompiled binaries: ${missingExtensions.join(', ')}`,
      }
    }

    // Check if user wants extensions not in their detected config
    const incompatibleExtensions = userExtensions.filter(ext => !availableExtensions.includes(ext))

    if (incompatibleExtensions.length > 0) {
      // Check if enterprise config would work
      const enterpriseExtensions = precompiledConfigs.enterprise
      const stillMissing = incompatibleExtensions.filter(ext => !enterpriseExtensions.includes(ext))

      if (stillMissing.length > 0) {
        return {
          hasCustom: true,
          customExtensions: stillMissing,
          reason: `Extensions not available in any precompiled config: ${stillMissing.join(', ')}`,
        }
      }
      else {
        // Enterprise config would work, but let them know
        console.log(`⚠️ Your extensions require the 'enterprise' configuration: ${incompatibleExtensions.join(', ')}`)
        console.log('💡 Consider using enterprise config or reducing extensions for better performance')
      }
    }

    return { hasCustom: false, customExtensions: [], reason: '' }
  }

  /**
   * Detect Laravel framework and suggest optimal configuration
   */
  private detectFrameworkAndDatabase(): string {
    try {
      // eslint-disable-next-line ts/no-require-imports
      const fs = require('node:fs')
      // const _path = require('node:path')

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
      const manifestAsset = release.assets?.find((asset) => asset.name === 'manifest.json')
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
        const asset = release.assets?.find((asset) => asset.name === binary.filename)
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
  private findMatchingBinary(manifest: BinaryManifest, phpVersion?: string): BinaryInfo | null {
    const platform = this.getPlatform()
    const architecture = this.getArchitecture()
    const detectedConfig = this.detectFrameworkAndDatabase()

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
        return ['enterprise', 'laravel-postgres', 'laravel-sqlite']
      case 'laravel-postgres':
        return ['enterprise', 'laravel-mysql', 'laravel-sqlite']
      case 'laravel-sqlite':
        return ['laravel-mysql', 'enterprise', 'laravel-postgres']
      case 'api-only':
        return ['laravel-mysql', 'laravel-postgres', 'laravel-sqlite']
      case 'wordpress':
        return ['laravel-mysql', 'enterprise']
      case 'enterprise':
        return ['laravel-mysql', 'laravel-postgres']
      default:
        return ['laravel-mysql', 'enterprise', 'laravel-postgres', 'laravel-sqlite']
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
      const customCheck = this.hasCustomExtensions()
      if (customCheck.hasCustom) {
        this.provideSuggestions(customCheck)
        throw new Error(`Custom extensions required: ${customCheck.reason}`)
      }

      // Download manifest
      const manifest = await this.downloadManifest()
      console.log(`📋 Found ${manifest.binaries.length} available binaries`)

      // Find matching binary
      const binary = this.findMatchingBinary(manifest, requestedVersion)

      if (!binary) {
        const platform = this.getPlatform()
        const arch = this.getArchitecture()
        const detectedConfig = this.detectFrameworkAndDatabase()

        // Generate helpful Discord error message
        const discordMessage = this.generateDiscordErrorMessage(detectedConfig, platform, arch)
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
      const customCheck = this.hasCustomExtensions()
      if (customCheck.hasCustom) {
        if (config.verbose) {
          console.log(`🔧 Custom extensions detected: ${customCheck.customExtensions.join(', ')}`)
          console.log('📦 Falling back to source build for custom configuration')
        }
        return false
      }

      const manifest = await this.downloadManifest()
      const binary = this.findMatchingBinary(manifest)
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
