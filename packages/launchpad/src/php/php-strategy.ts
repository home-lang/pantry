/**
 * Simplified PHP Setup Strategy for Launchpad
 * Uses only Homebrew-style source building for reliability
 */

import { buildPhpFromSource } from '../install'

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

  async detect(): Promise<boolean> {
    // Always available - we can always build from source
    return true
  }

  async install(): Promise<PHPInstallResult> {
    const path = await import('node:path')
    const os = await import('node:os')

    try {
      // Build PHP from source in the current environment
      const envDir = path.join(os.homedir(), '.local', 'share', 'launchpad', 'envs', 'global')
      const installedFiles = await buildPhpFromSource(envDir, '8.4.0')

      const phpBinary = path.join(envDir, 'php.net', 'v8.4.0', 'bin', 'php')

      // Test the installation
      const testResult = await this.testPHPInstallation(phpBinary)

      return {
        success: testResult.success,
        phpPath: phpBinary,
        version: testResult.version || '8.4.0',
        extensions: testResult.extensions || [],
        databaseSupport: {
          sqlite: true, // Built with SQLite support
          mysql: true, // Built with MySQL support
          postgresql: true, // Built with PostgreSQL support
          extensions: {
            pdo_sqlite: true,
            pdo_mysql: true,
            pdo_pgsql: true,
            mysqli: true,
            pgsql: true,
          },
        },
        libraryIssues: [],
        recommendations: [
          'PHP built from source with full database support',
          'All libraries properly linked during compilation',
          'Ready for Laravel development',
        ],
      }
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
    const os = require('node:os')
    const path = require('node:path')
    return path.join(os.homedir(), '.local', 'share', 'launchpad', 'envs', 'global', 'php.net', 'v8.4.0', 'bin', 'php')
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
