/* eslint-disable no-console */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { config } from './config'

/**
 * Parse .env file and extract database configuration
 */
export function parseEnvFile(envPath: string): Record<string, string> {
  if (!fs.existsSync(envPath)) {
    return {}
  }

  try {
    // Use Bun's built-in env parsing
    const envContent = fs.readFileSync(envPath, 'utf-8')
    const env: Record<string, string> = {}

    for (const line of envContent.split('\n')) {
      const trimmed = line.trim()
      if (trimmed && !trimmed.startsWith('#')) {
        const [key, ...valueParts] = trimmed.split('=')
        if (key && valueParts.length > 0) {
          let value = valueParts.join('=')
          // Remove quotes if present
          if ((value.startsWith('"') && value.endsWith('"'))
            || (value.startsWith('\'') && value.endsWith('\''))) {
            value = value.slice(1, -1)
          }
          env[key] = value
        }
      }
    }

    return env
  }
  catch (error) {
    console.warn(`Warning: Could not parse .env file at ${envPath}:`, error)
    return {}
  }
}

/**
 * Get database configuration from Laravel .env file
 */
export function getLaravelDatabaseConfig(projectDir: string = process.cwd()): {
  driver: string
  host: string
  port: number
  database: string
  username: string
  password: string
} {
  const envPath = path.join(projectDir, '.env')
  const env = parseEnvFile(envPath)

  return {
    driver: env.DB_CONNECTION || 'sqlite',
    host: env.DB_HOST || 'localhost',
    port: Number.parseInt(env.DB_PORT || '5432', 10),
    database: env.DB_DATABASE || path.basename(projectDir).replace(/\W/g, '_'),
    username: env.DB_USERNAME || 'root',
    password: env.DB_PASSWORD || 'password',
  }
}

export interface ProjectFramework {
  name: string
  detectionFile: string
  databaseConfig?: {
    envFile?: string
    migrationCommand?: string[]
    seedCommand?: string[]
    configClearCommand?: string[]
    actualConfig?: {
      driver: string
      host: string
      port: number
      database: string
      username: string
      password: string
    }
  }
}

/**
 * Get supported frameworks based on configuration
 */
export function getSupportedFrameworks(): ProjectFramework[] {
  const frameworks: ProjectFramework[] = []

  const servicesConfig = config.services
  if (!servicesConfig?.frameworks?.enabled) {
    return frameworks
  }

  const frameworksConfig = servicesConfig.frameworks

  if (frameworksConfig.stacks?.enabled) {
    frameworks.push({
      name: 'Stacks.js',
      detectionFile: 'buddy',
      databaseConfig: {
        envFile: '.env',
        migrationCommand: ['buddy', 'migrate'],
        seedCommand: ['buddy', 'db:seed'],
        configClearCommand: ['buddy', 'config:clear'],
      },
    })
  }

  if ((frameworksConfig as any).laravel?.enabled) {
    frameworks.push({
      name: 'Laravel',
      detectionFile: 'artisan',
      databaseConfig: {
        envFile: '.env',
        migrationCommand: ['php', 'artisan', 'migrate:fresh'],
        seedCommand: ['php', 'artisan', 'db:seed'],
        configClearCommand: ['php', 'artisan', 'config:clear'],
      },
    })
  }

  return frameworks
}

/**
 * Detect what framework is being used in the current project
 */
export function detectProjectFramework(): ProjectFramework | null {
  const supportedFrameworks = getSupportedFrameworks()

  for (const framework of supportedFrameworks) {
    if (fs.existsSync(framework.detectionFile)) {
      // For Laravel, enhance with actual .env configuration
      if (framework.name === 'Laravel' && fs.existsSync('.env')) {
        const dbConfig = getLaravelDatabaseConfig()
        return {
          ...framework,
          databaseConfig: {
            ...framework.databaseConfig!,
            actualConfig: dbConfig,
          },
        }
      }
      return framework
    }
  }
  return null
}

/**
 * Set up PostgreSQL development environment
 */
async function setupPostgreSQLEnvironment(framework: ProjectFramework): Promise<boolean> {
  try {
    console.warn(`🔧 Starting PostgreSQL service...`)

    const { startService } = await import('./services/manager')
    const postgresResult = await startService('postgres')

    if (!postgresResult) {
      console.error(`❌ Failed to start PostgreSQL`)
      return false
    }

    // Get database configuration from .env or use defaults
    const actualConfig = framework.databaseConfig?.actualConfig
    const projectName = getProjectDatabaseName()

    // Use .env config if available, otherwise use sensible defaults
    const dbConfig = {
      DB_CONNECTION: actualConfig?.driver === 'sqlite' ? 'sqlite' : 'pgsql',
      DB_HOST: actualConfig?.host || '127.0.0.1',
      DB_PORT: String(actualConfig?.port || 5432),
      DB_DATABASE: actualConfig?.database || projectName,
      DB_USERNAME: actualConfig?.username || config.services?.database?.username || 'root',
      DB_PASSWORD: actualConfig?.password || config.services?.database?.password || 'password',
    }

    // Update environment for PostgreSQL (only update if not already configured)
    if (framework.databaseConfig?.envFile) {
      await updateProjectEnvironment(framework.databaseConfig.envFile, dbConfig)
    }

    console.log(`✅ PostgreSQL environment configured`)
    if (framework.databaseConfig?.migrationCommand) {
      console.warn(`💡 You can now run: ${framework.databaseConfig.migrationCommand.join(' ')}`)
    }

    return true
  }
  catch (error) {
    console.error(`❌ Failed to set up PostgreSQL environment: ${error instanceof Error ? error.message : String(error)}`)
    return false
  }
}

/**
 * Set up SQLite development environment
 */
async function setupSQLiteEnvironment(framework: ProjectFramework): Promise<boolean> {
  try {
    console.warn(`🔧 Configuring SQLite database...`)

    // Create database directory and SQLite file
    const dbDir = 'database'
    const sqliteDbPath = path.join(dbDir, 'database.sqlite')

    await fs.promises.mkdir(dbDir, { recursive: true })
    if (!fs.existsSync(sqliteDbPath)) {
      await fs.promises.writeFile(sqliteDbPath, '', 'utf8')
      console.log(`✅ Created SQLite database file: ${sqliteDbPath}`)
    }

    // Update environment for SQLite
    if (framework.databaseConfig?.envFile) {
      await updateProjectEnvironment(framework.databaseConfig.envFile, {
        DB_CONNECTION: 'sqlite',
        DB_DATABASE: sqliteDbPath,
      })
    }

    // Clear framework config cache if supported
    if (framework.databaseConfig?.configClearCommand) {
      try {
        await new Promise<void>((resolve) => {
          const configClear = spawn(framework.databaseConfig!.configClearCommand![0], framework.databaseConfig!.configClearCommand!.slice(1), { stdio: 'pipe' })
          configClear.on('close', () => resolve())
        })
        console.log(`✅ Cleared ${framework.name} configuration cache`)
      }
      catch {
        // Ignore errors - config clear is not critical
      }
    }

    console.log(`✅ SQLite environment configured`)
    if (framework.databaseConfig?.migrationCommand) {
      console.warn(`💡 You can now run: ${framework.databaseConfig.migrationCommand.join(' ')}`)
    }

    return true
  }
  catch (error) {
    console.error(`❌ Failed to set up SQLite environment: ${error instanceof Error ? error.message : String(error)}`)
    return false
  }
}

/**
 * Get project database name from directory or config
 */
function getProjectDatabaseName(): string {
  const projectName = path.basename(process.cwd())
  // Remove common suffixes and normalize
  return projectName.replace(/-api$|_api$|-app$|_app$/i, '').replace(/\W/g, '_')
}

/**
 * Update project environment file with database configuration
 */
async function updateProjectEnvironment(envFile: string, config: Record<string, string>): Promise<void> {
  try {
    if (!fs.existsSync(envFile)) {
      console.warn(`⚠️  No ${envFile} file found`)
      return
    }

    let envContent = await fs.promises.readFile(envFile, 'utf8')

    for (const [key, value] of Object.entries(config)) {
      if (envContent.includes(`${key}=`)) {
        envContent = envContent.replace(new RegExp(`^${key}=.*`, 'gm'), `${key}=${value}`)
      }
      else {
        envContent += `\n${key}=${value}`
      }
    }

    // Comment out conflicting PostgreSQL settings if switching to SQLite
    if (config.DB_CONNECTION === 'sqlite') {
      envContent = envContent.replace(/^(DB_HOST=.*)/gm, '# $1')
      envContent = envContent.replace(/^(DB_PORT=.*)/gm, '# $1')
      envContent = envContent.replace(/^(DB_USERNAME=.*)/gm, '# $1')
      envContent = envContent.replace(/^(DB_PASSWORD=.*)/gm, '# $1')
    }

    await fs.promises.writeFile(envFile, envContent, 'utf8')
    console.log(`✅ Updated ${envFile} file`)
  }
  catch (error) {
    console.warn(`⚠️  Could not update ${envFile} file: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Run database migrations and seeding for any supported framework
 */
export async function runDatabaseSetup(framework?: ProjectFramework): Promise<boolean> {
  try {
    const detectedFramework = framework || detectProjectFramework()
    if (!detectedFramework?.databaseConfig?.migrationCommand) {
      console.warn(`⚠️  No migration command configured for current project`)
      return false
    }

    console.warn(`🗄️  Running database migrations for ${detectedFramework.name}...`)

    // Run migration command
    const migrateCmd = detectedFramework.databaseConfig.migrationCommand
    const migrateProcess = spawn(migrateCmd[0], migrateCmd.slice(1), {
      stdio: ['pipe', 'inherit', 'inherit'],
    })

    const migrateResult = await new Promise<number>((resolve) => {
      migrateProcess.on('close', code => resolve(code || 0))
    })

    if (migrateResult !== 0) {
      console.error(`❌ Migration failed with exit code: ${migrateResult}`)
      return false
    }

    // Run seeding if available
    if (detectedFramework.databaseConfig.seedCommand) {
      console.warn(`🌱 Running database seeding...`)
      const seedCmd = detectedFramework.databaseConfig.seedCommand
      const seedProcess = spawn(seedCmd[0], seedCmd.slice(1), {
        stdio: ['pipe', 'inherit', 'inherit'],
      })

      const seedResult = await new Promise<number>((resolve) => {
        seedProcess.on('close', code => resolve(code || 0))
      })

      if (seedResult !== 0) {
        console.warn(`⚠️  Seeding failed with exit code: ${seedResult}`)
        // Don't fail completely - migrations succeeded
      }
    }

    console.log(`✅ Database setup completed successfully`)
    return true
  }
  catch (error) {
    console.error(`❌ Failed to run database setup: ${error instanceof Error ? error.message : String(error)}`)
    return false
  }
}

/**
 * Laravel-specific setup function for backward compatibility
 */
export async function setupLaravelEnvironment(options?: {
  preferredDatabase?: 'postgres' | 'sqlite'
  runMigrations?: boolean
}): Promise<boolean> {
  // Only run if this is actually a Laravel project
  const framework = detectProjectFramework()
  if (!framework || framework.name !== 'Laravel') {
    console.warn(`⚠️  This is not a Laravel project`)
    return false
  }

  console.warn(`🚀 Setting up Laravel development environment...`)

  // Set up database based on user preference
  const preferredDb = options?.preferredDatabase || 'sqlite'
  const forceSQLite = process.env.LAUNCHPAD_FORCE_SQLITE === 'true'

  if (forceSQLite || preferredDb === 'sqlite') {
    console.warn(`🗃️  Setting up SQLite for Laravel project`)
    const setupResult = await setupSQLiteEnvironment(framework)
    if (!setupResult) {
      return false
    }
  }
  else {
    console.warn(`🐘 Setting up PostgreSQL for Laravel project`)
    const setupResult = await setupPostgreSQLEnvironment(framework)
    if (!setupResult) {
      console.warn(`🗃️  Falling back to SQLite for development...`)
      const fallbackResult = await setupSQLiteEnvironment(framework)
      if (!fallbackResult) {
        return false
      }
    }
  }

  if (options?.runMigrations) {
    return await runDatabaseSetup(framework)
  }

  return true
}
