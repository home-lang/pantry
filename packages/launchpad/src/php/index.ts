/**
 * Simplified PHP Integration for Launchpad
 * Main entry point for PHP source building setup
 */

import type { PHPConfig } from '../types'
import { config } from '../config'
import { PHPStrategyManager } from './php-strategy'

export interface PHPSetupResult {
  success: boolean
  strategy: string
  phpPath: string
  version: string
  databaseSupport: {
    sqlite: boolean
    mysql: boolean
    postgresql: boolean
  }
  recommendations: string[]
  issues: string[]
}

/**
 * Main PHP setup function - simplified to only use source building
 */
export async function setupPHP(phpConfig: PHPConfig = config.services.php): Promise<PHPSetupResult> {
  console.log('🐘 Launchpad PHP Setup (Source Build)')
  console.log('====================================')

  if (!phpConfig.enabled) {
    return {
      success: false,
      strategy: 'disabled',
      phpPath: '',
      version: '',
      databaseSupport: { sqlite: false, mysql: false, postgresql: false },
      recommendations: ['PHP support is disabled in configuration'],
      issues: ['Enable PHP support: LAUNCHPAD_PHP_ENABLED=true'],
    }
  }

  const strategyManager = new PHPStrategyManager()

  try {
    // Build PHP from source
    const installResult = await strategyManager.setupPHP()

    if (!installResult.success) {
      return {
        success: false,
        strategy: 'source-build-failed',
        phpPath: '',
        version: '',
        databaseSupport: { sqlite: false, mysql: false, postgresql: false },
        recommendations: installResult.recommendations,
        issues: installResult.libraryIssues,
      }
    }

    console.log('\n🎉 PHP Setup Complete!')
    console.log('======================')
    console.log(`✅ Strategy: ${installResult.success ? 'Source Build' : 'Failed'}`)
    console.log(`✅ PHP Path: ${installResult.phpPath}`)
    console.log(`✅ Version: ${installResult.version}`)
    console.log(`✅ Database Support: SQLite=${installResult.databaseSupport.sqlite}, MySQL=${installResult.databaseSupport.mysql}, PostgreSQL=${installResult.databaseSupport.postgresql}`)

    if (installResult.recommendations.length > 0) {
      console.log('\n📋 Recommendations:')
      installResult.recommendations.forEach(rec => console.log(`   • ${rec}`))
    }

    return {
      success: true,
      strategy: 'source-build',
      phpPath: installResult.phpPath,
      version: installResult.version,
      databaseSupport: installResult.databaseSupport,
      recommendations: installResult.recommendations,
      issues: [],
    }
  }
  catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error)
    console.error(`❌ PHP Setup Failed: ${errorMessage}`)

    return {
      success: false,
      strategy: 'source-build-error',
      phpPath: '',
      version: '',
      databaseSupport: { sqlite: false, mysql: false, postgresql: false },
      recommendations: [
        'Try running the setup again',
        'Check system dependencies for building from source',
        'Ensure internet connection for downloading PHP source',
      ],
      issues: [errorMessage],
    }
  }
}

// Export strategy classes for testing
export { PHPStrategyManager, SourceBuildPHPStrategy } from './php-strategy'
