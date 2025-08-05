/* eslint-disable no-console */
/**
 * Simplified PHP Setup Strategy for Launchpad
 * Uses only Homebrew-style source building for reliability
 */

import { getLatestVersion, packages } from 'ts-pkgx'

/**
 * Get the latest PHP version with fallback logic
 */
async function getLatestPHPVersion(): Promise<string> {
  try {
    // Try ts-pkgx getLatestVersion first
    const version = await getLatestVersion('php' as any)
    if (version) {
      return version
    }
  }
  catch {
    // Fallback to direct package access
  }

  // Fallback: get version directly from packages
  const phpPackage = packages.phpnet
  if (phpPackage && 'versions' in phpPackage && Array.isArray(phpPackage.versions) && phpPackage.versions.length > 0) {
    const latestVersion = phpPackage.versions[0]
    return typeof latestVersion === 'string' ? latestVersion : String(latestVersion)
  }

  // Final fallback to a known stable version
  return '8.4.11'
}

export interface PHPStrategy {
  name: string
  priority: number
  detect: () => Promise<boolean>
  install: () => Promise<PHPInstallResult>
  getExecutablePath: () => string
  getDatabaseSupport: () => DatabaseSupport
}

export interface PHPInstallResult {
  success: boolean
  phpPath: string
  version: string
  extensions: string[]
  databaseSupport: DatabaseSupport
  libraryIssues: string[]
  recommendations: string[]
}

export interface DatabaseSupport {
  sqlite: boolean
  mysql: boolean
  postgresql: boolean
  extensions: {
    pdo_sqlite?: boolean
    pdo_mysql?: boolean
    pdo_pgsql?: boolean
    mysqli?: boolean
    pgsql?: boolean
  }
}

/**
 * Source Build PHP Strategy (Only Strategy)
 * Always builds PHP from source using Homebrew-style approach
 */
export class SourceBuildPHPStrategy implements PHPStrategy {
  name = 'source-build-php'
  priority = 1
  private installedVersion: string | null = null

  async detect(): Promise<boolean> {
    // Always available - we can always build from source
    return true
  }

  async install(): Promise<PHPInstallResult> {
    try {
      // Get the latest PHP version dynamically
      const latestVersion = await getLatestPHPVersion()

      // Store the version for later use
      this.installedVersion = latestVersion

      // Source builds are no longer supported - use precompiled binaries instead
      throw new Error('Source builds are no longer supported. Use precompiled binaries via the main install command.')
    }
    catch (error) {
      return {
        success: false,
        phpPath: '',
        version: '',
        extensions: [],
        databaseSupport: { sqlite: false, mysql: false, postgresql: false, extensions: {} },
        libraryIssues: [`Source build failed: ${error}`],
        recommendations: ['Check system dependencies and try again'],
      }
    }
  }

  getExecutablePath(): string {
    // eslint-disable-next-line ts/no-require-imports
    const os = require('node:os')
    // eslint-disable-next-line ts/no-require-imports
    const path = require('node:path')

    // Use the installed version if available, otherwise fallback to a reasonable default
    // Since this method must be synchronous, we can't await getLatestVersion here
    const version = this.installedVersion || '8.4.0'

    return path.join(os.homedir(), '.local', 'share', 'launchpad', 'envs', 'global', 'php.net', `v${version}`, 'bin', 'php')
  }

  getDatabaseSupport(): DatabaseSupport {
    return {
      sqlite: true,
      mysql: true,
      postgresql: true,
      extensions: {
        pdo_sqlite: true,
        pdo_mysql: true,
        pdo_pgsql: true,
        mysqli: true,
        pgsql: true,
      },
    }
  }

  private async testPHPInstallation(phpPath: string): Promise<{ success: boolean, version?: string, extensions?: string[] }> {
    try {
      const fs = await import('node:fs')
      if (!fs.existsSync(phpPath)) {
        return { success: false }
      }

      const { execSync } = await import('node:child_process')

      // Test version
      const versionOutput = execSync(`"${phpPath}" --version`, { encoding: 'utf8', timeout: 10000 })
      const versionMatch = versionOutput.match(/PHP (\d+\.\d+\.\d+)/)
      const version = versionMatch ? versionMatch[1] : undefined

      // Test extensions
      const extensionsOutput = execSync(`"${phpPath}" -m`, { encoding: 'utf8', timeout: 10000 })
      const extensions = extensionsOutput.split('\n')
        .map(line => line.trim())
        .filter(line => line && !line.startsWith('['))

      return {
        success: true,
        version,
        extensions,
      }
    }
    catch {
      return { success: false }
    }
  }
}

/**
 * Simplified PHP Strategy Manager
 * Uses only the source build strategy
 */
export class PHPStrategyManager {
  private strategy: PHPStrategy = new SourceBuildPHPStrategy()

  async setupPHP(): Promise<PHPInstallResult> {
    console.log('🐘 PHP Setup: Building from Source')
    console.log('==================================')

    console.log(`\n📋 Using Strategy: ${this.strategy.name}`)

    const canUse = await this.strategy.detect()
    if (!canUse) {
      throw new Error('Source build strategy not available')
    }

    console.log(`  ✅ ${this.strategy.name} detected, building...`)
    const result = await this.strategy.install()

    if (result.success) {
      console.log(`  🎉 ${this.strategy.name} successful!`)
      console.log(`     PHP Path: ${result.phpPath}`)
      console.log(`     Version: ${result.version}`)
      console.log(`     Database Support: SQLite=${result.databaseSupport.sqlite}, MySQL=${result.databaseSupport.mysql}, PostgreSQL=${result.databaseSupport.postgresql}`)

      if (result.recommendations.length > 0) {
        console.log(`     Recommendations:`)
        result.recommendations.forEach(rec => console.log(`       - ${rec}`))
      }

      return result
    }
    else {
      console.log(`  ❌ ${this.strategy.name} failed`)
      if (result.libraryIssues.length > 0) {
        console.log(`     Issues: ${result.libraryIssues.join(', ')}`)
      }
      throw new Error('PHP source build failed')
    }
  }

  async getOptimalStrategy(): Promise<PHPStrategy> {
    return this.strategy
  }
}
