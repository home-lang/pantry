/* eslint-disable no-console */
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import net from 'node:net'
import path from 'node:path'
import process from 'node:process'
import { findBinaryInPath } from '../utils'

export interface DatabaseOptions {
  host?: string
  port?: number
  user?: string
  password?: string
  type?: 'postgres' | 'mysql' | 'sqlite'
}

export interface DatabaseConnectionInfo {
  type: 'postgres' | 'mysql' | 'sqlite'
  host?: string
  port?: number
  database: string
  username?: string
  password?: string
  path?: string // For SQLite
}

/**
 * Create a database for a project with auto-detection of database type
 */
export async function createProjectDatabase(dbName: string, options: DatabaseOptions = {}): Promise<DatabaseConnectionInfo> {
  const sanitizedName = dbName.toLowerCase().replace(/\W/g, '_')

  // Auto-detect database type based on available services or options
  const dbType = options.type || await detectPreferredDatabaseType()

  console.warn(`🗄️  Creating ${dbType.toUpperCase()} database: ${sanitizedName}`)

  switch (dbType) {
    case 'postgres':
      return await createPostgreSQLDatabase(sanitizedName, options)
    case 'mysql':
      return await createMySQLDatabase(sanitizedName, options)
    case 'sqlite':
      return await createSQLiteDatabase(sanitizedName, options)
    default:
      throw new Error(`Unsupported database type: ${dbType}`)
  }
}

/**
 * Create PostgreSQL database
 */
async function createPostgreSQLDatabase(dbName: string, options: DatabaseOptions): Promise<DatabaseConnectionInfo> {
  const { host = '127.0.0.1', port = 5432, user = 'postgres' } = options

  try {
    // Ensure server is accepting connections before attempting to create DB
    const maxAttempts = 20
    let ready = process.env.LAUNCHPAD_PG_READY === '1'
    const pgIsReadyBin = findBinaryInPath('pg_isready') || 'pg_isready'

    for (let i = 0; i < maxAttempts && !ready; i++) {
      let okPg = false
      try {
        await executeCommand([pgIsReadyBin, '-h', host, '-p', String(port)])
        okPg = true
      }
      catch {}

      let okTcp = false
      if (!okPg) {
        okTcp = await new Promise<boolean>((resolve) => {
          const socket = net.connect({ host, port, timeout: 1000 }, () => {
            socket.end()
            resolve(true)
          })
          socket.on('error', () => resolve(false))
          socket.on('timeout', () => {
            socket.destroy()
            resolve(false)
          })
        })
      }

      ready = okPg || okTcp

      if (!ready) {
        if (process.env.LAUNCHPAD_DEBUG === '1') {
          console.warn(`⏳ PostgreSQL readiness attempt ${i + 1}/${maxAttempts} not ready; methods: pg_isready=${okPg ? 'ok' : 'fail'} tcp=${okTcp ? 'ok' : 'fail'}`)
        }
        await new Promise(r => setTimeout(r, 250 + i * 150))
      }
    }

    if (!ready)
      throw new Error('PostgreSQL not accepting connections yet')
    // Small grace period after accept
    await new Promise(r => setTimeout(r, 250))

    // Check if database exists
    const checkCommand = ['psql', '-h', host, '-p', String(port), '-U', user, '-lqt']
    const existing = await executeCommand(checkCommand)

    if (!existing.includes(dbName)) {
      // Create the database
      const createCommand = ['createdb', '-h', host, '-p', String(port), '-U', user, dbName]
      let created = false
      let lastErr: unknown
      for (let i = 0; i < 5; i++) {
        try {
          await executeCommand(createCommand)
          created = true
          break
        }
        catch (e) {
          lastErr = e
          await new Promise(r => setTimeout(r, 500 + i * 500))
        }
      }
      if (!created) {
        throw lastErr instanceof Error ? lastErr : new Error(String(lastErr))
      }
      console.log(`✅ PostgreSQL database ${dbName} created successfully`)
    }
    else {
      console.log(`✅ PostgreSQL database ${dbName} already exists`)
    }

    return {
      type: 'postgres',
      host,
      port,
      database: dbName,
      username: user,
      password: options.password || '',
    }
  }
  catch (error) {
    throw new Error(`Failed to create PostgreSQL database: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Create MySQL database
 */
async function createMySQLDatabase(dbName: string, options: DatabaseOptions): Promise<DatabaseConnectionInfo> {
  const { host = 'localhost', port = 3306, user = 'root', password = '' } = options

  try {
    // Create database SQL command
    const sql = `CREATE DATABASE IF NOT EXISTS \`${dbName}\` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;`
    const mysqlArgs = ['-h', host, '-P', String(port), '-u', user]

    if (password) {
      mysqlArgs.push(`-p${password}`)
    }

    mysqlArgs.push('-e', sql)

    await executeCommand(['mysql', ...mysqlArgs])
    console.log(`✅ MySQL database ${dbName} created successfully`)

    return {
      type: 'mysql',
      host,
      port,
      database: dbName,
      username: user,
      password: password || '',
    }
  }
  catch (error) {
    throw new Error(`Failed to create MySQL database: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Create SQLite database
 */
async function createSQLiteDatabase(dbName: string, _options: DatabaseOptions): Promise<DatabaseConnectionInfo> {
  const projectDir = process.cwd()
  const dbPath = path.join(projectDir, 'database', `${dbName}.sqlite`)

  try {
    // Ensure database directory exists
    fs.mkdirSync(path.dirname(dbPath), { recursive: true })

    // Create empty SQLite database if it doesn't exist
    if (!fs.existsSync(dbPath)) {
      // Touch the file to create it
      fs.writeFileSync(dbPath, '')
      console.log(`✅ SQLite database created: ${dbPath}`)
    }
    else {
      console.log(`✅ SQLite database already exists: ${dbPath}`)
    }

    return {
      type: 'sqlite',
      database: dbName,
      path: dbPath,
    }
  }
  catch (error) {
    throw new Error(`Failed to create SQLite database: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Auto-detect preferred database type based on available services
 */
async function detectPreferredDatabaseType(): Promise<'postgres' | 'mysql' | 'sqlite'> {
  try {
    // Check for running database services
    const postgresRunning = await isServiceRunning('postgres', 5432)
    const mysqlRunning = await isServiceRunning('mysql', 3306)

    if (postgresRunning)
      return 'postgres'
    if (mysqlRunning)
      return 'mysql'

    // Default to SQLite as it requires no server
    return 'sqlite'
  }
  catch {
    return 'sqlite'
  }
}

/**
 * Check if a database service is running
 */
async function isServiceRunning(service: string, port: number): Promise<boolean> {
  try {
    if (service === 'postgres') {
      await executeCommand(['pg_isready', '-h', '127.0.0.1', '-p', String(port)])
      return true
    }
    else if (service === 'mysql') {
      await executeCommand(['mysqladmin', 'ping', '-h', '127.0.0.1', '-P', String(port)])
      return true
    }
    return false
  }
  catch {
    return false
  }
}

/**
 * Generate Laravel .env configuration for database and search
 */
export function generateLaravelConfig(connectionInfo: DatabaseConnectionInfo, includeMeilisearch = true): string {
  const config: string[] = []

  switch (connectionInfo.type) {
    case 'postgres':
      config.push(`DB_CONNECTION=pgsql`)
      config.push(`DB_HOST=${connectionInfo.host}`)
      config.push(`DB_PORT=${connectionInfo.port}`)
      config.push(`DB_DATABASE=${connectionInfo.database}`)
      config.push(`DB_USERNAME=${connectionInfo.username}`)
      config.push(`DB_PASSWORD=${connectionInfo.password || ''}`)
      break

    case 'mysql':
      config.push(`DB_CONNECTION=mysql`)
      config.push(`DB_HOST=${connectionInfo.host}`)
      config.push(`DB_PORT=${connectionInfo.port}`)
      config.push(`DB_DATABASE=${connectionInfo.database}`)
      config.push(`DB_USERNAME=${connectionInfo.username}`)
      config.push(`DB_PASSWORD=${connectionInfo.password || ''}`)
      break

    case 'sqlite':
      config.push(`DB_CONNECTION=sqlite`)
      config.push(`DB_DATABASE=${connectionInfo.path}`)
      break
  }

  // Add Meilisearch configuration if requested
  if (includeMeilisearch) {
    config.push('')
    config.push('# Meilisearch Configuration')
    config.push('SCOUT_DRIVER=meilisearch')
    config.push('MEILISEARCH_HOST=http://127.0.0.1:7700')
    config.push('MEILISEARCH_KEY=masterKey')
  }

  return config.join('\n')
}

/**
 * Check if Meilisearch is running
 */
export async function isMeilisearchRunning(): Promise<boolean> {
  try {
    await executeCommand(['curl', '-f', '-s', 'http://127.0.0.1:7700/health'])
    return true
  }
  catch {
    return false
  }
}

/**
 * Start required services for Laravel project
 */
export async function startLaravelServices(): Promise<void> {
  const { startService } = await import('./manager')

  console.warn('🚀 Starting Laravel services...')

  // Start Meilisearch for search functionality
  try {
    await startService('meilisearch')
    console.warn('✅ Meilisearch started')
  }
  catch (error) {
    console.warn(`⚠️ Failed to start Meilisearch: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Run Laravel migrations and seeders
 */
export async function runLaravelMigrations(seedData = false): Promise<void> {
  // Skip Laravel migrations in test mode
  if (process.env.NODE_ENV === 'test' || process.env.LAUNCHPAD_TEST_MODE === 'true') {
    console.warn('🧪 Test mode: Skipping Laravel migrations')
    return
  }

  try {
    console.warn('🔄 Running Laravel migrations...')
    await executeCommand(['php', 'artisan', 'migrate', '--force'])
    console.warn('✅ Migrations completed')

    if (seedData) {
      console.warn('🌱 Seeding database...')
      await executeCommand(['php', 'artisan', 'db:seed', '--force'])
      console.warn('✅ Database seeded')
    }
  }
  catch (error) {
    throw new Error(`Failed to run Laravel migrations: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Execute a command and return stdout
 */
async function executeCommand(command: string[]): Promise<string> {
  const [cmd, ...args] = command
  const executablePath = findBinaryInPath(cmd) || cmd

  return new Promise((resolve, reject) => {
    const proc = spawn(executablePath, args, {
      stdio: ['pipe', 'pipe', 'pipe'],
      env: process.env,
    })

    let stdout = ''
    let stderr = ''

    proc.stdout?.on('data', (data) => {
      stdout += data.toString()
    })

    proc.stderr?.on('data', (data) => {
      stderr += data.toString()
    })

    proc.on('close', (code) => {
      if (code === 0) {
        resolve(stdout)
      }
      else {
        reject(new Error(`Command failed with exit code ${code}: ${stderr || stdout}`))
      }
    })

    proc.on('error', reject)
  })
}
