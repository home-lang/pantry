import { spawn } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { config } from './config'

export interface ProjectFramework {
  name: string
  detectionFile: string
  databaseConfig?: {
    envFile?: string
    migrationCommand?: string[]
    seedCommand?: string[]
    configClearCommand?: string[]
  }
}

/**
 * Get supported frameworks based on configuration
 */
export function getSupportedFrameworks(): ProjectFramework[] {
  const frameworks: ProjectFramework[] = []

  if (config.services.frameworks.enabled) {
    if (config.services.frameworks.stacks.enabled) {
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

    if (config.services.frameworks.laravel.enabled) {
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
  }

  return frameworks
}

/**
 * Detect what PHP framework is being used in the current project
 */
export function detectProjectFramework(): ProjectFramework | null {
  const supportedFrameworks = getSupportedFrameworks()

  for (const framework of supportedFrameworks) {
    if (fs.existsSync(framework.detectionFile)) {
      return framework
    }
  }
  return null
}

/**
 * Set up development environment for any PHP project
 * This function detects project type and configures the best database option
 */
export async function setupPHPDevelopmentEnvironment(options?: {
  preferredDatabase?: 'postgres' | 'sqlite'
  framework?: string
}): Promise<boolean> {
  try {
    console.warn(`🚀 Setting up PHP development environment...`)

    // Detect project framework
    const framework = detectProjectFramework()
    if (!framework) {
      console.warn(`⚠️  No supported PHP framework detected`)
      const supportedFrameworks = getSupportedFrameworks()
      console.warn(`💡 Supported frameworks: ${supportedFrameworks.map(f => f.name).join(', ')}`)
      return false
    }

    console.warn(`✅ Detected ${framework.name} project`)

    // Check if PHP is available
    const phpAvailable = await checkPHPAvailability()
    if (!phpAvailable) {
      console.warn(`📦 Installing PHP...`)
      const { install } = await import('./install')
      await install(['php.net'], `${process.env.HOME}/.local`)
    }

    // Check PHP database extensions
    const extensions = await checkPHPDatabaseExtensions()
    console.warn(`📊 Available PHP database extensions: ${extensions.available.join(', ')}`)

    if (extensions.missing.length > 0) {
      console.warn(`⚠️  Missing PHP extensions: ${extensions.missing.join(', ')}`)
    }

    // Determine best database setup based on available extensions and user preferences
    const preferredDb = options?.preferredDatabase || config.services.frameworks.preferredDatabase
    const forceSQLite = process.env.LAUNCHPAD_FORCE_SQLITE === 'true'

    if (forceSQLite || preferredDb === 'sqlite') {
      console.warn(`🗃️  SQLite selected for database`)
      return await setupSQLiteEnvironment(framework)
    }

    if (extensions.available.includes('pdo_pgsql') && extensions.available.includes('pgsql')) {
      console.warn(`🐘 Setting up PostgreSQL development environment...`)
      return await setupPostgreSQLEnvironment(framework)
    }
    else if (preferredDb === 'postgres') {
      console.warn(`⚠️  PostgreSQL preferred but extensions not available`)
      console.warn(`💡 PHP PostgreSQL extensions (pdo_pgsql, pgsql) are core extensions that require PHP to be compiled with PostgreSQL support`)
      console.warn(`🗃️  Falling back to SQLite for development...`)
      return await setupSQLiteEnvironment(framework)
    }
    else {
      console.warn(`🗃️  Setting up SQLite environment...`)
      return await setupSQLiteEnvironment(framework)
    }
  }
  catch (error) {
    console.error(`❌ Failed to set up development environment: ${error instanceof Error ? error.message : String(error)}`)
    return false
  }
}

/**
 * Check if PHP is available and get version info
 */
async function checkPHPAvailability(): Promise<boolean> {
  try {
    const { findBinaryInPath } = await import('./utils')
    return findBinaryInPath('php') !== null
  }
  catch {
    return false
  }
}

/**
 * Check what PHP database extensions are available
 */
async function checkPHPDatabaseExtensions(): Promise<{ available: string[], missing: string[] }> {
  try {
    const phpProcess = spawn('php', ['-m'], { stdio: ['pipe', 'pipe', 'pipe'] })
    let output = ''

    phpProcess.stdout.on('data', (data) => {
      output += data.toString()
    })

    const success = await new Promise<boolean>((resolve) => {
      phpProcess.on('close', code => resolve(code === 0))
    })

    if (!success) {
      return { available: ['pdo', 'pdo_sqlite', 'sqlite3'], missing: [] }
    }

    const loadedExtensions = output.toLowerCase().split('\n').map(line => line.trim())
    const requiredExtensions = ['pdo', 'pdo_sqlite', 'pdo_mysql', 'pdo_pgsql', 'mysqli', 'pgsql', 'sqlite3']

    const available = requiredExtensions.filter(ext => loadedExtensions.includes(ext))
    const missing = requiredExtensions.filter(ext => !loadedExtensions.includes(ext))

    return { available, missing }
  }
  catch (error) {
    console.warn(`⚠️  Could not check PHP extensions: ${error instanceof Error ? error.message : String(error)}`)
    return { available: ['pdo', 'pdo_sqlite', 'sqlite3'], missing: [] }
  }
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

    // Get project name for database
    const projectName = getProjectDatabaseName()

    // Update environment for PostgreSQL
    if (framework.databaseConfig?.envFile) {
      await updateProjectEnvironment(framework.databaseConfig.envFile, {
        DB_CONNECTION: 'pgsql',
        DB_HOST: '127.0.0.1',
        DB_PORT: '5432',
        DB_DATABASE: projectName,
        DB_USERNAME: config.services.database.username,
        DB_PASSWORD: config.services.database.password,
      })
    }

    console.warn(`✅ PostgreSQL environment configured`)
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
      console.warn(`✅ Created SQLite database file: ${sqliteDbPath}`)
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
        console.warn(`✅ Cleared ${framework.name} configuration cache`)
      }
      catch {
        // Ignore errors - config clear is not critical
      }
    }

    console.warn(`✅ SQLite environment configured`)
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
    console.warn(`✅ Updated ${envFile} file`)
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

    console.warn(`✅ Database setup completed successfully`)
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

  const setupResult = await setupPHPDevelopmentEnvironment({
    preferredDatabase: options?.preferredDatabase,
    framework: 'Laravel',
  })

  if (!setupResult) {
    return false
  }

  if (options?.runMigrations) {
    return await runDatabaseSetup(framework)
  }

  return true
}
