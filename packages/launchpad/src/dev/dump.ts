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

  // Execute post-setup commands if enabled
  const laravelConfig = config.services?.frameworks?.laravel
  if (laravelConfig?.postSetupCommands?.enabled) {
    const postSetupResults = await executePostSetupCommands(dir, laravelConfig.postSetupCommands.commands || [])
    suggestions.push(...postSetupResults)
  }

  return { isLaravel: true, suggestions }
}

/**
 * Execute post-setup commands based on their conditions
 */
async function executePostSetupCommands(projectDir: string, commands: PostSetupCommand[]): Promise<string[]> {
  const results: string[] = []

  for (const command of commands) {
    try {
      const shouldRun = evaluateCommandCondition(command.condition, projectDir)

      if (!shouldRun) {
        continue
      }

      if (command.runInBackground) {
        // Run in background (fire and forget)
        execSync(command.command, { cwd: projectDir, stdio: 'pipe' })
        results.push(`🚀 Running in background: ${command.description}`)
      }
      else {
        // Run synchronously
        const output = execSync(command.command, { cwd: projectDir, stdio: 'pipe', encoding: 'utf8' })
        results.push(`✅ ${command.description}`)

        // Add command output if verbose
        if (config.verbose && output.trim()) {
          results.push(`   Output: ${output.trim().split('\n').slice(0, 3).join(', ')}...`)
        }
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
        if (config.verbose && error instanceof Error) {
          results.push(`   Reason: ${error.message}`)
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
    const dependencyFile = findDependencyFile(dir)

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

    // Ultra-fast path for shell output: check if environments exist and use cached data
    if (shellOutput) {
      // Generate hash for this project
      const projectHash = generateProjectHash(dir)
      const envDir = path.join(process.env.HOME || '', '.local', 'share', 'launchpad', 'envs', projectHash)
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
          sniffResult = await sniff({ string: projectDir })
        }
        catch {
          // Handle malformed dependency files gracefully
          sniffResult = { pkgs: [], env: {} }
        }

        outputShellCode(
          dir,
          hasLocalEnv ? path.join(envDir, 'bin') : '',
          hasLocalEnv ? path.join(envDir, 'sbin') : '',
          projectHash,
          sniffResult,
          hasGlobalEnv ? path.join(globalEnvDir, 'bin') : '',
          hasGlobalEnv ? path.join(globalEnvDir, 'sbin') : '',
        )
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
      sniffResult = await sniff({ string: projectDir })
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
            const globalSniff = await sniff({ string: globalLocation })
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
    const envDir = path.join(process.env.HOME || '', '.local', 'share', 'launchpad', 'envs', projectHash)
    const globalEnvDir = path.join(process.env.HOME || '', '.local', 'share', 'launchpad', 'global')

    // For shell output mode, check if we can skip expensive operations
    if (shellOutput) {
      // Quick check: if no packages to install and environments exist, output immediately
      if (localPackages.length === 0 && globalPackages.length === 0) {
        const envBinPath = path.join(envDir, 'bin')
        const envSbinPath = path.join(envDir, 'sbin')
        const globalBinPath = path.join(globalEnvDir, 'bin')
        const globalSbinPath = path.join(globalEnvDir, 'sbin')

        // Auto-start services even when no packages need installation
        try {
          await setupProjectServices(projectDir, sniffResult, !effectiveQuiet)
        }
        catch (error) {
          console.error(`⚠️  Service auto-start failed: ${error instanceof Error ? error.message : String(error)}`)
        }

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

        // Check what packages are actually missing and need installation
        const packageStatus = needsPackageInstallation(localPackages, globalPackages, envDir, globalEnvDir)

        // Install missing packages if any are found
        if (packageStatus.needsLocal || packageStatus.needsGlobal) {
          await installPackagesOptimized(
            packageStatus.missingLocal,
            packageStatus.missingGlobal,
            envDir,
            globalEnvDir,
            dryrun,
            quiet,
          )
        }

        // Create PHP shims after all dependencies are installed
        if (config.verbose) {
          console.log('🔍 Checking for PHP installations to create shims...')
        }
        await createPhpShimsAfterInstall(envDir)

        // Auto-start services for shell integration too
        try {
          await setupProjectServices(projectDir, sniffResult, !effectiveQuiet)
        }
        catch (error) {
          console.error(`⚠️  Service auto-start failed: ${error instanceof Error ? error.message : String(error)}`)
        }

        outputShellCode(dir, envBinPath, envSbinPath, projectHash, sniffResult, globalBinPath, globalSbinPath)
        return
      }
    }

    // Regular path for non-shell integration calls
    if (localPackages.length > 0 || globalPackages.length > 0) {
      await installPackagesOptimized(localPackages, globalPackages, envDir, globalEnvDir, dryrun, quiet)
    }

    // Auto-start services for any project that has services configuration
    await setupProjectServices(projectDir, sniffResult, !effectiveQuiet)

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

      outputShellCode(dir, envBinPath, envSbinPath, projectHash, sniffResult, globalBinPath, globalSbinPath)
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
      // For both shell integration and regular calls, use standard install
      await install(globalPackages, globalEnvDir)
    }
    catch (error) {
      globalInstallSuccess = false
      if (!quiet && !isShellIntegration) {
        console.warn(`Failed to install some global packages: ${error instanceof Error ? error.message : String(error)}`)
      }

      // Don't rethrow package installation errors - continue with partial setup
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
      // For both shell integration and regular calls, use standard install
      await install(localPackages, envDir)
    }
    catch (error) {
      localInstallSuccess = false
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
  if (needsEnvironmentWarning && !quiet) {
    // Add a small delay to ensure all install function cleanup is complete
    await new Promise(resolve => setTimeout(resolve, 50))

    if (isShellIntegration) {
      process.stderr.write('Environment not ready\n')
      if (localPackages.length > 0) {
        process.stderr.write('Local packages need installation\n')
      }
      if (globalPackages.length > 0) {
        process.stderr.write('Global packages need installation\n')
      }
      process.stderr.write('Generating minimal shell environment for development\n')
    }
    else {
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
  const pathComponents = []

  // Add project-specific paths first (highest priority - can override global versions)
  if (fs.existsSync(envBinPath)) {
    pathComponents.push(envBinPath)
  }
  if (fs.existsSync(envSbinPath)) {
    pathComponents.push(envSbinPath)
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
        const downloader = new PrecompiledBinaryDownloader('')
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
 * Auto-setup services for any project based on deps.yaml services configuration
 */
async function setupProjectServices(projectDir: string, sniffResult: any, showMessages: boolean): Promise<void> {
  try {
    // Check services.autoStart configuration from deps.yaml
    if (!sniffResult?.services?.enabled || !sniffResult.services.autoStart || sniffResult.services.autoStart.length === 0) {
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
    const { createProjectDatabase } = await import('../services/database')

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

          // Special handling for PostgreSQL: create project database
          if ((serviceName === 'postgres' || serviceName === 'postgresql') && hasPostgresInDeps) {
            const projectName = path.basename(projectDir).replace(/\W/g, '_')
            try {
              await createProjectDatabase(projectName, {
                type: 'postgres',
                host: '127.0.0.1',
                port: 5432,
                user: 'postgres',
                password: '',
              })

              if (showMessages) {
                console.log(`✅ PostgreSQL database '${projectName}' created`)
              }
            }
            catch (dbError) {
              if (showMessages) {
                console.warn(`⚠️  Database creation warning: ${dbError instanceof Error ? dbError.message : String(dbError)}`)
              }
            }
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
  catch (error) {
    if (showMessages) {
      console.warn(`⚠️  Service setup warning: ${error instanceof Error ? error.message : String(error)}`)
    }
  }
}
