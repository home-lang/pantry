/* eslint-disable no-console */
/**
 * Intelligent PHP Shim System
 * Creates optimized PHP execution environment with library path management
 */

import type { PHPConfig } from '../types'
import fs from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'
import { config } from '../config'

export interface PHPShimResult {
  success: boolean
  shimPath: string
  executablePath: string
  environmentVariables: Record<string, string>
  libraryPaths: string[]
  issues: string[]
  recommendations: string[]
}

export class PHPShimManager {
  private phpConfig: PHPConfig
  private shimDir: string

  constructor(phpConfig: PHPConfig = config.services.php) {
    this.phpConfig = phpConfig
    this.shimDir = path.join(homedir(), '.local', 'bin')
  }

  /**
   * Create an intelligent PHP shim that handles library dependencies automatically
   */
  async createPHPShim(phpExecutablePath: string): Promise<PHPShimResult> {
    console.log('🔧 Creating intelligent PHP shim...')

    try {
      // Ensure shim directory exists
      if (!fs.existsSync(this.shimDir)) {
        fs.mkdirSync(this.shimDir, { recursive: true })
      }

      const shimPath = path.join(this.shimDir, 'php')

      // Detect optimal library configuration
      const libraryConfig = await this.detectOptimalLibraryConfiguration()

      // Generate shim script
      const shimScript = this.generateShimScript(phpExecutablePath, libraryConfig)

      // Write shim file
      fs.writeFileSync(shimPath, shimScript, { mode: 0o755 })

      console.log(`✅ PHP shim created: ${shimPath}`)

      return {
        success: true,
        shimPath,
        executablePath: phpExecutablePath,
        environmentVariables: libraryConfig.environmentVariables,
        libraryPaths: libraryConfig.libraryPaths,
        issues: libraryConfig.issues,
        recommendations: [
          `PHP shim created with optimized library paths`,
          `Use 'php' command normally - shim handles library dependencies`,
          ...libraryConfig.recommendations,
        ],
      }
    }
    catch (error) {
      return {
        success: false,
        shimPath: '',
        executablePath: phpExecutablePath,
        environmentVariables: {},
        libraryPaths: [],
        issues: [`Failed to create PHP shim: ${error}`],
        recommendations: ['Consider using system PHP directly or configuring library paths manually'],
      }
    }
  }

  /**
   * Detect the optimal library configuration for PHP
   */
  private async detectOptimalLibraryConfiguration(): Promise<{
    libraryPaths: string[]
    environmentVariables: Record<string, string>
    issues: string[]
    recommendations: string[]
  }> {
    const libraryPaths: string[] = []
    const environmentVariables: Record<string, string> = {}
    const issues: string[] = []
    const recommendations: string[] = []

    // Add system library paths if they exist
    for (const libPath of this.phpConfig.libraryFixes.systemLibraryPaths) {
      if (fs.existsSync(libPath)) {
        libraryPaths.push(libPath)
      }
      else {
        issues.push(`System library path not found: ${libPath}`)
      }
    }

    // Detect Launchpad environment libraries
    const envPath = path.join(homedir(), '.local', 'share', 'launchpad', 'envs')
    if (fs.existsSync(envPath)) {
      const envDirs = fs.readdirSync(envPath).filter(dir =>
        dir.includes('otc-api') || dir.includes('launchpad') || dir.includes(path.basename(process.cwd())),
      )

      for (const envDir of envDirs) {
        const envLibPaths = this.discoverEnvironmentLibraries(path.join(envPath, envDir))
        libraryPaths.push(...envLibPaths)
      }
    }

    // Configure DYLD_LIBRARY_PATH for macOS
    if (libraryPaths.length > 0) {
      environmentVariables.DYLD_LIBRARY_PATH = libraryPaths.join(':')
      recommendations.push(`Configured DYLD_LIBRARY_PATH with ${libraryPaths.length} library paths`)
    }

    // Add other optimizations
    environmentVariables.DYLD_FALLBACK_LIBRARY_PATH = '/opt/homebrew/lib:/usr/local/lib:/usr/lib'

    // Configure PHP-specific optimizations
    if (this.phpConfig.shim.optimizeLibraryPath) {
      environmentVariables.PHP_INI_SCAN_DIR = '/opt/homebrew/etc/php/8.4/conf.d'
      recommendations.push('Optimized PHP configuration scanning')
    }

    // Merge user-configured environment variables
    Object.assign(environmentVariables, this.phpConfig.shim.environmentVariables)

    return {
      libraryPaths,
      environmentVariables,
      issues,
      recommendations,
    }
  }

  /**
   * Discover library paths in a Launchpad environment directory
   */
  private discoverEnvironmentLibraries(envDir: string): string[] {
    const libraryPaths: string[] = []

    if (!fs.existsSync(envDir)) {
      return libraryPaths
    }

    try {
      const packages = fs.readdirSync(envDir)

      for (const packageDir of packages) {
        const packagePath = path.join(envDir, packageDir)
        const stat = fs.statSync(packagePath)

        if (stat.isDirectory()) {
          // Look for lib directories in package versions
          try {
            const versions = fs.readdirSync(packagePath)
            for (const version of versions) {
              const libPath = path.join(packagePath, version, 'lib')
              if (fs.existsSync(libPath)) {
                libraryPaths.push(libPath)
              }
            }
          }
          catch {
            // Ignore errors reading package directories
          }
        }
      }
    }
    catch {
      // Ignore errors reading environment directory
    }

    return libraryPaths
  }

  /**
   * Generate the PHP shim script
   */
  private generateShimScript(phpExecutablePath: string, libraryConfig: {
    environmentVariables: Record<string, string>
    libraryPaths: string[]
  }): string {
    const envVars = Object.entries(libraryConfig.environmentVariables)
      .map(([key, value]) => `export ${key}="${value}"`)
      .join('\n')

    return `#!/bin/bash
# Intelligent PHP Shim
# Generated by Launchpad PHP Strategy Manager
# Handles library dependencies and optimizations automatically

# Set up optimized environment
${envVars}

# Debug mode (uncomment for troubleshooting)
# echo "🐘 PHP Shim Debug Info:" >&2
# echo "  Executable: ${phpExecutablePath}" >&2
# echo "  DYLD_LIBRARY_PATH: $DYLD_LIBRARY_PATH" >&2
# echo "  Library Paths: ${libraryConfig.libraryPaths.length} configured" >&2

# Execute PHP with optimized environment
exec "${phpExecutablePath}" "$@"
`
  }

  /**
   * Test the PHP shim functionality
   */
  async testPHPShim(shimPath: string): Promise<{
    success: boolean
    version: string
    extensions: string[]
    databaseSupport: {
      sqlite: boolean
      mysql: boolean
      postgresql: boolean
    }
    issues: string[]
  }> {
    const { $ } = await import('bun')

    try {
      // Test basic PHP execution
      const versionOutput = await $`${shimPath} --version`.text()
      const version = versionOutput.split('\n')[0]

      // Test extensions
      const extensionsOutput = await $`${shimPath} -m`.text()
      const extensions = extensionsOutput.split('\n').filter(ext => ext.trim())

      // Analyze database support
      const databaseSupport = {
        sqlite: extensions.includes('pdo_sqlite') || extensions.includes('sqlite3'),
        mysql: extensions.includes('pdo_mysql') || extensions.includes('mysqli'),
        postgresql: extensions.includes('pdo_pgsql') || extensions.includes('pgsql'),
      }

      return {
        success: true,
        version,
        extensions,
        databaseSupport,
        issues: [],
      }
    }
    catch (error) {
      return {
        success: false,
        version: '',
        extensions: [],
        databaseSupport: { sqlite: false, mysql: false, postgresql: false },
        issues: [`PHP shim test failed: ${error}`],
      }
    }
  }

  /**
   * Remove the PHP shim
   */
  removePHPShim(): boolean {
    const shimPath = path.join(this.shimDir, 'php')

    try {
      if (fs.existsSync(shimPath)) {
        fs.unlinkSync(shimPath)
        console.log(`🗑️  Removed PHP shim: ${shimPath}`)
        return true
      }
      return true // Already doesn't exist
    }
    catch (error) {
      console.error(`❌ Failed to remove PHP shim: ${error}`)
      return false
    }
  }

  /**
   * Get shim status and information
   */
  getShimStatus(): {
    exists: boolean
    path: string
    executable: boolean
    target?: string
  } {
    const shimPath = path.join(this.shimDir, 'php')

    const exists = fs.existsSync(shimPath)
    let executable = false
    let target: string | undefined

    if (exists) {
      try {
        const stat = fs.statSync(shimPath)
        executable = (stat.mode & 0o111) !== 0

        // Try to extract target from shim content
        const content = fs.readFileSync(shimPath, 'utf-8')
        const execMatch = content.match(/exec "([^"]+)"/)
        if (execMatch) {
          target = execMatch[1]
        }
      }
      catch {
        // Ignore errors reading shim file
      }
    }

    return {
      exists,
      path: shimPath,
      executable,
      target,
    }
  }
}
