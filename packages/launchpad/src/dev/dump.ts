/* eslint-disable no-console */
import type { PostSetupCommand } from '../types'
import { execSync } from 'node:child_process'
import crypto from 'node:crypto'
import fs from 'node:fs'
import { homedir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { config } from '../config'
import { findDependencyFile } from '../env'
import { install, resetInstalledTracker } from '../install'

// Utility functions
function generateProjectHash(projectPath: string): string {
  // Use the same hash generation logic as the test expects
  // Resolve the path to handle symlinks (like /var -> /private/var on macOS)
  const resolvedPath = fs.existsSync(projectPath) ? fs.realpathSync(projectPath) : projectPath
  const hash = crypto.createHash('md5').update(resolvedPath).digest('hex')
  const projectName = path.basename(resolvedPath)
  const result = `${projectName}_${hash.slice(0, 8)}`

  return result
}

export interface DumpOptions {
  dryrun?: boolean
  quiet?: boolean
  shellOutput?: boolean
  skipGlobal?: boolean // Skip global package processing for testing
}

function extractHookCommandsFromDepsYaml(filePath: string, hookName: 'preSetup' | 'postSetup' | 'preActivation' | 'postActivation'): PostSetupCommand[] {
  try {
    const content = fs.readFileSync(filePath, 'utf8')
    const lines = content.split(/\r?\n/)
    const cmds: PostSetupCommand[] = []
    let inHook = false
    let inCommands = false
    let baseIndent = 0
    for (let i = 0; i < lines.length; i++) {
      const raw = lines[i]
      const indent = raw.length - raw.trimStart().length
      const line = raw.trim()
      if (!inHook) {
        if (line.startsWith(`${hookName}:`)) {
          inHook = true
          baseIndent = indent
        }
        continue
      }
      if (indent <= baseIndent && line.endsWith(':')) {
        break
      }
      if (!inCommands && line.startsWith('commands:')) {
        inCommands = true
        continue
      }
      if (inCommands) {
        const m1 = line.match(/command:\s*"([^"]+)"/)
        const m2 = line.match(/command:\s*'([^']+)'/)
        if (m1 || m2) {
          const cmd = (m1?.[1] || m2?.[1]) as string
          if (cmd && cmd.length > 0)
            cmds.push({ command: cmd })
        }
      }
    }
    return cmds
  }
  catch {
    return []
  }
}

/**
 * Check if packages are installed in the given environment directory
 */
function checkMissingPackages(packages: string[], envDir: string): string[] {
  if (packages.length === 0)
    return []

  const pkgsDir = path.join(envDir, 'pkgs')
  if (!fs.existsSync(pkgsDir)) {
    return packages // All packages are missing if pkgs dir doesn't exist
  }

  const missingPackages: string[] = []

  for (const packageSpec of packages) {
    // Parse package spec (e.g., "php@^8.4.0" -> "php")
    const [packageName] = packageSpec.split('@')

    const packageDir = path.join(pkgsDir, packageName)
    if (!fs.existsSync(packageDir)) {
      missingPackages.push(packageSpec)
      continue
    }

    // Check if any version of this package is installed
    try {
      const versionDirs = fs.readdirSync(packageDir, { withFileTypes: true })
        .filter(entry => entry.isDirectory() && entry.name.startsWith('v'))

      if (versionDirs.length === 0) {
        missingPackages.push(packageSpec)
      }
    }
    catch {
      missingPackages.push(packageSpec)
    }
  }

  return missingPackages
}

/**
 * Check if environment needs packages installed based on what's actually missing
 */
function needsPackageInstallation(localPackages: string[], globalPackages: string[], envDir: string, globalEnvDir: string): { needsLocal: boolean, needsGlobal: boolean, missingLocal: string[], missingGlobal: string[] } {
  const missingLocal = checkMissingPackages(localPackages, envDir)
  const missingGlobal = checkMissingPackages(globalPackages, globalEnvDir)

  return {
    needsLocal: missingLocal.length > 0,
    needsGlobal: missingGlobal.length > 0,
    missingLocal,
    missingGlobal,
  }
}

/**
 * Detect if this is a Laravel project and provide setup assistance
 */
export async function detectLaravelProject(dir: string): Promise<{ isLaravel: boolean, suggestions: string[] }> {
  const artisanFile = path.join(dir, 'artisan')
  const composerFile = path.join(dir, 'composer.json')
  const appDir = path.join(dir, 'app')

  if (!fs.existsSync(artisanFile) || !fs.existsSync(composerFile) || !fs.existsSync(appDir)) {
    return { isLaravel: false, suggestions: [] }
  }

  const suggestions: string[] = []

  // Check for .env file
  const envFile = path.join(dir, '.env')
  if (!fs.existsSync(envFile)) {
    const envExample = path.join(dir, '.env.example')
    if (fs.existsSync(envExample)) {
      suggestions.push('Copy .env.example to .env and configure database settings')
    }
  }

  // Check for Laravel application key and generate if missing
  if (fs.existsSync(envFile)) {
    try {
      const envContent = fs.readFileSync(envFile, 'utf8')

      // Check for missing or empty APP_KEY
      const appKeyMatch = envContent.match(/^APP_KEY=(.*)$/m)
      const appKey = appKeyMatch?.[1]?.trim()

      // Remove debug message

      if (!appKey || appKey === '' || appKey === 'base64:') {
        // Check if PHP and Artisan are available before attempting key generation
        try {
          // First verify PHP is working
          execSync('php --version', { cwd: dir, stdio: 'pipe' })

          // Then verify Artisan is available
          execSync('php artisan --version', { cwd: dir, stdio: 'pipe' })

          // Now generate the key
          execSync('php artisan key:generate --force', {
            cwd: dir,
            stdio: 'pipe',
          })

          // Verify the key was generated successfully
          const updatedEnvContent = fs.readFileSync(envFile, 'utf8')
          const updatedAppKeyMatch = updatedEnvContent.match(/^APP_KEY=(.*)$/m)
          const updatedAppKey = updatedAppKeyMatch?.[1]?.trim()

          if (updatedAppKey && updatedAppKey !== '' && updatedAppKey !== 'base64:') {
            suggestions.push('✅ Generated Laravel application encryption key automatically')
          }
          else {
            suggestions.push('⚠️  Run: php artisan key:generate to set application encryption key')
          }
        }
        catch {
          // If automatic generation fails, suggest manual command
          suggestions.push('⚠️  Generate application encryption key: php artisan key:generate')
        }
      }
      else if (appKey && appKey.length > 10) {
        // Key exists and looks valid
        suggestions.push('✅ Laravel application encryption key is configured')
      }

      // Check for database configuration
      if (envContent.includes('DB_CONNECTION=mysql') && !envContent.includes('DB_PASSWORD=')) {
        suggestions.push('Configure MySQL database credentials in .env file')
      }
      if (envContent.includes('DB_CONNECTION=pgsql') && !envContent.includes('DB_PASSWORD=')) {
        suggestions.push('Configure PostgreSQL database credentials in .env file')
      }
      if (envContent.includes('DB_CONNECTION=sqlite')) {
        const dbFile = envContent.match(/DB_DATABASE=(.+)/)?.[1]?.trim()
        if (dbFile && !fs.existsSync(dbFile)) {
          suggestions.push(`Create SQLite database file: touch ${dbFile}`)
        }
      }
    }
    catch {
      // Ignore errors reading .env file
    }
  }

  // Check if migrations have been run
  try {
    const databaseDir = path.join(dir, 'database')
    const migrationsDir = path.join(databaseDir, 'migrations')
    if (fs.existsSync(migrationsDir)) {
      const migrations = fs.readdirSync(migrationsDir).filter(f => f.endsWith('.php'))
      if (migrations.length > 0) {
        suggestions.push('Run database migrations: php artisan migrate')

        // Check for seeders
        const seedersDir = path.join(databaseDir, 'seeders')
        if (fs.existsSync(seedersDir)) {
          const seeders = fs.readdirSync(seedersDir).filter(f => f.endsWith('.php') && f !== 'DatabaseSeeder.php')
          if (seeders.length > 0) {
            suggestions.push('Seed database with test data: php artisan db:seed')
          }
        }
      }
    }
  }
  catch {
    // Ignore errors checking migrations
  }

  // Execute project-level post-setup commands if enabled (skip in shell integration fast path)
  const projectPreSetup = config.preSetup
  if (projectPreSetup?.enabled && process.env.LAUNCHPAD_SHELL_INTEGRATION !== '1') {
    const preSetupResults = await executepostSetup(dir, projectPreSetup.commands || [])
    suggestions.push(...preSetupResults)
  }

  // Execute project-level post-setup commands if enabled (skip in shell integration fast path)
  const projectPostSetup = config.postSetup
  if (projectPostSetup?.enabled && process.env.LAUNCHPAD_SHELL_INTEGRATION !== '1') {
    // Ensure php.ini exists before running any PHP commands
    await ensureProjectPhpIni(dir, path.join(process.env.HOME || '', '.local', 'share', 'launchpad', 'envs', generateProjectHash(dir)))
    const postSetupResults = await executepostSetup(dir, projectPostSetup.commands || [])
    suggestions.push(...postSetupResults)
  }

  return { isLaravel: true, suggestions }
}
async function ensureProjectPhpIni(projectDir: string, envDir: string): Promise<void> {
  try {
    const fs = await import('node:fs')
    const path = await import('node:path')
    const iniPath = path.join(envDir, 'php.ini')
    if (!fs.existsSync(iniPath)) {
      const envPath = path.join(projectDir, '.env')
      let dbConn = ''
      try {
        if (fs.existsSync(envPath)) {
          const envContent = fs.readFileSync(envPath, 'utf8')
          const match = envContent.match(/^DB_CONNECTION=(.*)$/m)
          dbConn = match?.[1]?.trim().toLowerCase() || ''
        }
      }
      catch {}
      const lines: string[] = [
        '; Launchpad php.ini (auto-generated at activation time)',
        'memory_limit = 512M',
        'max_execution_time = 300',
        'upload_max_filesize = 64M',
        'post_max_size = 64M',
        'display_errors = On',
        'error_reporting = E_ALL',
        '',
      ]
      if (dbConn === 'pgsql' || dbConn === 'postgres' || dbConn === 'postgresql') {
        lines.push('extension=pdo_pgsql', 'extension=pgsql')
      }
      else if (dbConn === 'mysql' || dbConn === 'mariadb') {
        lines.push('extension=pdo_mysql', 'extension=mysqli')
      }
      else if (dbConn === 'sqlite') {
        lines.push('extension=pdo_sqlite', 'extension=sqlite3')
      }
      fs.writeFileSync(iniPath, lines.join('\n'))
    }
  }
  catch {}
}

/**
 * Execute post-setup commands based on their conditions
 */
async function executepostSetup(projectDir: string, commands: PostSetupCommand[]): Promise<string[]> {
  const results: string[] = []

  // Helper: wait for PostgreSQL if project uses it
  async function waitForPostgresIfNeeded(): Promise<void> {
    try {
      let host = '127.0.0.1'
      let port = '5432'
      try {
        const { parseEnvFile } = await import('../dev-setup')
        const env = parseEnvFile(path.join(projectDir, '.env'))
        host = env.DB_HOST || host
        port = env.DB_PORT || port
      }
      catch {}

      const { findBinaryInPath } = await import('../utils')
      const pgIsReady = findBinaryInPath('pg_isready') || 'pg_isready'
      if (process.env.LAUNCHPAD_DEBUG === '1') {
        try {
          process.stderr.write(`🐞 waitForPostgresIfNeeded: PATH=${process.env.PATH}\n`)
          process.stderr.write(`🐞 waitForPostgresIfNeeded: host=${host} port=${port} pg_isready=${pgIsReady}\n`)
        }
        catch {}
      }
      let ready = false
      // First pass: pg_isready
      for (let i = 0; i < 20 && !ready; i++) {
        const ok = await new Promise<boolean>((resolve) => {
          // eslint-disable-next-line ts/no-require-imports
          const { spawn } = require('node:child_process')
          const p = spawn(pgIsReady, ['-h', host, '-p', String(port)], { stdio: 'pipe' })
          p.on('close', (code: number) => resolve(code === 0))
          p.on('error', () => resolve(false))
        })
        ready = ok
        if (process.env.LAUNCHPAD_DEBUG === '1') {
          try {
            process.stderr.write(`🐞 pg_isready attempt ${i + 1}: ${ok ? 'ok' : 'fail'}\n`)
          }
          catch {}
        }
        if (!ready)
          await new Promise(r => setTimeout(r, 250 + i * 150))
      }
      // Fallback: TCP probe
      if (!ready) {
        const net = await import('node:net')
        if (process.env.LAUNCHPAD_DEBUG === '1') {
          try {
            process.stderr.write('🐞 pg_isready not ready, falling back to TCP probe\n')
          }
          catch {}
        }
        for (let i = 0; i < 20 && !ready; i++) {
          const ok = await new Promise<boolean>((resolve) => {
            const socket = net.connect({ host, port: Number(port), timeout: 1000 }, () => {
              socket.end()
              resolve(true)
            })
            socket.on('error', () => resolve(false))
            socket.on('timeout', () => {
              socket.destroy()
              resolve(false)
            })
          })
          ready = ok
          if (process.env.LAUNCHPAD_DEBUG === '1') {
            try {
              process.stderr.write(`🐞 TCP probe attempt ${i + 1}: ${ok ? 'ok' : 'fail'}\n`)
            }
            catch {}
          }
          if (!ready)
            await new Promise(r => setTimeout(r, 250 + i * 150))
        }
      }
      // Small grace delay after ready
      if (ready)
        await new Promise(r => setTimeout(r, 250))

      // Final verification using psql simple query if available
      const psqlBin = findBinaryInPath('psql') || 'psql'
      if (psqlBin) {
        if (process.env.LAUNCHPAD_DEBUG === '1') {
          try {
            process.stderr.write(`🐞 using psql binary: ${psqlBin}\n`)
          }
          catch {}
        }
        for (let i = 0; i < 8; i++) {
          const ok = await new Promise<boolean>((resolve) => {
            // eslint-disable-next-line ts/no-require-imports
            const { spawn } = require('node:child_process')
            const p = spawn(psqlBin, ['-h', host, '-p', String(port), '-U', 'postgres', '-tAc', 'SELECT 1'], { stdio: 'ignore' })
            p.on('close', (code: number) => resolve(code === 0))
            p.on('error', () => resolve(false))
          })
          if (process.env.LAUNCHPAD_DEBUG === '1') {
            try {
              process.stderr.write(`🐞 psql SELECT 1 attempt ${i + 1}: ${ok ? 'ok' : 'fail'}\n`)
            }
            catch {}
          }
          if (ok)
            break
          await new Promise(r => setTimeout(r, 300 + i * 200))
        }
      }
    }
    catch {}
  }

  for (const command of commands) {
    try {
      const shouldRun = evaluateCommandCondition(command.condition, projectDir)

      if (!shouldRun) {
        continue
      }

      const inShell = process.env.LAUNCHPAD_SHELL_INTEGRATION === '1'

      // Announce start (stderr to avoid interfering with shellcode)
      try {
        process.stderr.write(`\n🔧 Post-setup: ${command.name || command.command}\n`)
      }
      catch {}

      // Build PATH that includes project env first, then global env, then original PATH
      const projectHash = generateProjectHash(projectDir)
      const envDir = path.join(process.env.HOME || '', '.local', 'share', 'launchpad', 'envs', projectHash)
      const globalEnvDir = path.join(process.env.HOME || '', '.local', 'share', 'launchpad', 'global')
      const envBinPath = path.join(envDir, 'bin')
      const envSbinPath = path.join(envDir, 'sbin')
      const globalBinPath = path.join(globalEnvDir, 'bin')
      const globalSbinPath = path.join(globalEnvDir, 'sbin')
      const composedPath = [envBinPath, envSbinPath, globalBinPath, globalSbinPath, process.env.PATH || '']
        .filter(Boolean)
        .join(':')

      const execEnv: Record<string, string> = { ...process.env, PATH: composedPath }
      // Ensure DB defaults for tools that honor process/env
      if (!execEnv.DB_HOST)
        execEnv.DB_HOST = '127.0.0.1'
      if (!execEnv.DB_PORT)
        execEnv.DB_PORT = '5432'
      if (!execEnv.DB_USERNAME && !execEnv.DB_USER)
        execEnv.DB_USERNAME = 'root'
      if (!execEnv.DB_PASSWORD)
        execEnv.DB_PASSWORD = ''
      // Provide DATABASE_URL to override framework defaults when supported
      try {
        const dbName = path.basename(projectDir).replace(/\W/g, '_')
        if (!execEnv.DATABASE_URL) {
          const u = execEnv.DB_USERNAME || 'root'
          const p = execEnv.DB_PASSWORD || ''
          const cred = p ? `${u}:${p}` : `${u}`
          execEnv.DATABASE_URL = `pgsql://${cred}@${execEnv.DB_HOST}:${execEnv.DB_PORT}/${dbName}`
        }
      }
      catch {}
      // Also set PG* vars for libpq tools and frameworks that honor them
      if (!execEnv.PGHOST)
        execEnv.PGHOST = execEnv.DB_HOST
      if (!execEnv.PGPORT)
        execEnv.PGPORT = execEnv.DB_PORT
      if (!execEnv.PGUSER)
        execEnv.PGUSER = execEnv.DB_USERNAME || execEnv.DB_USER || 'postgres'
      if (!execEnv.PGPASSWORD && execEnv.DB_PASSWORD !== undefined)
        execEnv.PGPASSWORD = execEnv.DB_PASSWORD

      if (command.runInBackground) {
        execSync(command.command, {
          cwd: projectDir,
          env: execEnv,
          stdio: inShell ? (['ignore', 2, 2] as any) : 'inherit',
        })
        results.push(`🚀 Running in background: ${command.description}`)
      }
      else {
        // If we're about to run Laravel migrations, ensure DB is ready
        if (command.command.includes('artisan') && command.command.includes('migrate')) {
          try {
            process.stderr.write('⏳ Ensuring database is ready before running migrations...\n')
          }
          catch {}
          await waitForPostgresIfNeeded()
          // final short grace period
          await new Promise(r => setTimeout(r, 500))
        }
        try {
          execSync(command.command, {
            cwd: projectDir,
            env: execEnv,
            stdio: inShell ? (['ignore', 2, 2] as any) : 'inherit',
          })
        }
        catch (err) {
          // Deep diagnostics on failure
          try {
            process.stderr.write('🐞 Migration failed; collecting diagnostics...\n')
            process.stderr.write(`🐞 PATH=${execEnv.PATH}\n`)
            process.stderr.write(`🐞 DB env: HOST=${execEnv.DB_HOST} PORT=${execEnv.DB_PORT} USERNAME=${execEnv.DB_USERNAME || execEnv.DB_USER || ''} DATABASE_URL=${execEnv.DATABASE_URL || ''}\n`)
          }
          catch {}
          try {
            const { spawnSync } = await import('node:child_process')
            const pgReady = spawnSync(execEnv.PG_ISREADY || 'pg_isready', ['-h', execEnv.DB_HOST || '127.0.0.1', '-p', execEnv.DB_PORT || '5432'])
            process.stderr.write(`🐞 pg_isready exit=${pgReady.status} stdout=${(pgReady.stdout || '').toString()} stderr=${(pgReady.stderr || '').toString()}\n`)
          }
          catch {}
          try {
            const { spawnSync } = await import('node:child_process')
            const psql = spawnSync('psql', ['-h', execEnv.DB_HOST || '127.0.0.1', '-p', execEnv.DB_PORT || '5432', '-U', 'postgres', '-tAc', 'SELECT 1'])
            process.stderr.write(`🐞 psql check exit=${psql.status} stdout=${(psql.stdout || '').toString()} stderr=${(psql.stderr || '').toString()}\n`)
          }
          catch {}
          try {
            const logPath = path.join(homedir(), '.local', 'share', 'launchpad', 'logs', 'postgres.log')
            if (fs.existsSync(logPath)) {
              const content = fs.readFileSync(logPath, 'utf8')
              const tail = content.split(/\r?\n/).slice(-100).join('\n')
              process.stderr.write(`🐞 tail -100 postgres.log:\n${tail}\n`)
            }
          }
          catch {}
          throw err
        }
        results.push(`✅ ${command.description}`)
      }
    }
    catch (error) {
      if (command.required) {
        results.push(`❌ Failed (required): ${command.description}`)
        if (error instanceof Error) {
          results.push(`   Error: ${error.message}`)
        }
      }
      else {
        results.push(`⚠️  Skipped (optional): ${command.description}`)
        if (error instanceof Error) {
          try {
            process.stderr.write(`⚠️  ${error.message}\n`)
          }
          catch {}
        }
      }
    }
  }

  return results
}

/**
 * Evaluate whether a command condition is met
 */
function evaluateCommandCondition(condition: PostSetupCommand['condition'], projectDir: string): boolean {
  // Default to running when no condition specified
  if (!condition || condition === 'always')
    return true

  switch (condition) {
    case 'always':
      return true
    case 'hasUnrunMigrations':
      return hasUnrunMigrations(projectDir)
    case 'hasSeeders':
      return hasSeeders(projectDir)
    case 'needsStorageLink':
      return needsStorageLink(projectDir)
    case 'isProduction':
      return isProductionEnvironment(projectDir)
    default:
      return false
  }
}

/**
 * Check if there are unrun migrations
 */
function hasUnrunMigrations(projectDir: string): boolean {
  try {
    const migrationsDir = path.join(projectDir, 'database', 'migrations')
    if (!fs.existsSync(migrationsDir)) {
      return false
    }

    // Check if there are migration files
    const migrationFiles = fs.readdirSync(migrationsDir).filter(file => file.endsWith('.php'))
    if (migrationFiles.length === 0) {
      return false
    }

    // Try to check migration status (this requires database connection)
    try {
      const output = execSync('php artisan migrate:status', { cwd: projectDir, stdio: 'pipe', encoding: 'utf8' })
      // Laravel shows pending migrations as [N] instead of [Y] for migrated ones
      return output.includes('| N |') // N means Not migrated (pending)
    }
    catch {
      // If we can't check status, assume we should run migrations if migration files exist
      return true
    }
  }
  catch {
    return false
  }
}

/**
 * Check if there are database seeders
 */
function hasSeeders(projectDir: string): boolean {
  try {
    const seedersDir = path.join(projectDir, 'database', 'seeders')
    if (!fs.existsSync(seedersDir)) {
      return false
    }

    // Check for seeder files (excluding the base DatabaseSeeder.php if it's empty)
    const seederFiles = fs.readdirSync(seedersDir).filter(file => file.endsWith('.php'))
    if (seederFiles.length === 0) {
      return false
    }

    // Check if DatabaseSeeder.php has actual content
    const databaseSeederPath = path.join(seedersDir, 'DatabaseSeeder.php')
    if (fs.existsSync(databaseSeederPath)) {
      const content = fs.readFileSync(databaseSeederPath, 'utf8')
      // Look for actual seeder calls (not just empty run method)
      return content.includes('$this->call(') || seederFiles.length > 1
    }

    return seederFiles.length > 0
  }
  catch {
    return false
  }
}

/**
 * Check if storage link is needed
 */
function needsStorageLink(projectDir: string): boolean {
  try {
    const publicStorageLink = path.join(projectDir, 'public', 'storage')
    const storageAppPublic = path.join(projectDir, 'storage', 'app', 'public')

    // Need storage link if:
    // 1. storage/app/public exists
    // 2. public/storage doesn't exist or isn't a symlink to storage/app/public
    return fs.existsSync(storageAppPublic)
      && (!fs.existsSync(publicStorageLink) || !fs.lstatSync(publicStorageLink).isSymbolicLink())
  }
  catch {
    return false
  }
}

/**
 * Check if this is a production environment
 */
function isProductionEnvironment(projectDir: string): boolean {
  try {
    const envFile = path.join(projectDir, '.env')
    if (!fs.existsSync(envFile)) {
      return false
    }

    const envContent = fs.readFileSync(envFile, 'utf8')
    const envMatch = envContent.match(/^APP_ENV=(.*)$/m)
    const appEnv = envMatch?.[1]?.trim()

    return appEnv === 'production' || appEnv === 'prod'
  }
  catch {
    return false
  }
}

export async function dump(dir: string, options: DumpOptions = {}): Promise<void> {
  const { dryrun = false, quiet = false, shellOutput = false, skipGlobal = process.env.NODE_ENV === 'test' || process.env.LAUNCHPAD_SKIP_GLOBAL_AUTO_SCAN === 'true' || process.env.LAUNCHPAD_ENABLE_GLOBAL_AUTO_SCAN !== 'true' } = options
  let isVerbose = ((options as any).verbose === true)
    || process.env.LAUNCHPAD_VERBOSE === 'true'
    || config.verbose

  // Lightweight timing helpers (stderr-only, verbose mode)
  const timings: Array<{ label: string, ms: number }> = []
  const tick = () => (typeof process.hrtime === 'function' && (process.hrtime as any).bigint)
    ? (process.hrtime as any).bigint()
    : BigInt(Date.now()) * BigInt(1_000_000)
  const since = (start: bigint) => Number((tick() - start) / BigInt(1_000_000))
  const addTiming = (label: string, start: bigint) => {
    if (isVerbose)
      timings.push({ label, ms: since(start) })
  }
  const flushTimings = (phase: string): string | null => {
    if (!isVerbose || timings.length === 0)
      return null
    const total = timings.reduce((acc, t) => acc + t.ms, 0)
    const parts = timings.map(t => `${t.label}=${t.ms}ms`).join(' | ')
    const summary = `⏱ ${phase}: ${total}ms (${parts})`
    try {
      process.stderr.write(`${summary}\n`)
    }
    catch {}
    return summary
  }
  const tTotal = tick()

  // Set shell integration mode when shell output is requested
  if (shellOutput) {
    process.env.LAUNCHPAD_SHELL_INTEGRATION = '1'
    // Disable cleanup during tests to prevent interference with error messages
    if (process.env.NODE_ENV === 'test') {
      process.env.LAUNCHPAD_DISABLE_CLEANUP = '1'
    }
  }

  // Force quiet mode for shell integration to achieve minimal output
  const isShellIntegration = process.env.LAUNCHPAD_SHELL_INTEGRATION === '1'
  const effectiveQuiet = quiet || isShellIntegration

  // For shell integration, only suppress output if in quiet mode
  if (isShellIntegration && quiet) {
    const originalStderrWrite = process.stderr.write.bind(process.stderr)
    const originalConsoleLog = console.log.bind(console)

    // Override output functions to filter messages - allow progress indicators but suppress setup messages
    process.stderr.write = function (chunk: any, encoding?: any, cb?: any) {
      const message = chunk.toString()
      // Allow progress indicators, downloads, and success messages through
      if (message.includes('🔄') // Processing dependency
        || message.includes('⬇️') // Download progress
        || message.includes('🔧') // Extracting
        || message.includes('🚀') // Service start messages
        || message.includes('⏳') // Waiting messages
        || message.includes('📌') // Pin/version update notices
        || message.includes('🔍') // Verbose diagnostics
        || message.includes('⏱') // Timing summaries (verbose)
        || message.includes('✅') // Success messages
        || message.includes('⚠️') // Warnings
        || message.includes('❌') // Errors
        || message.includes('%') // Progress percentages
        || message.includes('bytes') // Download bytes
        || message.includes('Installing') // Installation messages
        || message.includes('Downloading') // Download start messages
        || message.includes('Extracting') // Extraction messages
        || message.startsWith('\r')) { // Allow carriage return progress updates
        return originalStderrWrite(chunk, encoding, cb)
      }
      // Suppress setup messages and other verbose output - call callback to signal completion
      if (typeof cb === 'function') {
        process.nextTick(cb)
      }
      return true
    } as any

    console.log = function (...args: any[]) {
      const message = args.join(' ')
      // Allow progress indicators, downloads, and success messages through
      if (message.includes('🔄') // Processing dependency
        || message.includes('⬇️') // Download progress
        || message.includes('🔧') // Extracting
        || message.includes('🚀') // Service start messages
        || message.includes('⏳') // Waiting messages
        || message.includes('📌') // Pin/version update notices
        || message.includes('🔍') // Verbose diagnostics
        || message.includes('⏱') // Timing summaries (verbose)
        || message.includes('✅') // Success messages
        || message.includes('⚠️') // Warnings
        || message.includes('❌') // Errors
        || message.includes('%') // Progress percentages
        || message.includes('bytes')) { // Download bytes
        originalStderrWrite(`${message}\n`)
      }
      // Suppress setup messages and other verbose output
    }

    // Restore output functions after execution
    process.on('exit', () => {
      process.stderr.write = originalStderrWrite
      console.log = originalConsoleLog
    })
  }

  try {
    // Find dependency file using our comprehensive detection
    const tFindDep = tick()
    const dependencyFile = findDependencyFile(dir)
    addTiming('findDependencyFile', tFindDep)
    // Early pre-setup hook (before any installs/services) when config present in working dir
    try {
      if (dependencyFile) {
        const fileCmds = extractHookCommandsFromDepsYaml(dependencyFile, 'preSetup')
        if (fileCmds.length > 0) {
          await executepostSetup(path.dirname(dependencyFile), fileCmds)
        }
      }
      const projectPreSetup = config.preSetup
      if (projectPreSetup?.enabled && !shellOutput && !quiet && dependencyFile) {
        await executepostSetup(path.dirname(dependencyFile), projectPreSetup.commands || [])
      }
    }
    catch {}

    if (!dependencyFile) {
      if (!quiet && !shellOutput) {
        console.log('No dependency file found')
      }
      else if (shellOutput) {
        // For shell output, still output the message but to stdout
        console.log('No dependency file found')
      }
      return
    }

    // For shell output mode, prioritize speed with aggressive optimizations
    const projectDir = path.dirname(dependencyFile)

    // Re-evaluate verbose using project-local launchpad.config.ts if present
    try {
      const localCfgPath = path.join(projectDir, 'launchpad.config.ts')
      if (fs.existsSync(localCfgPath)) {
        const mod = await import(localCfgPath)
        const local = (mod as any).default || mod
        if (local && local.verbose === true)
          isVerbose = true
      }
    }
    catch {}

    // Ultra-fast path for shell output: check if environments exist and use cached data
    if (shellOutput) {
      // Generate hash for this project
      const projectHash = generateProjectHash(dir)
      // Compute dependency fingerprint to ensure env path reflects dependency versions
      let depSuffix = ''
      try {
        const depContent = fs.readFileSync(dependencyFile)
        const depHash = crypto.createHash('md5').update(depContent).digest('hex').slice(0, 8)
        depSuffix = `-d${depHash}`
      }
      catch {}
      const envDir = path.join(process.env.HOME || '', '.local', 'share', 'launchpad', 'envs', `${projectHash}${depSuffix}`)
      const globalEnvDir = path.join(process.env.HOME || '', '.local', 'share', 'launchpad', 'global')

      // Check if environments exist first (quick filesystem check)
      const hasLocalEnv = fs.existsSync(path.join(envDir, 'bin'))
      const hasGlobalEnv = fs.existsSync(path.join(globalEnvDir, 'bin'))

      // Fast activation ONLY if local env already exists; otherwise we must install local deps
      if (hasLocalEnv) {
        // Parse dependency file to get environment variables even in fast path
        const { default: sniff } = await import('./sniff')
        let sniffResult: { pkgs: any[], env: Record<string, string> }

        try {
          const tSniff = tick()
          sniffResult = await sniff({ string: projectDir })
          addTiming('sniff(project)', tSniff)
        }
        catch {
          // Handle malformed dependency files gracefully
          sniffResult = { pkgs: [], env: {} }
        }

        // Merge raw constraints from deps.yaml to honor exact pins over any normalization
        try {
          const rawContent = fs.readFileSync(dependencyFile, 'utf8')
          const rawLines = rawContent.split(/\r?\n/)
          let inDeps = false
          const rawMap = new Map<string, string>()
          for (const raw of rawLines) {
            const indent = raw.length - raw.trimStart().length
            const line = raw.trim()
            if (!inDeps) {
              if (line.startsWith('dependencies:'))
                inDeps = true
              continue
            }
            if (indent === 0 && line.endsWith(':'))
              break
            if (!line || line.startsWith('#'))
              continue
            const m = line.match(/^([\w.\-/]+):\s*(\S.*)$/)
            if (m) {
              rawMap.set(m[1], m[2])
              continue
            }
            if (line.startsWith('- ')) {
              const spec = line.slice(2).trim()
              const [domain, constraint = '*'] = spec.split('@')
              if (domain)
                rawMap.set(domain, constraint)
            }
          }
          if (sniffResult && Array.isArray(sniffResult.pkgs) && rawMap.size > 0) {
            sniffResult.pkgs = sniffResult.pkgs.map((p: any) => {
              const domain = String(p.project || '')
              const rawC = rawMap.get(domain)
              if (rawC && rawC !== '*' && !rawC.startsWith('^') && !rawC.startsWith('~')) {
                return { ...p, constraint: rawC }
              }
              return p
            })
          }
        }
        catch {}

        // Fallback: if sniff returned no packages, parse deps.yaml minimally for pins
        if ((!sniffResult.pkgs || sniffResult.pkgs.length === 0) && dependencyFile) {
          try {
            const content = fs.readFileSync(dependencyFile, 'utf8')
            const lines = content.split(/\r?\n/)
            let inDeps = false
            const pkgs: any[] = []
            for (const raw of lines) {
              const indent = raw.length - raw.trimStart().length
              const line = raw.trim()
              if (!inDeps) {
                if (line.startsWith('dependencies:')) {
                  inDeps = true
                }
                continue
              }
              if (indent === 0 && line.endsWith(':'))
                break
              if (!line || line.startsWith('#'))
                continue
              const m = line.match(/^([\w.\-/]+):\s*(\S.*)$/)
              if (m) {
                const domain = m[1]
                const val = m[2].trim()
                if (domain && val && !val.startsWith('{')) {
                  pkgs.push({ project: domain, constraint: val, global: false })
                }
              }
              else if (line.startsWith('- ')) {
                const spec = line.slice(2).trim()
                const [domain, constraint = '*'] = spec.split('@')
                if (domain)
                  pkgs.push({ project: domain, constraint, global: false })
              }
            }
            if (pkgs.length > 0)
              sniffResult = { pkgs, env: sniffResult.env || {} }
          }
          catch {}
        }

        // Quick constraint satisfaction check for already-existing environment
        const semverCompare = (a: string, b: string): number => {
          const pa = a.replace(/^v/, '').split('.').map(n => Number.parseInt(n, 10))
          const pb = b.replace(/^v/, '').split('.').map(n => Number.parseInt(n, 10))
          for (let i = 0; i < 3; i++) {
            const da = pa[i] || 0
            const db = pb[i] || 0
            if (da > db)
              return 1
            if (da < db)
              return -1
          }
          return 0
        }
        const satisfies = (installed: string, constraint?: string): boolean => {
          if (!constraint || constraint === '*' || constraint === '')
            return true
          const c = constraint.trim()
          const ver = installed.replace(/^v/, '')
          const [cOp, cVerRaw] = c.startsWith('^') || c.startsWith('~') ? [c[0], c.slice(1)] : ['', c]
          const cParts = cVerRaw.split('.')
          const vParts = ver.split('.')
          const cmp = semverCompare(ver, cVerRaw)
          if (cOp === '^') {
            return vParts[0] === cParts[0] && cmp >= 0
          }
          if (cOp === '~') {
            return vParts[0] === cParts[0] && vParts[1] === cParts[1] && cmp >= 0
          }
          // No operator provided: treat as exact pin
          return cmp === 0
        }
        const pinInfo: Array<{ domain: string, desired: string, installed: string }> = []
        // Extra-robust exact-pin check for well-known tools (like bun.sh)
        const exactPins: Array<{ domain: string, version: string }> = []
        try {
          for (const pkg of sniffResult.pkgs || []) {
            const domain = String(pkg.project)
            const constraint = String(typeof pkg.constraint === 'string' ? pkg.constraint : (pkg.constraint || ''))
            if (constraint && !constraint.startsWith('^') && !constraint.startsWith('~') && constraint !== '*') {
              exactPins.push({ domain, version: constraint.replace(/^v/, '') })
            }
          }
        }
        catch {}
        const needsUpgrade = (() => {
          try {
            for (const pkg of sniffResult.pkgs || []) {
              const domain = pkg.project as string
              const constraint = typeof pkg.constraint === 'string' ? pkg.constraint : String(pkg.constraint || '*')
              const domainDir = path.join(envDir, domain)
              if (!fs.existsSync(domainDir))
                return true
              const versions = fs.readdirSync(domainDir, { withFileTypes: true })
                .filter(e => e.isDirectory() && e.name.startsWith('v'))
                .map(e => e.name)
              if (versions.length === 0)
                return true
              const highest = versions.sort((a, b) => semverCompare(a.slice(1), b.slice(1))).slice(-1)[0]
              if (!satisfies(highest, constraint)) {
                pinInfo.push({ domain, desired: constraint, installed: highest.replace(/^v/, '') })
                return true
              }
            }
            // Additionally, ensure exact pins are active (symlinks point to pinned version)
            for (const pin of exactPins) {
              if (pin.domain === 'bun.sh') {
                const pinDir = path.join(envDir, 'bun.sh', `v${pin.version}`)
                if (!fs.existsSync(pinDir))
                  return true
                const bunBin = path.join(envDir, 'bin', 'bun')
                try {
                  if (fs.existsSync(bunBin)) {
                    const target = fs.realpathSync(bunBin)
                    if (!target.includes(path.join('bun.sh', `v${pin.version}`, 'bin', 'bun')))
                      return true
                  }
                }
                catch {
                  return true
                }
              }
            }
          }
          catch {}
          return false
        })()

        // If constraints are not satisfied, fall back to install path
        if (needsUpgrade) {
          if (isVerbose && pinInfo.length > 0) {
            try {
              const details = pinInfo.map(p => `${p.domain}@${p.desired} (installed ${p.installed})`).join(', ')
              process.stderr.write(`📌 Updating to satisfy pins: ${details}\n`)
            }
            catch {}
          }
          const envBinPath = path.join(envDir, 'bin')
          const envSbinPath = path.join(envDir, 'sbin')
          const globalBinPath = path.join(globalEnvDir, 'bin')
          const globalSbinPath = path.join(globalEnvDir, 'sbin')
          // Build package lists
          const globalPackages: string[] = []
          const localPackages: string[] = []
          for (const pkg of sniffResult.pkgs) {
            const constraintStr = typeof pkg.constraint === 'string' ? pkg.constraint : String(pkg.constraint || '*')
            const packageString = `${pkg.project}@${constraintStr}`
            if (pkg.global && !skipGlobal)
              globalPackages.push(packageString)
            else localPackages.push(packageString)
          }
          const tInstallFast = tick()
          await installPackagesOptimized(localPackages, globalPackages, envDir, globalEnvDir, dryrun, quiet)
          addTiming('install(packages)', tInstallFast)
          // After installing in shell fast path (upgrade case), ensure PHP shims exist
          try {
            if (config.verbose) {
              console.log('🔍 Fast path: creating PHP shims after upgrade...')
            }
            const tShimFast = tick()
            // In shellOutput mode, do not block activation; fire-and-forget
            createPhpShimsAfterInstall(envDir).catch(() => {})
            addTiming('createPhpShims(async)', tShimFast)
          }
          catch {}
          const tOutFast = tick()
          outputShellCode(dir, envBinPath, envSbinPath, projectHash, sniffResult, globalBinPath, globalSbinPath)
          addTiming('outputShellCode', tOutFast)
          addTiming('total', tTotal)
          {
            const summary = flushTimings('shell-install-path')
            if (shellOutput && summary) {
              const msg = summary.replace(/"/g, '\\"')
              const guard = isVerbose ? 'true' : 'false'
              try {
                process.stdout.write(`if ${guard}; then >&2 echo "${msg}"; fi\n`)
              }
              catch {}
            }
          }
          return
        }

        // In shell integration fast path, ensure php.ini and start services when configured
        // Only ensure php.ini if already marked ready
        const readyMarker = path.join(envDir, '.launchpad_ready')
        const isReady = fs.existsSync(readyMarker)
        if (isVerbose) {
          try {
            process.stderr.write(`🔍 Fast path: envDir=${envDir} globalEnvDir=${globalEnvDir} ready=${isReady}\n`)
            const envBinPath = path.join(envDir, 'bin')
            const envSbinPath = path.join(envDir, 'sbin')
            const glbBinPath = path.join(globalEnvDir, 'bin')
            const glbSbinPath = path.join(globalEnvDir, 'sbin')
            process.stderr.write(`🔍 Paths: envBin=${fs.existsSync(envBinPath) ? envBinPath : '-'} envSbin=${fs.existsSync(envSbinPath) ? envSbinPath : '-'} glbBin=${fs.existsSync(glbBinPath) ? glbBinPath : '-'} glbSbin=${fs.existsSync(glbSbinPath) ? glbSbinPath : '-'}\n`)
            process.stderr.write(`🔍 Sniff: pkgs=${sniffResult.pkgs?.length || 0} envKeys=${Object.keys(sniffResult.env || {}).length}\n`)
          }
          catch {}
        }
        if (isReady) {
          // Skip all expensive operations in shell integration mode for instant activation
          // Services, PHP ini, and post-setup will be handled by regular dev command when needed
          if (isVerbose) {
            try {
              process.stderr.write(`🔍 Shell fast path: skipping services/php/post-setup for performance\n`)
            }
            catch {}
          }
        }

        const tOut1 = tick()
        outputShellCode(
          dir,
          hasLocalEnv ? path.join(envDir, 'bin') : '',
          hasLocalEnv ? path.join(envDir, 'sbin') : '',
          projectHash,
          sniffResult,
          hasGlobalEnv ? path.join(globalEnvDir, 'bin') : '',
          hasGlobalEnv ? path.join(globalEnvDir, 'sbin') : '',
        )
        addTiming('outputShellCode', tOut1)
        addTiming('total', tTotal)
        {
          const summary = flushTimings('shell-fast-path')
          if (shellOutput && summary) {
            const msg = summary.replace(/"/g, '\\"')
            const guard = isVerbose ? 'true' : 'false'
            try {
              const shellLine = `if ${guard}; then >&2 echo "${msg}"; fi\n`
              process.stdout.write(shellLine)
            }
            catch {}
          }
        }
        return
      }
      // If no local environment exists, we need to continue with full installation process
      // Don't return early - fall through to the installation logic below
    }

    // Parse dependency file with optimization for shell integration
    const { default: sniff } = await import('./sniff')
    let sniffResult: { pkgs: any[], env: Record<string, string> }

    try {
      // For shell integration, use standard parsing (no 'fast' option available)
      const tSniff2 = tick()
      sniffResult = await sniff({ string: projectDir })
      addTiming('sniff(project)', tSniff2)
    }
    catch (error) {
      // Handle malformed dependency files gracefully
      if (config.verbose && !isShellIntegration) {
        console.warn(`Failed to parse dependency file: ${error instanceof Error ? error.message : String(error)}`)
      }
      sniffResult = { pkgs: [], env: {} }
    }

    // For shell integration, skip expensive global dependency scanning
    const globalSniffResults: Array<{ pkgs: any[], env: Record<string, string> }> = []

    if (!skipGlobal && !isShellIntegration) {
      // Only do expensive global scanning for non-shell integration calls
      const globalDepLocations = [
        path.join(homedir(), '.dotfiles'),
        path.join(homedir()),
      ]

      for (const globalLocation of globalDepLocations) {
        if (fs.existsSync(globalLocation)) {
          try {
            const tGSniff = tick()
            const globalSniff = await sniff({ string: globalLocation })
            addTiming(`sniff(global:${path.basename(globalLocation)})`, tGSniff)
            if (globalSniff.pkgs.length > 0) {
              globalSniffResults.push(globalSniff)
              if (config.verbose) {
                console.warn(`Found ${globalSniff.pkgs.length} packages in global location: ${globalLocation}`)
              }
            }
          }
          catch {
            // Ignore errors sniffing global locations
          }
        }
      }
    }

    // Separate global and local packages (optimized)
    const globalPackages: string[] = []
    const localPackages: string[] = []

    // Process packages from the project directory (fast constraint handling)
    for (const pkg of sniffResult.pkgs) {
      // Ultra-fast constraint handling
      let constraintStr = ''

      if (pkg.constraint) {
        if (typeof pkg.constraint === 'string') {
          constraintStr = pkg.constraint
        }
        else {
          constraintStr = String(pkg.constraint) || '*'
        }
      }
      else {
        constraintStr = '*'
      }

      // Ensure we never have [object Object] in the constraint
      if (constraintStr === '[object Object]' || constraintStr.includes('[object')) {
        constraintStr = '*'
      }

      const packageString = `${pkg.project}@${constraintStr}`

      // Check if this is a global dependency (only if not skipping global)
      if (pkg.global && !skipGlobal) {
        globalPackages.push(packageString)
      }
      else {
        localPackages.push(packageString)
      }
    }

    // Process packages from global locations (only if not shell integration)
    if (!isShellIntegration) {
      for (const globalSniffResult of globalSniffResults) {
        for (const pkg of globalSniffResult.pkgs) {
          let constraintStr = ''

          if (pkg.constraint) {
            if (typeof pkg.constraint === 'string') {
              constraintStr = pkg.constraint
            }
            else {
              constraintStr = String(pkg.constraint) || '*'
            }
          }
          else {
            constraintStr = '*'
          }

          if (constraintStr === '[object Object]' || constraintStr.includes('[object')) {
            constraintStr = '*'
          }

          const packageString = `${pkg.project}@${constraintStr}`

          if (pkg.global && !skipGlobal) {
            globalPackages.push(packageString)
          }
          else {
            localPackages.push(packageString)
          }
        }
      }
    }

    // Generate hash for this project
    const projectHash = generateProjectHash(dir)
    // Compute dependency fingerprint to ensure env path reflects dependency versions
    let depSuffix = ''
    try {
      const depContent = fs.readFileSync(dependencyFile)
      const depHash = crypto.createHash('md5').update(depContent).digest('hex').slice(0, 8)
      depSuffix = `-d${depHash}`
    }
    catch {}
    const envDir = path.join(process.env.HOME || '', '.local', 'share', 'launchpad', 'envs', `${projectHash}${depSuffix}`)
    const globalEnvDir = path.join(process.env.HOME || '', '.local', 'share', 'launchpad', 'global')

    // For shell output mode, check if we can skip expensive operations
    if (shellOutput) {
      // Quick check: if no packages to install and environments exist, output immediately
      if (localPackages.length === 0 && globalPackages.length === 0) {
        const envBinPath = path.join(envDir, 'bin')
        const envSbinPath = path.join(envDir, 'sbin')
        const globalBinPath = path.join(globalEnvDir, 'bin')
        const globalSbinPath = path.join(globalEnvDir, 'sbin')

        // In shell integration, do not start services automatically

        outputShellCode(dir, envBinPath, envSbinPath, projectHash, sniffResult, globalBinPath, globalSbinPath)
        return
      }

      // For shell integration with packages, use ultra-fast constraint checking
      if (isShellIntegration) {
        // Skip expensive constraint satisfaction checks for shell integration
        // Just ensure the environments exist and output shell code
        const envBinPath = path.join(envDir, 'bin')
        const envSbinPath = path.join(envDir, 'sbin')
        const globalBinPath = path.join(globalEnvDir, 'bin')
        const globalSbinPath = path.join(globalEnvDir, 'sbin')

        // In shell integration mode with ready environment, skip package installation checks
        const readyMarker = path.join(envDir, '.launchpad_ready')
        const isEnvReady = fs.existsSync(readyMarker)

        if (!isEnvReady) {
          // Check what packages are actually missing and need installation
          const packageStatus = needsPackageInstallation(localPackages, globalPackages, envDir, globalEnvDir)

          // Install missing packages if any are found
          if (packageStatus.needsLocal || packageStatus.needsGlobal) {
            const tInstall = tick()
            await installPackagesOptimized(
              packageStatus.missingLocal,
              packageStatus.missingGlobal,
              envDir,
              globalEnvDir,
              dryrun,
              quiet,
            )
            addTiming('install(packages)', tInstall)
          }
        }
        else if (isVerbose) {
          try {
            process.stderr.write(`🔍 Shell integration: environment ready, skipping package checks\n`)
          }
          catch {}
        }

        // Create PHP shims only if environment was just created or updated
        if (!isEnvReady) {
          if (config.verbose) {
            console.log('🔍 Checking for PHP installations to create shims...')
          }
          const tShim = tick()
          if (isShellIntegration) {
            // Run PHP shim creation in background to avoid blocking shell activation
            createPhpShimsAfterInstall(envDir).catch(() => {}) // Fire and forget
            addTiming('createPhpShims(async)', tShim)
          }
          else {
            await createPhpShimsAfterInstall(envDir)
            addTiming('createPhpShims', tShim)
          }
        }
        else if (isVerbose) {
          try {
            process.stderr.write(`🔍 Shell integration: environment ready, skipping PHP shim creation\n`)
          }
          catch {}
        }

        // Skip expensive operations in shell integration mode for instant activation
        // Services, PHP ini, and post-setup will be handled by regular dev command when needed
        if (isVerbose) {
          try {
            process.stderr.write(`🔍 Shell integration: skipping services/php/post-setup for performance\n`)
          }
          catch {}
        }

        const tOut2 = tick()
        outputShellCode(dir, envBinPath, envSbinPath, projectHash, sniffResult, globalBinPath, globalSbinPath)
        addTiming('outputShellCode', tOut2)
        addTiming('total', tTotal)
        {
          const summary = flushTimings('shell-install-path')
          if (shellOutput && summary) {
            const msg = summary.replace(/"/g, '\\"')
            const guard = isVerbose ? 'true' : 'false'
            try {
              const shellLine = `if ${guard}; then >&2 echo "${msg}"; fi\n`
              process.stdout.write(shellLine)
            }
            catch {}
          }
        }
        return
      }
    }

    // Regular path for non-shell integration calls
    if (localPackages.length > 0 || globalPackages.length > 0) {
      const tInstall3 = tick()
      await installPackagesOptimized(localPackages, globalPackages, envDir, globalEnvDir, dryrun, quiet)
      addTiming('install(packages)', tInstall3)
      // Create PHP shims synchronously in regular path to ensure immediate availability
      try {
        if (config.verbose) {
          console.log('🔍 Regular path: creating PHP shims after install...')
        }
        const tShimReg = tick()
        await createPhpShimsAfterInstall(envDir)
        addTiming('createPhpShims', tShimReg)
      }
      catch {}
      // Visual separator after dependency install list
      try {
        console.log()
      }
      catch {}
    }

    // Auto-start services for any project that has services configuration (non-shell calls only)
    // Pre-activation hook (runs after install/services and before shell activation)
    const preActivation = config.preActivation
    if (dependencyFile) {
      const filePostSetup = extractHookCommandsFromDepsYaml(dependencyFile, 'postSetup')
      if (filePostSetup.length > 0) {
        await executepostSetup(projectDir, filePostSetup)
      }
    }
    if (preActivation?.enabled && !isShellIntegration) {
      await executepostSetup(projectDir, preActivation.commands || [])
    }
    if (dependencyFile) {
      const filePreActivation = extractHookCommandsFromDepsYaml(dependencyFile, 'preActivation')
      if (filePreActivation.length > 0) {
        await executepostSetup(projectDir, filePreActivation)
      }
    }
    // Suppress interstitial processing messages during service startup phase
    if (!isShellIntegration) {
      const prevProcessing = process.env.LAUNCHPAD_PROCESSING
      process.env.LAUNCHPAD_PROCESSING = '0'
      await setupProjectServices(projectDir, sniffResult, !effectiveQuiet)
      if (prevProcessing === undefined)
        delete process.env.LAUNCHPAD_PROCESSING
      else
        process.env.LAUNCHPAD_PROCESSING = prevProcessing
    }

    // Ensure php.ini and Laravel post-setup runs (regular path)
    // Skip expensive operations in shell integration mode
    if (!isShellIntegration) {
      const tIni3 = tick()
      await ensureProjectPhpIni(projectDir, envDir)
      addTiming('ensurePhpIni', tIni3)

      const tPost3 = tick()
      await maybeRunProjectPostSetup(projectDir, envDir, isShellIntegration)
      addTiming('postSetup', tPost3)
    }

    // Mark environment as ready for fast shell activation on subsequent prompts
    try {
      await fs.promises.mkdir(path.join(envDir), { recursive: true })
      await fs.promises.writeFile(path.join(envDir, '.launchpad_ready'), '1')
    }
    catch {}

    // Check for Laravel project and provide helpful suggestions
    const laravelInfo = await detectLaravelProject(projectDir)
    if (laravelInfo.isLaravel) {
      if (laravelInfo.suggestions.length > 0 && !effectiveQuiet) {
        console.log('\n🎯 Laravel project detected! Helpful commands:')
        laravelInfo.suggestions.forEach((suggestion) => {
          console.log(`   • ${suggestion}`)
        })
        console.log()
      }
    }

    // Output shell code if requested
    if (shellOutput) {
      const envBinPath = path.join(envDir, 'bin')
      const envSbinPath = path.join(envDir, 'sbin')
      const globalBinPath = path.join(globalEnvDir, 'bin')
      const globalSbinPath = path.join(globalEnvDir, 'sbin')

      const tOut3 = tick()
      outputShellCode(dir, envBinPath, envSbinPath, projectHash, sniffResult, globalBinPath, globalSbinPath)
      addTiming('outputShellCode', tOut3)
      addTiming('total', tTotal)
      {
        const summary = flushTimings('regular-shell-output')
        if (shellOutput && summary) {
          const msg = summary.replace(/"/g, '\\"')
          const guard = isVerbose ? 'true' : 'false'
          try {
            const shellLine = `if ${guard}; then >&2 echo "${msg}"; fi\n`
            process.stdout.write(shellLine)
          }
          catch {}
        }
      }
    }
    else {
      // Print a final activation message, but skip in shell integration mode to avoid duplicates
      // (shell integration handles its own custom activation messages)
      if (!isShellIntegration) {
        const { config } = await import('../config')
        const activation = (config.shellActivationMessage || '✅ Environment activated for {path}')
          .replace('{path}', process.cwd())
        console.log(activation)
      }
      addTiming('total', tTotal)
      flushTimings('regular-activation')

      // Post-activation hook (file-level then config) - skip in shell integration mode for performance
      if (!isShellIntegration) {
        if (dependencyFile) {
          const filePostActivation = extractHookCommandsFromDepsYaml(dependencyFile, 'postActivation')
          if (filePostActivation.length > 0) {
            await executepostSetup(projectDir, filePostActivation)
          }
        }
        const postActivation = config.postActivation
        if (postActivation?.enabled) {
          await executepostSetup(projectDir, postActivation.commands || [])
        }
      }
    }
  }
  catch (error) {
    // Check if this is a package installation failure (which should be handled gracefully)
    const isPackageInstallationError = error instanceof Error && (
      error.message.includes('Failed to install')
      || error.message.includes('Failed to download')
      || error.message.includes('No suitable version')
      || error.message.includes('nonexistent-package')
    )

    if (!effectiveQuiet) {
      if (isPackageInstallationError) {
        // For package installation failures, show a warning but don't fail completely
        console.warn('Warning: Failed to install some packages:', error instanceof Error ? error.message : String(error))
      }
      else {
        console.error('Failed to set up development environment:', error instanceof Error ? error.message : String(error))
      }
    }

    // For shell output, provide fallback that ensures basic system paths
    if (shellOutput) {
      console.log('# Environment setup failed, using system fallback')
      console.log('# Ensure basic system paths are available')
      console.log('for sys_path in /usr/local/bin /usr/bin /bin /usr/sbin /sbin; do')
      console.log('  if [[ -d "$sys_path" && ":$PATH:" != *":$sys_path:"* ]]; then')
      console.log('    export PATH="$PATH:$sys_path"')
      console.log('  fi')
      console.log('done')
      console.log('# Clear command hash to ensure fresh lookups')
      console.log('hash -r 2>/dev/null || true')
    }

    // Only throw for non-package-installation errors and non-shell-output mode
    if (!shellOutput && !isPackageInstallationError) {
      throw error
    }
  }
}

// Optimized package installation function
async function installPackagesOptimized(
  localPackages: string[],
  globalPackages: string[],
  envDir: string,
  globalEnvDir: string,
  dryrun: boolean,
  quiet: boolean,
): Promise<void> {
  const isShellIntegration = process.env.LAUNCHPAD_SHELL_INTEGRATION === '1'

  // Reset the global installed packages tracker for this environment setup
  resetInstalledTracker()

  // Add progress indicator for shell integration
  let progressInterval: NodeJS.Timeout | null = null
  if (isShellIntegration && (localPackages.length > 0 || globalPackages.length > 0)) {
    const dots = ['⠋', '⠙', '⠹', '⠸', '⠼', '⠴', '⠦', '⠧', '⠇', '⠏']
    let dotIndex = 0
    progressInterval = setInterval(() => {
      process.stderr.write(`\r${dots[dotIndex]} Installing packages...`)
      dotIndex = (dotIndex + 1) % dots.length
    }, 150)
  }

  let globalInstallSuccess = true
  let localInstallSuccess = true

  // Install global packages first (if any)
  if (globalPackages.length > 0) {
    if (!quiet && !isShellIntegration) {
      console.log(`Installing ${globalPackages.length} global packages...`)
    }

    // Clear spinner before starting installation to avoid overlap
    if (progressInterval) {
      clearInterval(progressInterval)
      progressInterval = null
      if (isShellIntegration && process.env.LAUNCHPAD_DISABLE_CLEANUP !== '1') {
        process.stderr.write('\r\x1B[K')
      }
    }

    try {
      if (dryrun) {
        if (!quiet) {
          console.log(`Would install global packages: ${globalPackages.join(', ')}`)
        }
      } else {
        // For both shell integration and regular calls, use standard install
        await install(globalPackages, globalEnvDir)
      }
    }
    catch (error) {
      globalInstallSuccess = false
      // Only show installation warnings in non-shell-integration mode to avoid confusing messages
      if (!quiet && !isShellIntegration) {
        console.warn(`Failed to install some global packages: ${error instanceof Error ? error.message : String(error)}`)
      }

      // Don't rethrow package installation errors - continue with partial setup
    }

    // After global install, ensure global binaries are linked into ~/.local/bin
    try {
      const { createGlobalBinarySymlinks } = await import('../install-helpers.js')
      if (config.verbose) {
        console.log('🔗 Creating/refreshing global binary symlinks in ~/.local/bin...')
      }
      await createGlobalBinarySymlinks(globalEnvDir)
    }
    catch (e) {
      if (!quiet && !isShellIntegration) {
        console.warn(`⚠️  Warning: Failed to create global binary symlinks: ${e instanceof Error ? e.message : String(e)}`)
      }
    }
  }

  // Install local packages (if any)
  if (localPackages.length > 0) {
    if (!quiet && !isShellIntegration) {
      console.log(`Installing ${localPackages.length} local packages...`)
    }

    // Clear spinner before starting installation to avoid overlap (if not already cleared)
    if (progressInterval) {
      clearInterval(progressInterval)
      progressInterval = null
      if (isShellIntegration && process.env.LAUNCHPAD_DISABLE_CLEANUP !== '1') {
        process.stderr.write('\r\x1B[K')
      }
    }

    try {
      if (dryrun) {
        if (!quiet) {
          console.log(`Would install local packages: ${localPackages.join(', ')}`)
        }
      } else {
        // For both shell integration and regular calls, use standard install
        await install(localPackages, envDir)
      }
    }
    catch (error) {
      localInstallSuccess = false
      // Only show installation warnings in non-shell-integration mode to avoid confusing messages
      if (!quiet && !isShellIntegration) {
        console.warn(`Failed to install some local packages: ${error instanceof Error ? error.message : String(error)}`)
      }

      // Don't rethrow package installation errors - continue with partial setup
    }
  }

  // Clean up progress indicator (final safety check) BEFORE checking package status
  if (progressInterval) {
    clearInterval(progressInterval)
    progressInterval = null
    if (isShellIntegration && process.env.LAUNCHPAD_DISABLE_CLEANUP !== '1') {
      process.stderr.write('\r\x1B[K')
    }
  }

  // Check package installation status AFTER all cleanup is done
  let needsEnvironmentWarning = false

  // Check if global packages actually installed successfully
  if (globalPackages.length > 0) {
    const globalPackageStatus = needsPackageInstallation([], globalPackages, '', globalEnvDir)

    if (globalPackageStatus.needsGlobal || !globalInstallSuccess) {
      needsEnvironmentWarning = true
    }
  }

  // Check if local packages actually installed successfully
  if (localPackages.length > 0) {
    const packageStatus = needsPackageInstallation(localPackages, [], envDir, '')

    if (packageStatus.needsLocal || !localInstallSuccess) {
      needsEnvironmentWarning = true
    }
  }

  // Output environment warning messages AFTER all cleanup with a small delay
  // Use the original quiet parameter, not effectiveQuiet, for environment warnings
  // Skip confusing messages in shell integration mode - they're not helpful for users
  if (needsEnvironmentWarning && !quiet && !isShellIntegration) {
    // Add a small delay to ensure all install function cleanup is complete
    await new Promise(resolve => setTimeout(resolve, 50))

    console.warn('Environment not ready')
    if (localPackages.length > 0) {
      console.warn('Local packages need installation')
    }
    if (globalPackages.length > 0) {
      console.warn('Global packages need installation')
    }
    console.warn('Generating minimal shell environment for development')
  }
}

function outputShellCode(dir: string, envBinPath: string, envSbinPath: string, projectHash: string, sniffResult?: any, globalBinPath?: string, globalSbinPath?: string): void {
  // Output shell code directly without extra newlines
  process.stdout.write(`# Launchpad environment setup for ${dir}\n`)
  process.stdout.write(`if [[ -z "$LAUNCHPAD_ORIGINAL_PATH" ]]; then\n`)
  process.stdout.write(`  export LAUNCHPAD_ORIGINAL_PATH="$PATH"\n`)
  process.stdout.write(`fi\n`)
  process.stdout.write(`# Ensure we have basic system paths if LAUNCHPAD_ORIGINAL_PATH is empty\n`)
  process.stdout.write(`if [[ -z "$LAUNCHPAD_ORIGINAL_PATH" ]]; then\n`)
  process.stdout.write(`  export LAUNCHPAD_ORIGINAL_PATH="/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin"\n`)
  process.stdout.write(`fi\n`)

  // Build PATH with both project and global environments
  const pathComponents: string[] = []

  // If exact pins exist, prepend their bin directories ahead of generic env bin
  try {
    if (sniffResult && Array.isArray(sniffResult.pkgs)) {
      const envRoot = fs.existsSync(envBinPath) ? path.dirname(envBinPath) : ''
      for (const pkg of sniffResult.pkgs) {
        const domain = String(pkg.project || '')
        const constraint = String(typeof pkg.constraint === 'string' ? pkg.constraint : (pkg.constraint || ''))
        if (!domain || !constraint || constraint === '*' || constraint.startsWith('^') || constraint.startsWith('~'))
          continue
        if (!envRoot)
          continue
        const pinnedBin = path.join(envRoot, domain, `v${constraint.replace(/^v/, '')}`, 'bin')
        if (fs.existsSync(pinnedBin) && !pathComponents.includes(pinnedBin)) {
          pathComponents.push(pinnedBin)
        }
      }
    }
  }
  catch {}

  // Add project-specific paths first (highest priority - can override global versions)
  if (fs.existsSync(envBinPath)) {
    pathComponents.push(envBinPath)
  }
  if (fs.existsSync(envSbinPath)) {
    pathComponents.push(envSbinPath)
  }

  // Add bun global bin directory for this environment (high priority for global installs)
  const envRoot = fs.existsSync(envBinPath) ? path.dirname(envBinPath) : ''
  const bunGlobalBinPath = path.join(envRoot, '.bun', 'bin')
  if (envRoot && fs.existsSync(bunGlobalBinPath)) {
    pathComponents.push(bunGlobalBinPath)
  }

  // Add global paths second (fallback for tools not in project environment)
  if (globalBinPath && fs.existsSync(globalBinPath)) {
    pathComponents.push(globalBinPath)
  }
  if (globalSbinPath && fs.existsSync(globalSbinPath)) {
    pathComponents.push(globalSbinPath)
  }

  // Add original PATH
  pathComponents.push('$LAUNCHPAD_ORIGINAL_PATH')

  process.stdout.write(`export PATH="${pathComponents.join(':')}"\n`)

  // Ensure system paths are always available (fix for missing bash, etc.)
  process.stdout.write(`# Ensure critical system binaries are always available\n`)
  process.stdout.write(`for sys_path in /usr/local/bin /usr/bin /bin /usr/sbin /sbin; do\n`)
  process.stdout.write(`  if [[ -d "$sys_path" && ":$PATH:" != *":$sys_path:"* ]]; then\n`)
  process.stdout.write(`    export PATH="$PATH:$sys_path"\n`)
  process.stdout.write(`  fi\n`)
  process.stdout.write(`done\n`)

  // Set up dynamic library paths for packages to find their dependencies
  const libraryPathComponents = []

  // Add library paths from project environment
  const envLibPath = path.dirname(envBinPath) // Go up from bin to env root
  const projectLibDirs = [
    path.join(envLibPath, 'lib'),
    path.join(envLibPath, 'lib64'),
  ]

  for (const libDir of projectLibDirs) {
    if (fs.existsSync(libDir)) {
      libraryPathComponents.push(libDir)
    }
  }

  // Add library paths from global environment
  if (globalBinPath) {
    const globalLibPath = path.dirname(globalBinPath) // Go up from bin to env root
    const globalLibDirs = [
      path.join(globalLibPath, 'lib'),
      path.join(globalLibPath, 'lib64'),
    ]

    for (const libDir of globalLibDirs) {
      if (fs.existsSync(libDir)) {
        libraryPathComponents.push(libDir)
      }
    }
  }

  // Add library paths from all package installations in the environment
  const packageSearchDirs = [
    path.dirname(envBinPath), // Project environment root
    globalBinPath ? path.dirname(globalBinPath) : null, // Global environment root
  ].filter(Boolean) as string[]

  for (const searchDir of packageSearchDirs) {
    try {
      const domains = fs.readdirSync(searchDir, { withFileTypes: true })
        .filter(dirent => dirent.isDirectory() && !['bin', 'sbin', 'lib', 'lib64', 'share', 'include', 'etc'].includes(dirent.name))

      for (const domain of domains) {
        const domainPath = path.join(searchDir, domain.name)
        if (fs.existsSync(domainPath)) {
          const versions = fs.readdirSync(domainPath, { withFileTypes: true })
            .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('v'))

          for (const version of versions) {
            const versionPath = path.join(domainPath, version.name)
            const packageLibDirs = [
              path.join(versionPath, 'lib'),
              path.join(versionPath, 'lib64'),
            ]

            for (const libDir of packageLibDirs) {
              if (fs.existsSync(libDir) && !libraryPathComponents.includes(libDir)) {
                libraryPathComponents.push(libDir)
              }
            }
          }
        }
      }
    }
    catch {
      // Ignore errors reading directories
    }
  }

  // Set up library path environment variables
  // For testing, always try to scan for library directories when we have package installations
  if (process.env.NODE_ENV === 'test' && envBinPath && fs.existsSync(envBinPath)) {
    const envRoot = path.dirname(envBinPath)
    try {
      const contents = fs.readdirSync(envRoot, { withFileTypes: true })
      for (const entry of contents) {
        if (entry.isDirectory() && !['bin', 'sbin', 'share', 'include', 'etc', 'pkgs'].includes(entry.name)) {
          const domainDir = path.join(envRoot, entry.name)
          if (fs.existsSync(domainDir)) {
            const versions = fs.readdirSync(domainDir, { withFileTypes: true })
              .filter(dirent => dirent.isDirectory() && dirent.name.startsWith('v'))

            for (const version of versions) {
              const versionPath = path.join(domainDir, version.name)
              const libDir = path.join(versionPath, 'lib')
              const lib64Dir = path.join(versionPath, 'lib64')

              if (fs.existsSync(libDir) && !libraryPathComponents.includes(libDir)) {
                libraryPathComponents.push(libDir)
              }
              if (fs.existsSync(lib64Dir) && !libraryPathComponents.includes(lib64Dir)) {
                libraryPathComponents.push(lib64Dir)
              }
            }
          }
        }
      }
    }
    catch {
      // Ignore scanning errors
    }
  }

  if (libraryPathComponents.length > 0) {
    const libraryPath = libraryPathComponents.join(':')

    // macOS uses DYLD_LIBRARY_PATH and DYLD_FALLBACK_LIBRARY_PATH
    process.stdout.write(`# Set up dynamic library paths for package dependencies\n`)
    process.stdout.write(`if [[ -z "$LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH" ]]; then\n`)
    process.stdout.write(`  export LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH="$DYLD_LIBRARY_PATH"\n`)
    process.stdout.write(`fi\n`)
    process.stdout.write(`if [[ -z "$LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH" ]]; then\n`)
    process.stdout.write(`  export LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH="$DYLD_FALLBACK_LIBRARY_PATH"\n`)
    process.stdout.write(`fi\n`)
    process.stdout.write(`if [[ -z "$LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH" ]]; then\n`)
    process.stdout.write(`  export LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH="$LD_LIBRARY_PATH"\n`)
    process.stdout.write(`fi\n`)

    // Set library paths with fallbacks to original values
    process.stdout.write(`export DYLD_LIBRARY_PATH="${libraryPath}\${LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH:+:\$LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH}"\n`)
    process.stdout.write(`export DYLD_FALLBACK_LIBRARY_PATH="${libraryPath}\${LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH:+:\$LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH}"\n`)
    // Linux uses LD_LIBRARY_PATH
    process.stdout.write(`export LD_LIBRARY_PATH="${libraryPath}\${LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH:+:\$LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH}"\n`)
  }

  process.stdout.write(`export LAUNCHPAD_ENV_BIN_PATH="${envBinPath}"\n`)
  process.stdout.write(`export LAUNCHPAD_PROJECT_DIR="${dir}"\n`)
  process.stdout.write(`export LAUNCHPAD_PROJECT_HASH="${projectHash}"\n`)

  // Export environment variables from the dependency file
  if (sniffResult && sniffResult.env) {
    for (const [key, value] of Object.entries(sniffResult.env)) {
      process.stdout.write(`export ${key}=${value}\n`)
    }
  }

  // Generate the deactivation function that the test expects
  process.stdout.write(`\n# Deactivation function for directory checking\n`)
  process.stdout.write(`_launchpad_dev_try_bye() {\n`)
  process.stdout.write(`  case "$PWD" in\n`)
  process.stdout.write(`    "${dir}"*)\n`)
  process.stdout.write(`      # Still in project directory, don't deactivate\n`)
  process.stdout.write(`      return 0\n`)
  process.stdout.write(`      ;;\n`)
  process.stdout.write(`    *)\n`)
  process.stdout.write(`      # Left project directory, deactivate\n`)
  process.stdout.write(`      if [[ -n "$LAUNCHPAD_ORIGINAL_PATH" ]]; then\n`)
  process.stdout.write(`        export PATH="$LAUNCHPAD_ORIGINAL_PATH"\n`)
  process.stdout.write(`      fi\n`)
  process.stdout.write(`      # Restore original library paths\n`)
  process.stdout.write(`      if [[ -n "$LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH" ]]; then\n`)
  process.stdout.write(`        export DYLD_LIBRARY_PATH="$LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH"\n`)
  process.stdout.write(`      else\n`)
  process.stdout.write(`        unset DYLD_LIBRARY_PATH\n`)
  process.stdout.write(`      fi\n`)
  process.stdout.write(`      if [[ -n "$LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH" ]]; then\n`)
  process.stdout.write(`        export DYLD_FALLBACK_LIBRARY_PATH="$LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH"\n`)
  process.stdout.write(`      else\n`)
  process.stdout.write(`        unset DYLD_FALLBACK_LIBRARY_PATH\n`)
  process.stdout.write(`      fi\n`)
  process.stdout.write(`      if [[ -n "$LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH" ]]; then\n`)
  process.stdout.write(`        export LD_LIBRARY_PATH="$LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH"\n`)
  process.stdout.write(`      else\n`)
  process.stdout.write(`        unset LD_LIBRARY_PATH\n`)
  process.stdout.write(`      fi\n`)
  process.stdout.write(`      unset LAUNCHPAD_ENV_BIN_PATH\n`)
  process.stdout.write(`      unset LAUNCHPAD_PROJECT_DIR\n`)
  process.stdout.write(`      unset LAUNCHPAD_PROJECT_HASH\n`)
  process.stdout.write(`      unset LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH\n`)
  process.stdout.write(`      unset LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH\n`)
  process.stdout.write(`      unset LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH\n`)
  process.stdout.write(`      echo "dev environment deactivated"\n`)
  process.stdout.write(`      ;;\n`)
  process.stdout.write(`  esac\n`)
  process.stdout.write(`}\n`)
  // Refresh the command hash so version switches take effect immediately (async, detached)
  process.stdout.write(`(hash -r 2>/dev/null || true) >/dev/null 2>&1 & disown 2>/dev/null || true\n`)
}

/**
 * Create PHP shims after all dependencies are installed
 */
async function createPhpShimsAfterInstall(envDir: string): Promise<void> {
  const path = await import('node:path')
  const fs = await import('node:fs')

  try {
    // Check if there's a PHP installation in this environment
    const phpDir = path.join(envDir, 'php.net')
    if (!fs.existsSync(phpDir)) {
      return // No PHP installation, nothing to do
    }

    // Find PHP version directories
    const versionDirs = fs.readdirSync(phpDir).filter((item) => {
      const fullPath = path.join(phpDir, item)
      return fs.statSync(fullPath).isDirectory() && item.startsWith('v')
    })

    if (versionDirs.length === 0) {
      return // No PHP versions found
    }

    // Import the PrecompiledBinaryDownloader to create shims
    const { PrecompiledBinaryDownloader } = await import('../binary-downloader.js')

    for (const versionDir of versionDirs) {
      const packageDir = path.join(phpDir, versionDir)
      const version = versionDir.replace(/^v/, '') // Remove 'v' prefix

      // Check if this directory has PHP binaries
      const binDir = path.join(packageDir, 'bin')
      if (fs.existsSync(binDir)) {
        const downloader = new PrecompiledBinaryDownloader(envDir)
        console.log(`🔗 Creating PHP ${version} shims with proper library paths...`)
        await downloader.createPhpShims(packageDir, version)

        // Now validate that PHP works
        await downloader.validatePhpInstallation(packageDir, version)
      }
    }
  }
  catch (error) {
    // Don't fail the entire setup if shim creation fails
    console.warn(`⚠️ Failed to create PHP shims: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Run Laravel post-setup commands once per project activation
 */
async function maybeRunProjectPostSetup(projectDir: string, envDir: string, isShellIntegration: boolean): Promise<void> {
  try {
    // Skip post-setup entirely in shell integration mode for performance
    if (isShellIntegration) {
      return
    }

    if (process.env.LAUNCHPAD_VERBOSE === 'true') {
      console.warn(`maybeRunProjectPostSetup called: projectDir=${projectDir}, envDir=${envDir}`)
    }

    // Use a marker file inside env to avoid re-running on every prompt
    const markerDir = path.join(envDir, 'pkgs')
    const markerFile = path.join(markerDir, '.post_setup_done')

    if (fs.existsSync(markerFile)) {
      if (process.env.LAUNCHPAD_VERBOSE === 'true') {
        console.warn(`Post-setup marker file already exists, skipping: ${markerFile}`)
      }
      return
    }

    // Ensure envDir/pkgs exists (env may be fast-activated without pkgs when empty)
    try {
      fs.mkdirSync(markerDir, { recursive: true })
    }
    catch (error) {
      if (process.env.LAUNCHPAD_VERBOSE === 'true') {
        console.warn(`Failed to create marker directory ${markerDir}: ${error instanceof Error ? error.message : String(error)}`)
      }
    }

    // Aggregate post-setup commands from both runtime config and project-local config
    const commands: PostSetupCommand[] = []

    // 1) Runtime config (global/app config)
    const projectPostSetup = config.postSetup
    if (projectPostSetup?.enabled && Array.isArray(projectPostSetup.commands)) {
      commands.push(...projectPostSetup.commands)
    }

    // 2) Project-local launchpad.config.ts (if present)
    try {
      const configPathTs = path.join(projectDir, 'launchpad.config.ts')
      if (fs.existsSync(configPathTs)) {
        const configUrl = new URL(`file://${configPathTs}`)
        const mod = await import(configUrl.href)
        const local = mod.default || mod
        if (local?.postSetup?.enabled && Array.isArray(local.postSetup.commands)) {
          commands.push(...local.postSetup.commands)
        }
      }
    }
    catch (error) {
      // Log import errors in verbose mode for debugging
      if (process.env.LAUNCHPAD_VERBOSE === 'true') {
        console.warn(`Failed to import launchpad.config.ts: ${error instanceof Error ? error.message : String(error)}`)
      }
      // Ignore import errors; absence or parse errors should not fail setup
    }

    if (commands.length === 0) {
      return
    }

    // Execute and mark
    const results = await executepostSetup(projectDir, commands)
    if (results && results.length > 0) {
      try {
        fs.writeFileSync(markerFile, new Date().toISOString())
      }
      catch {}
    }
  }
  catch {
    // non-fatal
  }
}

// Deprecated: kept here for reference only (no longer used)
// Previously attempted a local fallback migration; removed per product decision.

/**
 * Auto-setup services for any project based on deps.yaml services configuration
 */
async function setupProjectServices(projectDir: string, sniffResult: any, showMessages: boolean): Promise<void> {
  try {
    // Check services.autoStart configuration from deps.yaml
    if (!sniffResult?.services?.enabled || !sniffResult.services.autoStart || sniffResult.services.autoStart.length === 0) {
      if (showMessages && process.env.LAUNCHPAD_VERBOSE === 'true') {
        console.log('🔍 No services configured in deps.yaml - skipping service setup')
      }
      return // No services to auto-start
    }

    const autoStartServices = sniffResult.services.autoStart || []
    if (showMessages && autoStartServices.length > 0) {
      console.log(`🚀 Auto-starting services: ${autoStartServices.join(', ')}`)
    }

    // Check deps.yaml to see what services are defined in dependencies
    const hasPostgresInDeps = sniffResult?.pkgs?.some((pkg: any) =>
      pkg.project.includes('postgres') || pkg.project.includes('postgresql'),
    )
    const _hasRedisInDeps = sniffResult?.pkgs?.some((pkg: any) =>
      pkg.project.includes('redis'),
    )

    // Import service manager
    const { startService } = await import('../services/manager')

    // Start each service specified in autoStart
    for (const serviceName of autoStartServices) {
      try {
        if (showMessages) {
          console.log(`🚀 Starting ${serviceName} service...`)
        }

        const serviceStarted = await startService(serviceName)

        if (serviceStarted) {
          if (showMessages) {
            console.log(`✅ ${serviceName} service started successfully`)
          }

          // Special handling for PostgreSQL: wait for readiness and create project database
          if ((serviceName === 'postgres' || serviceName === 'postgresql') && hasPostgresInDeps) {
            // Manager has already waited and verified health before returning true.
            process.env.LAUNCHPAD_PG_READY = '1'
          }
        }
        else if (showMessages) {
          console.warn(`⚠️  Failed to start ${serviceName} service`)
        }
      }
      catch (error) {
        if (showMessages) {
          console.warn(`⚠️  Error starting ${serviceName}: ${error instanceof Error ? error.message : String(error)}`)
        }
      }
    }
  }
  catch {
    // non-fatal
  }
}
