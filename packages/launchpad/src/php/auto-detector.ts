import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { config } from '../config'

export interface ProjectAnalysis {
  framework: 'laravel' | 'wordpress' | 'symfony' | 'generic' | null
  databases: ('mysql' | 'postgres' | 'sqlite')[]
  hasApi: boolean
  hasWebInterface: boolean
  hasImageProcessing: boolean
  hasEnterpriseFeatures: boolean
  recommendedConfig: string
  reasoning: string[]
}

export interface DatabaseConfig {
  connection: string
  host: string
  port: number
  database: string
  username: string
  password: string
}

/**
 * Smart PHP Configuration Auto-Detector
 * Analyzes the project and determines the optimal PHP configuration
 */
export class PHPAutoDetector {
  private projectRoot: string

  constructor(projectRoot: string = process.cwd()) {
    this.projectRoot = projectRoot
  }

  /**
   * Analyze the current project and determine optimal PHP configuration
   */
  async analyzeProject(): Promise<ProjectAnalysis> {
    const analysis: ProjectAnalysis = {
      framework: null,
      databases: [],
      hasApi: false,
      hasWebInterface: false,
      hasImageProcessing: false,
      hasEnterpriseFeatures: false,
      recommendedConfig: 'laravel-mysql',
      reasoning: [],
    }

    // Detect framework
    analysis.framework = this.detectFramework()
    if (analysis.framework) {
      analysis.reasoning.push(`Detected ${analysis.framework} framework`)
    }

    // Detect databases
    analysis.databases = this.detectDatabases()
    if (analysis.databases.length > 0) {
      analysis.reasoning.push(`Detected databases: ${analysis.databases.join(', ')}`)
    }

    // Detect project features
    analysis.hasApi = this.detectAPI()
    analysis.hasWebInterface = this.detectWebInterface()
    analysis.hasImageProcessing = this.detectImageProcessing()
    analysis.hasEnterpriseFeatures = this.detectEnterpriseFeatures()

    // Determine recommended configuration
    analysis.recommendedConfig = this.determineOptimalConfig(analysis)

    return analysis
  }

  /**
   * Detect the PHP framework being used
   */
  private detectFramework(): ProjectAnalysis['framework'] {
    // Check for Laravel
    if (fs.existsSync(path.join(this.projectRoot, 'artisan'))
      && fs.existsSync(path.join(this.projectRoot, 'composer.json'))) {
      try {
        const composerJson = JSON.parse(fs.readFileSync(path.join(this.projectRoot, 'composer.json'), 'utf-8'))
        if (composerJson.require?.['laravel/framework']) {
          return 'laravel'
        }
        if (composerJson.require?.['laravel/lumen-framework']) {
          return 'laravel' // Treat Lumen as Laravel
        }
      }
      catch {
        // Ignore JSON parse errors
      }
    }

    // Check for WordPress
    if (fs.existsSync(path.join(this.projectRoot, 'wp-config.php'))
      || fs.existsSync(path.join(this.projectRoot, 'wp-config-sample.php'))) {
      return 'wordpress'
    }

    // Check for Symfony
    if (fs.existsSync(path.join(this.projectRoot, 'symfony.lock'))
      || fs.existsSync(path.join(this.projectRoot, 'config', 'bundles.php'))) {
      return 'symfony'
    }

    return null
  }

  /**
   * Detect databases used in the project
   */
  private detectDatabases(): ('mysql' | 'postgres' | 'sqlite')[] {
    const databases: ('mysql' | 'postgres' | 'sqlite')[] = []

    // Check Laravel .env file
    const envPath = path.join(this.projectRoot, '.env')
    if (fs.existsSync(envPath)) {
      try {
        const envContent = fs.readFileSync(envPath, 'utf-8')

        if (envContent.includes('DB_CONNECTION=mysql')
          || envContent.includes('DB_CONNECTION=pgsql')
          || envContent.includes('DB_CONNECTION=sqlite')) {
          if (envContent.includes('DB_CONNECTION=mysql')) {
            databases.push('mysql')
          }
          if (envContent.includes('DB_CONNECTION=pgsql') || envContent.includes('DB_CONNECTION=postgres')) {
            databases.push('postgres')
          }
          if (envContent.includes('DB_CONNECTION=sqlite')) {
            databases.push('sqlite')
          }
        }
      }
      catch {
        // Ignore file read errors
      }
    }

    // Check for database files
    if (fs.existsSync(path.join(this.projectRoot, 'database.sqlite'))
      || fs.existsSync(path.join(this.projectRoot, 'database', 'database.sqlite'))) {
      if (!databases.includes('sqlite')) {
        databases.push('sqlite')
      }
    }

    // Check WordPress wp-config.php
    const wpConfigPath = path.join(this.projectRoot, 'wp-config.php')
    if (fs.existsSync(wpConfigPath)) {
      try {
        const wpConfig = fs.readFileSync(wpConfigPath, 'utf-8')
        if (wpConfig.includes('DB_HOST') && wpConfig.includes('DB_NAME')) {
          if (!databases.includes('mysql')) {
            databases.push('mysql') // WordPress typically uses MySQL
          }
        }
      }
      catch {
        // Ignore file read errors
      }
    }

    // If no databases detected, default to SQLite
    if (databases.length === 0)
      databases.push('sqlite')

    return databases
  }

  /**
   * Detect if project has API endpoints
   */
  private detectAPI(): boolean {
    // Check for API routes
    const apiRoutes = [
      path.join(this.projectRoot, 'routes', 'api.php'),
      path.join(this.projectRoot, 'app', 'Http', 'Controllers', 'Api'),
      path.join(this.projectRoot, 'api'),
    ]

    return apiRoutes.some(route => fs.existsSync(route))
  }

  /**
   * Detect if project has web interface
   */
  private detectWebInterface(): boolean {
    // Check for web routes and views
    const webIndicators = [
      path.join(this.projectRoot, 'routes', 'web.php'),
      path.join(this.projectRoot, 'resources', 'views'),
      path.join(this.projectRoot, 'templates'),
      path.join(this.projectRoot, 'public', 'index.php'),
    ]

    return webIndicators.some(indicator => fs.existsSync(indicator))
  }

  /**
   * Detect if project has image processing
   */
  private detectImageProcessing(): boolean {
    // Check for image-related directories and files
    const imageIndicators = [
      path.join(this.projectRoot, 'storage', 'app', 'public', 'images'),
      path.join(this.projectRoot, 'public', 'images'),
      path.join(this.projectRoot, 'resources', 'images'),
      path.join(this.projectRoot, 'uploads'),
    ]

    return imageIndicators.some(indicator => fs.existsSync(indicator))
  }

  /**
   * Detect if project has enterprise features
   */
  private detectEnterpriseFeatures(): boolean {
    // Check for enterprise features
    const enterpriseIndicators = [
      path.join(this.projectRoot, 'app', 'Services'),
      path.join(this.projectRoot, 'app', 'Jobs'),
      path.join(this.projectRoot, 'app', 'Events'),
      path.join(this.projectRoot, 'app', 'Listeners'),
      path.join(this.projectRoot, 'config', 'queue.php'),
      path.join(this.projectRoot, 'config', 'cache.php'),
    ]

    return enterpriseIndicators.some(indicator => fs.existsSync(indicator))
  }

  /**
   * Determine the optimal PHP configuration based on analysis
   */
  private determineOptimalConfig(analysis: ProjectAnalysis): string {
    const { framework, databases, hasApi, hasWebInterface, hasEnterpriseFeatures } = analysis

    // Framework-specific configurations
    if (framework === 'wordpress') {
      return 'wordpress'
    }

    if (framework === 'laravel') {
      // Laravel with specific database
      if (databases.includes('postgres') && !databases.includes('mysql')) {
        return 'laravel-postgres'
      }
      if (databases.includes('sqlite') && databases.length === 1) {
        return 'laravel-sqlite'
      }
      // Default Laravel with MySQL
      return 'laravel-mysql'
    }

    // API-only projects
    if (hasApi && !hasWebInterface) {
      return 'api-only'
    }

    // Enterprise projects with multiple databases
    if (hasEnterpriseFeatures || databases.length > 1) {
      return 'enterprise'
    }

    // Check if user wants all databases
    if (config.services?.php?.autoDetect?.includeAllDatabases) {
      return 'full-stack'
    }

    // Check if user wants enterprise features
    if (config.services?.php?.autoDetect?.includeEnterprise) {
      return 'enterprise'
    }

    // Default based on detected databases
    if (databases.includes('postgres')) {
      return 'laravel-postgres'
    }
    if (databases.includes('sqlite')) {
      return 'laravel-sqlite'
    }

    // Default to Laravel MySQL (most common)
    return 'laravel-mysql'
  }

  /**
   * Get human-readable explanation of the configuration choice
   */
  getConfigurationExplanation(analysis: ProjectAnalysis): string {
    const { recommendedConfig, reasoning } = analysis

    let explanation = `🎯 Recommended PHP Configuration: ${recommendedConfig}\n\n`

    explanation += `📋 Analysis:\n`
    reasoning.forEach((reason) => {
      explanation += `  • ${reason}\n`
    })

    explanation += `\n🔧 Configuration Details:\n`

    switch (recommendedConfig) {
      case 'laravel-mysql':
        explanation += `  • Optimized for Laravel with MySQL/MariaDB\n`
        explanation += `  • Includes: CLI, FPM, MySQL drivers, web extensions\n`
        break
      case 'laravel-postgres':
        explanation += `  • Optimized for Laravel with PostgreSQL\n`
        explanation += `  • Includes: CLI, FPM, PostgreSQL drivers, web extensions\n`
        break
      case 'laravel-sqlite':
        explanation += `  • Optimized for Laravel with SQLite (development)\n`
        explanation += `  • Includes: CLI, FPM, SQLite drivers, web extensions\n`
        break
      case 'api-only':
        explanation += `  • Minimal configuration for API-only applications\n`
        explanation += `  • Includes: CLI, FPM, basic web extensions\n`
        break
      case 'enterprise':
        explanation += `  • Full-featured configuration for enterprise applications\n`
        explanation += `  • Includes: All major extensions and database drivers\n`
        break
      case 'wordpress':
        explanation += `  • Optimized for WordPress applications\n`
        explanation += `  • Includes: WordPress-specific extensions\n`
        break
      case 'full-stack':
        explanation += `  • Complete PHP with all database drivers\n`
        explanation += `  • Includes: All extensions for maximum flexibility\n`
        break
    }

    return explanation
  }
}
