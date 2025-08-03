/* eslint-disable no-console */
import type { ServiceInstance, ServiceManagerState, ServiceOperation, ServiceStatus } from '../types'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import { platform } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { config } from '../config'
import { findBinaryInPath, findBinaryInEnvironment } from '../utils'
import { createDefaultServiceConfig, getServiceDefinition } from './definitions'
import { generateLaunchdPlist, generateSystemdService, getServiceFilePath, isPlatformSupported, removeServiceFile, writeLaunchdPlist, writeSystemdService } from './platform'

// Global service manager state
let serviceManagerState: ServiceManagerState | null = null

/**
 * Initialize the service manager
 */
export async function initializeServiceManager(): Promise<ServiceManagerState> {
  if (serviceManagerState) {
    return serviceManagerState
  }

  serviceManagerState = {
    services: new Map(),
    operations: [],
    config: config.services,
    lastScanTime: new Date(),
  }

  // Create necessary directories
  await ensureDirectories()

  return serviceManagerState
}

/**
 * Get or initialize the service manager state
 */
async function getServiceManager(): Promise<ServiceManagerState> {
  if (!serviceManagerState) {
    return await initializeServiceManager()
  }
  return serviceManagerState
}

/**
 * Ensure all required directories exist
 */
async function ensureDirectories(): Promise<void> {
  const dirs = [
    config.services.dataDir,
    config.services.logDir,
    config.services.configDir,
  ]

  for (const dir of dirs) {
    await fs.promises.mkdir(dir, { recursive: true })
  }
}

/**
 * Start a service
 */
export async function startService(serviceName: string): Promise<boolean> {
  if (!isPlatformSupported()) {
    throw new Error(`Service management is not supported on ${platform()}`)
  }

  const manager = await getServiceManager()
  const operation: ServiceOperation = {
    action: 'start',
    serviceName,
    timestamp: new Date(),
  }

  // In test mode, still validate service exists but mock the actual operation
  if (process.env.NODE_ENV === 'test' || process.env.LAUNCHPAD_TEST_MODE === 'true') {
    try {
      const service = await getOrCreateServiceInstance(serviceName)
      console.warn(`🧪 Test mode: Mocking start of service ${serviceName}`)

      // Track operation in test mode
      operation.result = 'success'
      operation.duration = 0
      manager.operations.push(operation)

      service.status = 'running'
      service.lastCheckedAt = new Date()
      return true
    }
    catch (error) {
      console.warn(`🧪 Test mode: Failed to start unknown service ${serviceName}`)
      operation.result = 'failure'
      operation.error = error instanceof Error ? error.message : String(error)
      operation.duration = 0
      manager.operations.push(operation)
      return false
    }
  }

  try {
    const service = await getOrCreateServiceInstance(serviceName)

    if (service.status === 'running') {
      console.warn(`✅ Service ${serviceName} is already running`)
      operation.result = 'success'
      operation.duration = 0
      manager.operations.push(operation)
      return true
    }

    console.warn(`🚀 Starting ${service.definition.displayName}...`)

    // Update status to starting
    service.status = 'starting'
    service.lastCheckedAt = new Date()

    // Install service package and dependencies if needed
    const installResult = await ensureServicePackageInstalled(service)
    if (!installResult) {
      console.error(`❌ Failed to install ${service.definition.displayName} package`)
      operation.result = 'failure'
      operation.error = 'Package installation failed'
      manager.operations.push(operation)
      return false
    }

    // For PHP service, ensure database extensions are available
    if (service.definition.name === 'php') {
      const extensionsResult = await ensurePHPDatabaseExtensions(service)
      if (!extensionsResult) {
        console.warn(`⚠️  Some PHP database extensions may not be available.`)
        // Don't fail here as basic PHP functionality may still work
      }
    }

    // For PostgreSQL service, check if PHP needs PostgreSQL extensions
    if (service.definition.name === 'postgres') {
      await checkAndInstallPHPPostgreSQLExtensions()
    }

    // Auto-initialize databases first
    const autoInitResult = await autoInitializeDatabase(service)
    if (!autoInitResult) {
      console.error(`❌ Failed to auto-initialize ${service.definition.displayName}`)
      operation.result = 'failure'
      operation.error = 'Auto-initialization failed'
      manager.operations.push(operation)
      return false
    }

    // Initialize service if needed
    if (service.definition.initCommand && !await isServiceInitialized(service)) {
      console.warn(`🔧 Initializing ${service.definition.displayName}...`)
      await initializeService(service)
    }

    // Create/update service files
    await createServiceFiles(service)

    // Start the service using platform-specific method
    const success = await startServicePlatform(service)

    if (success) {
      service.status = 'running'
      service.startedAt = new Date()
      service.pid = await getServicePid(service)

      console.warn(`✅ ${service.definition.displayName} started successfully`)

      // Execute post-start setup commands
      await executePostStartCommands(service)

      // Health check after starting
      setTimeout(() => {
        void checkServiceHealth(service)
      }, 2000)

      operation.result = 'success'
    }
    else {
      service.status = 'failed'
      operation.result = 'failure'
      operation.error = 'Failed to start service'
    }

    operation.duration = Date.now() - operation.timestamp.getTime()
    manager.operations.push(operation)

    return success
  }
  catch (error) {
    operation.result = 'failure'
    operation.error = error instanceof Error ? error.message : String(error)
    operation.duration = Date.now() - operation.timestamp.getTime()
    manager.operations.push(operation)

    console.error(`❌ Failed to start ${serviceName}: ${operation.error}`)
    return false
  }
}

/**
 * Stop a service
 */
export async function stopService(serviceName: string): Promise<boolean> {
  if (!isPlatformSupported()) {
    throw new Error(`Service management is not supported on ${platform()}`)
  }

  const manager = await getServiceManager()
  const operation: ServiceOperation = {
    action: 'stop',
    serviceName,
    timestamp: new Date(),
  }

  // In test mode, still validate and track operations
  if (process.env.NODE_ENV === 'test' || process.env.LAUNCHPAD_TEST_MODE === 'true') {
    const service = manager.services.get(serviceName)

    if (!service) {
      console.warn(`🧪 Test mode: Service ${serviceName} is not registered`)
      operation.result = 'success'
      operation.duration = 0
      manager.operations.push(operation)
      return true
    }

    console.warn(`🧪 Test mode: Mocking stop of service ${serviceName}`)
    operation.result = 'success'
    operation.duration = 0
    manager.operations.push(operation)

    service.status = 'stopped'
    service.lastCheckedAt = new Date()
    return true
  }

  try {
    const service = manager.services.get(serviceName)

    if (!service) {
      console.warn(`⚠️  Service ${serviceName} is not registered`)
      operation.result = 'success'
      operation.duration = 0
      manager.operations.push(operation)
      return true
    }

    if (service.status === 'stopped') {
      console.warn(`✅ Service ${serviceName} is already stopped`)
      operation.result = 'success'
      operation.duration = 0
      manager.operations.push(operation)
      return true
    }

    console.warn(`🛑 Stopping ${service.definition.displayName}...`)

    // Update status to stopping
    service.status = 'stopping'
    service.lastCheckedAt = new Date()

    // Stop the service using platform-specific method
    const success = await stopServicePlatform(service)

    if (success) {
      service.status = 'stopped'
      service.pid = undefined
      service.startedAt = undefined

      console.warn(`✅ ${service.definition.displayName} stopped successfully`)
      operation.result = 'success'
    }
    else {
      service.status = 'failed'
      operation.result = 'failure'
      operation.error = 'Failed to stop service'
    }

    operation.duration = Date.now() - operation.timestamp.getTime()
    manager.operations.push(operation)

    return success
  }
  catch (error) {
    operation.result = 'failure'
    operation.error = error instanceof Error ? error.message : String(error)
    operation.duration = Date.now() - operation.timestamp.getTime()
    manager.operations.push(operation)

    console.error(`❌ Failed to stop ${serviceName}: ${operation.error}`)
    return false
  }
}

/**
 * Restart a service
 */
export async function restartService(serviceName: string): Promise<boolean> {
  console.warn(`🔄 Restarting ${serviceName}...`)

  const stopSuccess = await stopService(serviceName)
  if (!stopSuccess) {
    return false
  }

  // Wait a moment before starting
  await new Promise(resolve => setTimeout(resolve, 1000))

  return await startService(serviceName)
}

/**
 * Enable a service for auto-start
 */
export async function enableService(serviceName: string): Promise<boolean> {
  if (!isPlatformSupported()) {
    throw new Error(`Service management is not supported on ${platform()}`)
  }

  const manager = await getServiceManager()
  const operation: ServiceOperation = {
    action: 'enable',
    serviceName,
    timestamp: new Date(),
  }

  // In test mode, still validate service exists but mock the actual operation
  if (process.env.NODE_ENV === 'test' || process.env.LAUNCHPAD_TEST_MODE === 'true') {
    try {
      const service = await getOrCreateServiceInstance(serviceName)
      console.warn(`🧪 Test mode: Mocking enable of service ${serviceName}`)

      // Track operation in test mode
      operation.result = 'success'
      operation.duration = 0
      manager.operations.push(operation)

      service.enabled = true
      return true
    }
    catch (error) {
      console.warn(`🧪 Test mode: Failed to enable unknown service ${serviceName}`)
      operation.result = 'failure'
      operation.error = error instanceof Error ? error.message : String(error)
      operation.duration = 0
      manager.operations.push(operation)
      return false
    }
  }

  try {
    const service = await getOrCreateServiceInstance(serviceName)

    if (service.enabled) {
      console.warn(`✅ Service ${serviceName} is already enabled`)
      operation.result = 'success'
      operation.duration = 0
      manager.operations.push(operation)
      return true
    }

    console.warn(`🔧 Enabling ${service.definition.displayName} for auto-start...`)

    service.enabled = true
    await createServiceFiles(service)

    const success = await enableServicePlatform(service)

    if (success) {
      console.warn(`✅ ${service.definition.displayName} enabled for auto-start`)
      operation.result = 'success'
    }
    else {
      service.enabled = false
      operation.result = 'failure'
      operation.error = 'Failed to enable service'
    }

    operation.duration = Date.now() - operation.timestamp.getTime()
    manager.operations.push(operation)

    return success
  }
  catch (error) {
    operation.result = 'failure'
    operation.error = error instanceof Error ? error.message : String(error)
    operation.duration = Date.now() - operation.timestamp.getTime()
    manager.operations.push(operation)

    console.error(`❌ Failed to enable ${serviceName}: ${operation.error}`)
    return false
  }
}

/**
 * Disable a service from auto-start
 */
export async function disableService(serviceName: string): Promise<boolean> {
  if (!isPlatformSupported()) {
    throw new Error(`Service management is not supported on ${platform()}`)
  }

  const manager = await getServiceManager()
  const operation: ServiceOperation = {
    action: 'disable',
    serviceName,
    timestamp: new Date(),
  }

  // In test mode, still validate and track operations
  if (process.env.NODE_ENV === 'test' || process.env.LAUNCHPAD_TEST_MODE === 'true') {
    const service = manager.services.get(serviceName)

    if (!service) {
      console.warn(`🧪 Test mode: Service ${serviceName} is not registered`)
      operation.result = 'success'
      operation.duration = 0
      manager.operations.push(operation)
      return true
    }

    console.warn(`🧪 Test mode: Mocking disable of service ${serviceName}`)
    operation.result = 'success'
    operation.duration = 0
    manager.operations.push(operation)

    service.enabled = false
    return true
  }

  try {
    const service = manager.services.get(serviceName)

    if (!service) {
      console.warn(`⚠️  Service ${serviceName} is not registered`)
      operation.result = 'success'
      operation.duration = 0
      manager.operations.push(operation)
      return true
    }

    if (!service.enabled) {
      console.warn(`✅ Service ${serviceName} is already disabled`)
      operation.result = 'success'
      operation.duration = 0
      manager.operations.push(operation)
      return true
    }

    console.warn(`🔧 Disabling ${service.definition.displayName} from auto-start...`)

    service.enabled = false

    const success = await disableServicePlatform(service)

    if (success) {
      await removeServiceFile(serviceName)
      console.warn(`✅ ${service.definition.displayName} disabled from auto-start`)
      operation.result = 'success'
    }
    else {
      service.enabled = true
      operation.result = 'failure'
      operation.error = 'Failed to disable service'
    }

    operation.duration = Date.now() - operation.timestamp.getTime()
    manager.operations.push(operation)

    return success
  }
  catch (error) {
    operation.result = 'failure'
    operation.error = error instanceof Error ? error.message : String(error)
    operation.duration = Date.now() - operation.timestamp.getTime()
    manager.operations.push(operation)

    console.error(`❌ Failed to disable ${serviceName}: ${operation.error}`)
    return false
  }
}

/**
 * Get the status of a service
 */
export async function getServiceStatus(serviceName: string): Promise<ServiceStatus> {
  const manager = await getServiceManager()
  const service = manager.services.get(serviceName)

  if (!service) {
    return 'stopped'
  }

  // Check if the service is actually running
  if (service.status === 'running') {
    const isActuallyRunning = await checkServiceHealth(service)
    if (!isActuallyRunning) {
      service.status = 'stopped'
    }
  }

  return service.status
}

/**
 * List all services and their status
 */
export async function listServices(): Promise<ServiceInstance[]> {
  const manager = await getServiceManager()
  const services = Array.from(manager.services.values())

  // Update status for all services
  for (const service of services) {
    await checkServiceHealth(service)
  }

  return services
}

/**
 * Get or create a service instance
 */
async function getOrCreateServiceInstance(serviceName: string): Promise<ServiceInstance> {
  const manager = await getServiceManager()

  let service = manager.services.get(serviceName)
  if (service) {
    return service
  }

  const definition = getServiceDefinition(serviceName)
  if (!definition) {
    throw new Error(`Unknown service: ${serviceName}`)
  }

  // Create new service instance
  service = {
    definition,
    status: 'stopped',
    lastCheckedAt: new Date(),
    enabled: false,
    config: { ...definition.config },
  }

  manager.services.set(serviceName, service)
  return service
}

/**
 * Check if a service is initialized (data directory exists, etc.)
 */
async function isServiceInitialized(service: ServiceInstance): Promise<boolean> {
  const { definition } = service

  // Check if data directory exists and has content
  if (definition.dataDirectory) {
    const dataDir = service.dataDir || definition.dataDirectory
    if (!fs.existsSync(dataDir)) {
      return false
    }

    // For databases, check if data directory has initialization files
    if (definition.name === 'postgres') {
      return fs.existsSync(path.join(dataDir, 'PG_VERSION'))
    }
    else if (definition.name === 'mysql') {
      return fs.existsSync(path.join(dataDir, 'mysql'))
    }
  }

  return true
}

/**
 * Initialize a service (run init command if needed)
 */
async function initializeService(service: ServiceInstance): Promise<void> {
  const { definition } = service

  if (!definition.initCommand) {
    return
  }

  const dataDir = service.dataDir || definition.dataDirectory
  if (dataDir) {
    await fs.promises.mkdir(dataDir, { recursive: true })
  }

  // In test mode, skip actual initialization
  if (process.env.NODE_ENV === 'test' || process.env.LAUNCHPAD_TEST_MODE === 'true') {
    // Create mock initialization files for testing
    if (definition.name === 'postgres' && dataDir) {
      await fs.promises.writeFile(path.join(dataDir, 'PG_VERSION'), '14\n')
    }
    else if (definition.name === 'mysql' && dataDir) {
      await fs.promises.mkdir(path.join(dataDir, 'mysql'), { recursive: true })
    }
    return
  }

  // Resolve template variables in init command
  const resolvedArgs = definition.initCommand.map(arg =>
    arg
      .replace('{dataDir}', dataDir || '')
      .replace('{configFile}', service.configFile || definition.configFile || ''),
  )

  const [command, ...args] = resolvedArgs
  const executablePath = findBinaryInPath(command) || command

  return new Promise((resolve, reject) => {
    const proc = spawn(executablePath, args, {
      stdio: config.verbose ? 'inherit' : 'pipe',
      env: { ...process.env, ...definition.env },
      cwd: definition.workingDirectory || dataDir,
    })

    proc.on('close', (code) => {
      if (code === 0) {
        resolve()
      }
      else {
        reject(new Error(`Service initialization failed with exit code ${code}`))
      }
    })

    proc.on('error', reject)
  })
}

/**
 * Create service configuration files
 */
async function createServiceFiles(service: ServiceInstance): Promise<void> {
  const { definition } = service

  // Create configuration file if needed
  if (definition.configFile && !fs.existsSync(definition.configFile)) {
    const defaultConfig = createDefaultServiceConfig(definition.name)
    if (defaultConfig) {
      const configDir = path.dirname(definition.configFile)
      await fs.promises.mkdir(configDir, { recursive: true })
      await fs.promises.writeFile(definition.configFile, defaultConfig, 'utf8')

      if (config.verbose) {
        console.warn(`📝 Created configuration file: ${definition.configFile}`)
      }
    }
  }

  // Create data directory
  const dataDir = service.dataDir || definition.dataDirectory
  if (dataDir) {
    await fs.promises.mkdir(dataDir, { recursive: true })
  }

  // Create log directory
  const logDir = service.logFile ? path.dirname(service.logFile) : config.services.logDir
  await fs.promises.mkdir(logDir, { recursive: true })

  // Create platform-specific service files
  const currentPlatform = platform()

  if (currentPlatform === 'darwin') {
    const plist = generateLaunchdPlist(service)
    await writeLaunchdPlist(service, plist)
  }
  else if (currentPlatform === 'linux') {
    const systemdService = generateSystemdService(service)
    await writeSystemdService(service, systemdService)
  }
}

/**
 * Platform-specific service start
 */
async function startServicePlatform(service: ServiceInstance): Promise<boolean> {
  const currentPlatform = platform()

  if (currentPlatform === 'darwin') {
    return await startServiceLaunchd(service)
  }
  else if (currentPlatform === 'linux') {
    return await startServiceSystemd(service)
  }

  return false
}

/**
 * Platform-specific service stop
 */
async function stopServicePlatform(service: ServiceInstance): Promise<boolean> {
  const currentPlatform = platform()

  if (currentPlatform === 'darwin') {
    return await stopServiceLaunchd(service)
  }
  else if (currentPlatform === 'linux') {
    return await stopServiceSystemd(service)
  }

  return false
}

/**
 * Platform-specific service enable
 */
async function enableServicePlatform(service: ServiceInstance): Promise<boolean> {
  const currentPlatform = platform()

  if (currentPlatform === 'darwin') {
    return await enableServiceLaunchd(service)
  }
  else if (currentPlatform === 'linux') {
    return await enableServiceSystemd(service)
  }

  return false
}

/**
 * Platform-specific service disable
 */
async function disableServicePlatform(service: ServiceInstance): Promise<boolean> {
  const currentPlatform = platform()

  if (currentPlatform === 'darwin') {
    return await disableServiceLaunchd(service)
  }
  else if (currentPlatform === 'linux') {
    return await disableServiceSystemd(service)
  }

  return false
}

/**
 * Ensure service package and dependencies are installed
 */
async function ensureServicePackageInstalled(service: ServiceInstance): Promise<boolean> {
  const { definition } = service

  if (!definition.packageDomain) {
    // Service doesn't require a package (e.g., built-in services)
    return true
  }

  const { findBinaryInPath } = await import('../utils')

  // Check if main executable is already available
  if (findBinaryInPath(definition.executable)) {
    return true
  }

  console.warn(`📦 Installing ${definition.displayName} package...`)

  try {
    // Import install function to install service package with dependencies
    const { install } = await import('../install')

    // Install the main service package - this will automatically install all dependencies
    // thanks to our fixed dependency resolution
    const installPath = `${process.env.HOME}/.local`
    await install([definition.packageDomain], installPath)

    console.warn(`✅ ${definition.displayName} package installed successfully`)

    // Verify installation worked by checking in the Launchpad environment
    const binaryPath = findBinaryInEnvironment(definition.executable, installPath)
    if (!binaryPath) {
      throw new Error(`Executable ${definition.executable} not found after installation`)
    }

    return true
  }
  catch (error) {
    console.error(`❌ Failed to install ${definition.displayName}: ${error instanceof Error ? error.message : String(error)}`)
    return false
  }
}

/**
 * Ensure PHP database extensions are available and configured
 */
async function ensurePHPDatabaseExtensions(service: ServiceInstance): Promise<boolean> {
  // Skip PHP extension checks in test mode
  if (process.env.NODE_ENV === 'test' || process.env.LAUNCHPAD_TEST_MODE === 'true') {
    console.warn(`🧪 Test mode: Skipping PHP database extension checks`)
    return true
  }

  const { spawn } = await import('node:child_process')

  try {
    console.warn(`🔧 Checking PHP database extensions...`)

    // Check what extensions are currently loaded
    const phpProcess = spawn('php', ['-m'], { stdio: ['pipe', 'pipe', 'pipe'] })

    let output = ''
    let hasError = false

    phpProcess.stdout.on('data', (data) => {
      output += data.toString()
    })

    phpProcess.stderr.on('data', (data) => {
      console.error(`PHP extension check error: ${data.toString()}`)
      hasError = true
    })

    const checkResult = await new Promise<boolean>((resolve) => {
      phpProcess.on('close', (code) => {
        resolve(code === 0 && !hasError)
      })
    })

    if (!checkResult) {
      return false
    }

    const loadedExtensions = output.toLowerCase().split('\n').map(line => line.trim())
    const requiredExtensions = ['pdo', 'pdo_pgsql', 'pgsql', 'pdo_mysql', 'mysqli', 'pdo_sqlite']
    const missingExtensions = requiredExtensions.filter(ext => !loadedExtensions.includes(ext))

    if (missingExtensions.length === 0) {
      console.warn(`✅ All required PHP database extensions are available`)
      return true
    }

    console.warn(`⚠️  Missing PHP extensions: ${missingExtensions.join(', ')}`)

    // Check if PostgreSQL extensions are missing specifically
    const missingPgsqlExtensions = missingExtensions.filter(ext => ext.includes('pgsql'))
    if (missingPgsqlExtensions.length > 0) {
      console.warn(`⚠️  PostgreSQL extensions (${missingPgsqlExtensions.join(', ')}) are core PHP extensions`)
      console.warn(`💡 These extensions require PHP to be compiled with PostgreSQL support`)
      console.warn(`🔧 Setting up SQLite as the database for seamless development...`)

      // Automatically configure the project for SQLite
      const sqliteSetup = await setupSQLiteForProject()
      if (sqliteSetup) {
        console.warn(`✅ Project configured to use SQLite database`)
        console.warn(`💡 You can now run: php artisan migrate:fresh --seed`)
        return true
      }
      else {
        await suggestSQLiteAlternative()
      }
    }

    // Try to install other non-core extensions via PECL if any
    const nonCoreExtensions = missingExtensions.filter(ext => !['pdo_pgsql', 'pgsql', 'pdo_mysql', 'mysqli'].includes(ext))
    if (nonCoreExtensions.length > 0) {
      const installResult = await installMissingExtensionsViaPECL(service, nonCoreExtensions)
      if (installResult) {
        console.warn(`✅ Successfully installed additional PHP extensions via PECL`)
      }
    }

    // Try to enable missing extensions via php.ini configuration anyway
    const configResult = await createPHPConfigWithExtensions(service, missingExtensions)
    if (configResult) {
      console.warn(`📝 Created PHP configuration with database extensions`)
    }

    return configResult
  }
  catch (error) {
    console.error(`❌ Failed to check PHP extensions: ${error instanceof Error ? error.message : String(error)}`)
    return false
  }
}

/**
 * Install missing PHP extensions via PECL
 */
async function installMissingExtensionsViaPECL(service: ServiceInstance, missingExtensions: string[]): Promise<boolean> {
  try {
    const { spawn } = await import('node:child_process')
    const { definition } = service

    // Check if this service has PECL extension configuration
    if (!definition.extensions?.pecl) {
      return false
    }

    console.warn(`🔧 Attempting to install PHP extensions via PECL...`)

    // Filter to only install extensions that are defined in our configuration
    const installableExtensions = missingExtensions.filter(ext =>
      definition.extensions?.pecl?.required?.includes(ext)
      || definition.extensions?.pecl?.optional?.includes(ext),
    )

    if (installableExtensions.length === 0) {
      console.warn(`⚠️  No installable extensions found in PECL configuration`)
      return false
    }

    // Ensure build dependencies are installed first
    for (const extension of installableExtensions) {
      const buildDeps = definition.extensions?.pecl?.buildDependencies?.[extension] || []
      if (buildDeps.length > 0) {
        console.warn(`📦 Installing build dependencies for ${extension}: ${buildDeps.join(', ')}`)

        try {
          const { install } = await import('../install')
          await install(buildDeps, `${process.env.HOME}/.local`)
        }
        catch (depError) {
          console.warn(`⚠️  Could not install build dependencies for ${extension}: ${depError instanceof Error ? depError.message : String(depError)}`)
        }
      }
    }

    // Install extensions one by one
    let successCount = 0
    for (const extension of installableExtensions) {
      console.warn(`🔧 Installing ${extension} via PECL...`)

      await new Promise<boolean>((resolve) => {
        const peclProcess = spawn('pecl', ['install', extension], {
          stdio: ['pipe', 'pipe', 'pipe'],
          env: {
            ...process.env,
            // Ensure PECL can find PostgreSQL libraries
            PKG_CONFIG_PATH: `${process.env.HOME}/.local/postgresql.org/lib/pkgconfig:${process.env.PKG_CONFIG_PATH || ''}`,
            LD_LIBRARY_PATH: `${process.env.HOME}/.local/postgresql.org/lib:${process.env.LD_LIBRARY_PATH || ''}`,
            DYLD_LIBRARY_PATH: `${process.env.HOME}/.local/postgresql.org/lib:${process.env.DYLD_LIBRARY_PATH || ''}`,
          },
        })

        let _output = ''
        let errorOutput = ''

        peclProcess.stdout.on('data', (data) => {
          _output += data.toString()
        })

        peclProcess.stderr.on('data', (data) => {
          errorOutput += data.toString()
        })

        peclProcess.on('close', (code) => {
          if (code === 0) {
            console.warn(`✅ Successfully installed ${extension}`)
            successCount++
            resolve(true)
          }
          else {
            console.warn(`❌ Failed to install ${extension}: ${errorOutput}`)
            resolve(false)
          }
        })

        // Auto-answer any prompts (like "press [Enter] to continue")
        peclProcess.stdin.write('\n')
        peclProcess.stdin.end()
      })
    }

    if (successCount > 0) {
      console.warn(`✅ Installed ${successCount}/${installableExtensions.length} PHP extensions`)

      // Update PHP configuration to load the new extensions
      await updatePHPConfigWithInstalledExtensions(service, installableExtensions.slice(0, successCount))

      return successCount === installableExtensions.length
    }

    return false
  }
  catch (error) {
    console.error(`❌ Failed to install PHP extensions via PECL: ${error instanceof Error ? error.message : String(error)}`)
    return false
  }
}

/**
 * Update PHP configuration to load newly installed extensions
 */
async function updatePHPConfigWithInstalledExtensions(service: ServiceInstance, installedExtensions: string[]): Promise<void> {
  // Skip PHP config updates in test mode
  if (process.env.NODE_ENV === 'test' || process.env.LAUNCHPAD_TEST_MODE === 'true') {
    console.warn(`🧪 Test mode: Skipping PHP configuration updates`)
    return
  }

  try {
    if (!service.definition.configFile) {
      return
    }

    // Get the PHP extension directory
    const { spawn } = await import('node:child_process')
    const extDir = await new Promise<string>((resolve) => {
      const phpProcess = spawn('php', ['-i'], { stdio: ['pipe', 'pipe', 'pipe'] })
      let output = ''

      phpProcess.stdout.on('data', (data) => {
        output += data.toString()
      })

      phpProcess.on('close', () => {
        const match = output.match(/extension_dir => (.+)/i)
        resolve(match ? match[1].trim() : '')
      })
    })

    if (!extDir) {
      console.warn(`⚠️  Could not determine PHP extension directory`)
      return
    }

    // Read current php.ini
    let phpIniContent = ''
    try {
      phpIniContent = await fs.promises.readFile(service.definition.configFile, 'utf8')
    }
    catch {
      // File doesn't exist, create it
      phpIniContent = createDefaultServiceConfig('php') || ''
    }

    // Add extension entries for newly installed extensions
    if (!phpIniContent.includes('extension_dir')) {
      phpIniContent = `extension_dir = "${extDir}"\n\n${phpIniContent}`
    }

    // Add the new extensions if they're not already there
    for (const ext of installedExtensions) {
      if (!phpIniContent.includes(`extension=${ext}`)) {
        phpIniContent += `\nextension=${ext}.so`
      }
    }

    await fs.promises.writeFile(service.definition.configFile, phpIniContent, 'utf8')
    console.warn(`📝 Updated PHP configuration to load new extensions`)
  }
  catch (error) {
    console.warn(`⚠️  Could not update PHP configuration: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Automatically set up SQLite for the current project
 */
export async function setupSQLiteForProject(): Promise<boolean> {
  try {
    console.warn(`🔧 Configuring project for SQLite...`)

    // Get SQLite path from .env if it exists, otherwise use default
    let sqliteDbPath = 'database/database.sqlite'

    if (fs.existsSync('.env')) {
      const envContent = fs.readFileSync('.env', 'utf-8')
      const dbDatabaseMatch = envContent.match(/^DB_DATABASE=(.*)$/m)

      if (dbDatabaseMatch && dbDatabaseMatch[1]) {
        let envDbPath = dbDatabaseMatch[1].trim()
        // Remove quotes if present
        if ((envDbPath.startsWith('"') && envDbPath.endsWith('"'))
          || (envDbPath.startsWith('\'') && envDbPath.endsWith('\''))) {
          envDbPath = envDbPath.slice(1, -1)
        }
        sqliteDbPath = envDbPath
      }
    }

    // Ensure path is relative to project root
    if (path.isAbsolute(sqliteDbPath)) {
      sqliteDbPath = path.relative(process.cwd(), sqliteDbPath)
    }

    const dbDir = path.dirname(sqliteDbPath)

    await fs.promises.mkdir(dbDir, { recursive: true })
    if (!fs.existsSync(sqliteDbPath)) {
      await fs.promises.writeFile(sqliteDbPath, '', 'utf8')
      console.warn(`✅ Created SQLite database file: ${sqliteDbPath}`)
    }

    // Update .env file if it exists
    if (fs.existsSync('.env')) {
      let envContent = await fs.promises.readFile('.env', 'utf8')
      let modified = false

      // Update DB_CONNECTION to sqlite
      if (envContent.includes('DB_CONNECTION=')) {
        envContent = envContent.replace(/DB_CONNECTION=.*/g, 'DB_CONNECTION=sqlite')
        modified = true
      }
      else {
        envContent += '\nDB_CONNECTION=sqlite'
        modified = true
      }

      // Set or update DB_DATABASE path
      if (envContent.includes('DB_DATABASE=')) {
        envContent = envContent.replace(/DB_DATABASE=.*/g, `DB_DATABASE=${sqliteDbPath}`)
      }
      else {
        envContent += `\nDB_DATABASE=${sqliteDbPath}`
        modified = true
      }

      // Comment out PostgreSQL-specific settings
      envContent = envContent.replace(/^(DB_HOST=.*)/gm, '# $1')
      envContent = envContent.replace(/^(DB_PORT=.*)/gm, '# $1')
      envContent = envContent.replace(/^(DB_USERNAME=.*)/gm, '# $1')
      envContent = envContent.replace(/^(DB_PASSWORD=.*)/gm, '# $1')

      if (modified) {
        await fs.promises.writeFile('.env', envContent, 'utf8')
        console.warn(`✅ Updated .env file to use SQLite`)
      }
    }

    // Try to run Laravel configuration cache clear (skip in test mode)
    if (process.env.NODE_ENV !== 'test' && process.env.LAUNCHPAD_TEST_MODE !== 'true') {
      try {
        const { spawn } = await import('node:child_process')
        await new Promise<void>((resolve) => {
          const configClear = spawn('php', ['artisan', 'config:clear'], { stdio: 'pipe' })
          configClear.on('close', () => resolve())
        })
        console.warn(`✅ Cleared Laravel configuration cache`)
      }
      catch {
        // Ignore errors - config:clear is not critical
      }
    }
    else {
      console.warn(`🧪 Test mode: Skipping Laravel config cache clear`)
    }

    return true
  }
  catch (error) {
    console.warn(`⚠️  Could not set up SQLite automatically: ${error instanceof Error ? error.message : String(error)}`)
    return false
  }
}

/**
 * Suggest SQLite as an alternative when PostgreSQL extensions are missing
 */
async function suggestSQLiteAlternative(): Promise<void> {
  try {
    // Check if this is a Laravel project
    if (fs.existsSync('artisan')) {
      console.warn(`💡 For Laravel projects, you can use SQLite with these commands:`)
      console.warn(`   php artisan migrate:fresh --seed --database=sqlite`)
      console.warn(`   Or configure SQLite in .env:`)
      console.warn(`   DB_CONNECTION=sqlite`)
      console.warn(`   DB_DATABASE=database/database.sqlite`)

      // Check if SQLite database file exists, create if not
      const sqliteDbPath = 'database/database.sqlite'
      if (!fs.existsSync(sqliteDbPath)) {
        try {
          await fs.promises.mkdir('database', { recursive: true })
          await fs.promises.writeFile(sqliteDbPath, '', 'utf8')
          console.warn(`✅ Created SQLite database file: ${sqliteDbPath}`)
        }
        catch (error) {
          console.warn(`⚠️  Could not create SQLite database file: ${error instanceof Error ? error.message : String(error)}`)
        }
      }
    }
  }
  catch (error) {
    console.warn(`⚠️  Could not suggest SQLite alternative: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Create PHP configuration file with database extensions enabled
 */
async function createPHPConfigWithExtensions(service: ServiceInstance, _missingExtensions: string[]): Promise<boolean> {
  try {
    const configDir = path.dirname(service.definition.configFile || '')
    await fs.promises.mkdir(configDir, { recursive: true })

    // Create sessions and tmp directories
    const sessionsDir = path.join(configDir, 'sessions')
    const tmpDir = path.join(configDir, 'tmp')
    await fs.promises.mkdir(sessionsDir, { recursive: true })
    await fs.promises.mkdir(tmpDir, { recursive: true })

    // Generate php.ini with extensions
    const phpIniContent = createDefaultServiceConfig('php')
    if (phpIniContent && service.definition.configFile) {
      await fs.promises.writeFile(service.definition.configFile, phpIniContent, 'utf8')

      // Set PHP to use our custom php.ini file
      process.env.PHPRC = path.dirname(service.definition.configFile)

      console.warn(`📝 Created PHP configuration at: ${service.definition.configFile}`)
      return true
    }

    return false
  }
  catch (error) {
    console.error(`❌ Failed to create PHP configuration: ${error instanceof Error ? error.message : String(error)}`)
    return false
  }
}

/**
 * Check if PHP is installed and install PostgreSQL extensions if needed
 */
async function checkAndInstallPHPPostgreSQLExtensions(): Promise<void> {
  // Skip PHP PostgreSQL extension checks in test mode
  if (process.env.NODE_ENV === 'test' || process.env.LAUNCHPAD_TEST_MODE === 'true') {
    console.warn(`🧪 Test mode: Skipping PHP PostgreSQL extension checks`)
    return
  }

  try {
    const { findBinaryInPath } = await import('../utils')

    // Check if PHP is installed
    if (!findBinaryInPath('php')) {
      return // PHP not installed, nothing to do
    }

    // Check if PHP is missing PostgreSQL extensions
    const { spawn } = await import('node:child_process')

    const phpProcess = spawn('php', ['-m'], { stdio: ['pipe', 'pipe', 'pipe'] })
    let output = ''

    phpProcess.stdout.on('data', (data) => {
      output += data.toString()
    })

    const checkResult = await new Promise<boolean>((resolve) => {
      phpProcess.on('close', (code) => {
        resolve(code === 0)
      })
    })

    if (!checkResult) {
      return
    }

    const loadedExtensions = output.toLowerCase().split('\n').map(line => line.trim())
    const missingPgsqlExtensions = ['pdo_pgsql', 'pgsql'].filter(ext => !loadedExtensions.includes(ext))

    if (missingPgsqlExtensions.length > 0) {
      console.warn(`🔧 PostgreSQL is starting - checking if PHP needs PostgreSQL extensions...`)
      console.warn(`⚠️  PHP is missing PostgreSQL extensions: ${missingPgsqlExtensions.join(', ')}`)
      console.warn(`🔧 Attempting to install PHP PostgreSQL extensions via PECL...`)

      // Get PHP service definition to install extensions
      const phpService = await getOrCreateServiceInstance('php')
      if (phpService.definition.extensions?.pecl) {
        const installResult = await installMissingExtensionsViaPECL(phpService, missingPgsqlExtensions)
        if (installResult) {
          console.warn(`✅ Successfully installed PHP PostgreSQL extensions`)
          console.warn(`💡 You can now use PostgreSQL with PHP in your Laravel projects`)
        }
        else {
          console.warn(`⚠️  Could not install PHP PostgreSQL extensions automatically`)
          console.warn(`💡 Consider using SQLite as an alternative: DB_CONNECTION=sqlite`)
        }
      }
    }
    else {
      console.warn(`✅ PHP already has PostgreSQL extensions installed`)
    }
  }
  catch (error) {
    console.warn(`⚠️  Could not check PHP PostgreSQL extensions: ${error instanceof Error ? error.message : String(error)}`)
  }
}

/**
 * Auto-initialize databases on first start
 */
async function autoInitializeDatabase(service: ServiceInstance): Promise<boolean> {
  const { definition } = service

  // PostgreSQL auto-initialization
  if (definition.name === 'postgres' || definition.name === 'postgresql') {
    const dataDir = service.dataDir || path.join(process.env.HOME || '', '.local', 'share', 'launchpad', 'postgres-data')
    const pgVersionFile = path.join(dataDir, 'PG_VERSION')

    // Check if already initialized
    if (fs.existsSync(pgVersionFile)) {
      return true
    }

    console.log('🔧 Initializing PostgreSQL database cluster...')

    try {
      // Initialize database
      const { execSync } = await import('node:child_process')
      const fs = await import('node:fs')
      const path = await import('node:path')
      const { homedir } = await import('node:os')

      // Create data directory
      fs.mkdirSync(dataDir, { recursive: true })

      // Look for project-specific environment directory
      const projectName = path.basename(process.cwd()).toLowerCase().replace(/[^a-z0-9]/g, '_')
      const launchpadEnvs = path.join(homedir(), '.local', 'share', 'launchpad', 'envs')

      let initdbPath: string | null = null

      try {
        // Find matching environment directory
        const envDirs = fs.readdirSync(launchpadEnvs).filter((dir: string) =>
          dir.toLowerCase().includes(projectName),
        )

        for (const dir of envDirs) {
          const potentialPath = path.join(launchpadEnvs, dir, 'postgresql.org', 'v17.2.0', 'bin', 'initdb')
          if (fs.existsSync(potentialPath)) {
            initdbPath = potentialPath
            break
          }
        }
      }
      catch {
        // Ignore errors
      }

      if (config.verbose) {
        console.log(`Looking for initdb binary, found: ${initdbPath}`)
      }

      if (!initdbPath) {
        // Fallback to system PATH
        const { findBinaryInPath } = await import('../utils')
        initdbPath = findBinaryInPath('initdb')
        if (initdbPath) {
          console.log('Using system initdb binary')
        }
        else {
          throw new Error('initdb binary not found in environment or system PATH')
        }
      }

      const command = initdbPath ? `"${initdbPath}"` : 'initdb'

      // Set up environment for PostgreSQL with proper library paths
      const env = { ...process.env }
      if (initdbPath) {
        const binDir = path.dirname(initdbPath)
        const pgRoot = path.dirname(binDir)
        const libDir = path.join(pgRoot, 'lib')

        // Also add Unicode.org lib paths from the environment
        const envRoot = path.dirname(path.dirname(pgRoot))
        const unicodeLib = path.join(envRoot, 'unicode.org', 'v73', 'lib')
        const unicodeLibFallback = path.join(envRoot, 'unicode.org', 'v71.1.0', 'lib')

        // Set library paths for macOS
        const existingDyldPath = env.DYLD_LIBRARY_PATH || ''
        const libPaths = [libDir]

        if (fs.existsSync(unicodeLib)) {
          libPaths.push(unicodeLib)
        }
        else if (fs.existsSync(unicodeLibFallback)) {
          libPaths.push(unicodeLibFallback)
        }

        env.DYLD_LIBRARY_PATH = libPaths.join(':') + (existingDyldPath ? `:${existingDyldPath}` : '')

        if (config.verbose) {
          console.log(`Setting DYLD_LIBRARY_PATH: ${env.DYLD_LIBRARY_PATH}`)
        }
      }

      execSync(`${command} -D "${dataDir}" --auth-local=trust --auth-host=md5`, {
        stdio: config.verbose ? 'inherit' : 'pipe',
        timeout: 60000,
        env,
      })

      console.log('✅ PostgreSQL database cluster initialized')
      return true
    }
    catch (error) {
      console.error(`❌ Failed to initialize PostgreSQL: ${error instanceof Error ? error.message : String(error)}`)
      return false
    }
  }

  // MySQL auto-initialization
  if (definition.name === 'mysql' || definition.name === 'mariadb') {
    const dataDir = service.dataDir || path.join(process.env.HOME || '', '.local', 'share', 'launchpad', 'mysql-data')
    const mysqlDir = path.join(dataDir, 'mysql')

    // Check if already initialized
    if (fs.existsSync(mysqlDir)) {
      return true
    }

    console.log('🔧 Initializing MySQL database...')

    try {
      // Create data directory
      fs.mkdirSync(dataDir, { recursive: true })

      // Initialize database
      const { execSync } = await import('node:child_process')
      execSync(`mysql_install_db --datadir="${dataDir}" --auth-root-authentication-method=normal`, {
        stdio: config.verbose ? 'inherit' : 'pipe',
        timeout: 60000,
      })

      console.log('✅ MySQL database initialized')
      return true
    }
    catch (error) {
      console.error(`❌ Failed to initialize MySQL: ${error instanceof Error ? error.message : String(error)}`)
      return false
    }
  }

  return true
}

/**
 * Execute post-start commands for service setup
 */
async function executePostStartCommands(service: ServiceInstance): Promise<void> {
  const { definition } = service

  if (!definition.postStartCommands || definition.postStartCommands.length === 0) {
    return
  }

  // Wait for the service to be fully ready, especially for databases
  if (definition.name === 'postgres' || definition.name === 'mysql') {
    // For databases, wait longer in CI environments and check if they're actually ready
    const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true'
    const waitTime = isCI ? 10000 : 5000 // 10s in CI, 5s locally
    await new Promise(resolve => setTimeout(resolve, waitTime))

    // Try to verify the service is responding before running post-start commands
    if (definition.healthCheck) {
      for (let i = 0; i < 5; i++) {
        try {
          const healthResult = await checkServiceHealth(service)
          if (healthResult)
            break
        }
        catch {
          // Health check failed, wait a bit more
          await new Promise(resolve => setTimeout(resolve, 1000))
        }
      }
    }
  }
  else {
    // For other services, use the original wait time
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  for (const commandTemplate of definition.postStartCommands) {
    try {
      // Resolve template variables
      const resolvedCommand = commandTemplate.map(arg => resolveServiceTemplateVariables(arg, service))

      const [command, ...args] = resolvedCommand
      const executablePath = findBinaryInPath(command) || command

      if (config.verbose) {
        console.warn(`📋 Executing post-start command: ${resolvedCommand.join(' ')}`)
      }

      await new Promise<void>((resolve, _reject) => {
        const proc = spawn(executablePath, args, {
          stdio: config.verbose ? 'inherit' : 'pipe',
          env: { ...process.env, ...definition.env },
        })

        // Add timeout for post-start commands (30 seconds max)
        const timeout = setTimeout(() => {
          if (config.verbose) {
            console.warn(`⚠️ Post-start command timed out after 30s: ${resolvedCommand.join(' ')}`)
          }
          proc.kill('SIGTERM')
          resolve()
        }, 30000)

        proc.on('close', (code) => {
          clearTimeout(timeout)
          if (code === 0) {
            resolve()
          }
          else {
            // Don't fail the service start for post-start command failures
            // These are often optional setup commands
            if (config.verbose) {
              console.warn(`⚠️ Post-start command failed with exit code ${code}: ${resolvedCommand.join(' ')}`)
            }
            resolve()
          }
        })

        proc.on('error', (error) => {
          clearTimeout(timeout)
          if (config.verbose) {
            console.warn(`⚠️ Post-start command error: ${error.message}`)
          }
          resolve()
        })
      })
    }
    catch (error) {
      if (config.verbose) {
        console.warn(`⚠️ Failed to execute post-start command: ${error instanceof Error ? error.message : String(error)}`)
      }
    }
  }
}

/**
 * Resolve template variables in service configuration
 */
export function resolveServiceTemplateVariables(template: string, service: ServiceInstance): string {
  const { definition } = service
  const dataDir = service.dataDir || definition.dataDirectory
  const configFile = service.configFile || definition.configFile
  const logFile = service.logFile || definition.logFile
  const port = definition.port

  // Detect project name from current working directory
  const projectName = detectProjectName()

  // Get database name from .env file if available, otherwise use project name
  const databaseName = getDatabaseNameFromEnv() || projectName

  // Get service config with defaults
  const serviceConfig = { ...definition.config, ...service.config }

  let resolved = template
    .replace('{dataDir}', dataDir || '')
    .replace('{configFile}', configFile || '')
    .replace('{logFile}', logFile || '')
    .replace('{pidFile}', definition.pidFile || '')
    .replace('{port}', String(port || 5432))
    .replace('{projectName}', projectName)
    .replace('{projectDatabase}', databaseName) // Use env database name or project name
    .replace('{dbUsername}', config.services.database.username)
    .replace('{dbPassword}', config.services.database.password)
    .replace('{authMethod}', config.services.database.authMethod)

  // Replace service-specific config variables
  for (const [key, value] of Object.entries(serviceConfig)) {
    resolved = resolved.replace(new RegExp(`{${key}}`, 'g'), String(value))
  }

  return resolved
}

/**
 * Detect project name from current directory or composer.json
 */
export function detectProjectName(): string {
  try {
    // Try to read composer.json for Laravel/PHP projects
    const composerPath = path.join(process.cwd(), 'composer.json')
    if (fs.existsSync(composerPath)) {
      const composer = JSON.parse(fs.readFileSync(composerPath, 'utf-8'))
      if (composer.name) {
        // Convert "vendor/project-name" to "project_name"
        return composer.name.split('/').pop()?.replace(/[^a-z0-9]/gi, '_') || 'launchpad_dev'
      }
    }

    // Try to read package.json for Node.js projects
    const packagePath = path.join(process.cwd(), 'package.json')
    if (fs.existsSync(packagePath)) {
      const packageJson = JSON.parse(fs.readFileSync(packagePath, 'utf-8'))
      if (packageJson.name) {
        // Handle scoped packages like "@org/project-name" -> "project_name"
        const name = packageJson.name.startsWith('@')
          ? packageJson.name.split('/').pop()
          : packageJson.name
        return name?.replace(/[^a-z0-9]/gi, '_') || 'launchpad_dev'
      }
    }

    // Fallback to directory name
    return path.basename(process.cwd()).replace(/[^a-z0-9]/gi, '_') || 'launchpad_dev'
  }
  catch {
    return 'launchpad_dev'
  }
}

/**
 * Get database name from Laravel .env file
 */
export function getDatabaseNameFromEnv(): string | null {
  try {
    const envPath = path.join(process.cwd(), '.env')
    if (!fs.existsSync(envPath)) {
      return null
    }

    const envContent = fs.readFileSync(envPath, 'utf-8')
    const dbDatabaseMatch = envContent.match(/^DB_DATABASE=(.*)$/m)

    if (dbDatabaseMatch && dbDatabaseMatch[1]) {
      let dbName = dbDatabaseMatch[1].trim()
      // Remove quotes if present
      if ((dbName.startsWith('"') && dbName.endsWith('"'))
        || (dbName.startsWith('\'') && dbName.endsWith('\''))) {
        dbName = dbName.slice(1, -1)
      }
      // Convert to valid database name (remove special characters)
      return dbName.replace(/\W/g, '_')
    }

    return null
  }
  catch {
    return null
  }
}

// macOS launchd implementations

async function startServiceLaunchd(service: ServiceInstance): Promise<boolean> {
  // In test mode, mock successful operation
  if (process.env.NODE_ENV === 'test' || process.env.LAUNCHPAD_TEST_MODE === 'true') {
    return true
  }

  return new Promise((resolve) => {
    const proc = spawn('launchctl', ['load', '-w', getServiceFilePath(service.definition.name)!], {
      stdio: config.verbose ? 'inherit' : 'pipe',
    })

    proc.on('close', (code) => {
      resolve(code === 0)
    })

    proc.on('error', () => {
      resolve(false)
    })
  })
}

async function stopServiceLaunchd(service: ServiceInstance): Promise<boolean> {
  // In test mode, mock successful operation
  if (process.env.NODE_ENV === 'test' || process.env.LAUNCHPAD_TEST_MODE === 'true') {
    return true
  }

  return new Promise((resolve) => {
    const proc = spawn('launchctl', ['unload', '-w', getServiceFilePath(service.definition.name)!], {
      stdio: config.verbose ? 'inherit' : 'pipe',
    })

    proc.on('close', (code) => {
      resolve(code === 0)
    })

    proc.on('error', () => {
      resolve(false)
    })
  })
}

async function enableServiceLaunchd(_service: ServiceInstance): Promise<boolean> {
  // For launchd, enabling is handled by the RunAtLoad property in the plist
  // In test mode or normal mode, this always succeeds
  return true
}

async function disableServiceLaunchd(service: ServiceInstance): Promise<boolean> {
  // Stop and unload the service
  return await stopServiceLaunchd(service)
}

// Linux systemd implementations

async function startServiceSystemd(service: ServiceInstance): Promise<boolean> {
  // In test mode, mock successful operation
  if (process.env.NODE_ENV === 'test' || process.env.LAUNCHPAD_TEST_MODE === 'true') {
    return true
  }

  const serviceName = `launchpad-${service.definition.name}.service`

  return new Promise((resolve) => {
    const proc = spawn('systemctl', ['--user', 'start', serviceName], {
      stdio: config.verbose ? 'inherit' : 'pipe',
    })

    proc.on('close', (code) => {
      resolve(code === 0)
    })

    proc.on('error', () => {
      resolve(false)
    })
  })
}

async function stopServiceSystemd(service: ServiceInstance): Promise<boolean> {
  // In test mode, mock successful operation
  if (process.env.NODE_ENV === 'test' || process.env.LAUNCHPAD_TEST_MODE === 'true') {
    return true
  }

  const serviceName = `launchpad-${service.definition.name}.service`

  return new Promise((resolve) => {
    const proc = spawn('systemctl', ['--user', 'stop', serviceName], {
      stdio: config.verbose ? 'inherit' : 'pipe',
    })

    proc.on('close', (code) => {
      resolve(code === 0)
    })

    proc.on('error', () => {
      resolve(false)
    })
  })
}

async function enableServiceSystemd(service: ServiceInstance): Promise<boolean> {
  // In test mode, mock successful operation
  if (process.env.NODE_ENV === 'test' || process.env.LAUNCHPAD_TEST_MODE === 'true') {
    return true
  }

  const serviceName = `launchpad-${service.definition.name}.service`

  return new Promise((resolve) => {
    const proc = spawn('systemctl', ['--user', 'enable', serviceName], {
      stdio: config.verbose ? 'inherit' : 'pipe',
    })

    proc.on('close', (code) => {
      resolve(code === 0)
    })

    proc.on('error', () => {
      resolve(false)
    })
  })
}

async function disableServiceSystemd(service: ServiceInstance): Promise<boolean> {
  // In test mode, mock successful operation
  if (process.env.NODE_ENV === 'test' || process.env.LAUNCHPAD_TEST_MODE === 'true') {
    return true
  }

  const serviceName = `launchpad-${service.definition.name}.service`

  return new Promise((resolve) => {
    const proc = spawn('systemctl', ['--user', 'disable', serviceName], {
      stdio: config.verbose ? 'inherit' : 'pipe',
    })

    proc.on('close', (code) => {
      resolve(code === 0)
    })

    proc.on('error', () => {
      resolve(false)
    })
  })
}

/**
 * Check service health using the health check configuration
 */
async function checkServiceHealth(service: ServiceInstance): Promise<boolean> {
  const { definition } = service

  // In test mode, mock healthy service
  if (process.env.NODE_ENV === 'test' || process.env.LAUNCHPAD_TEST_MODE === 'true') {
    service.lastCheckedAt = new Date()
    return true
  }

  if (!definition.healthCheck) {
    // If no health check is defined, assume the service is healthy if it has a PID
    return service.pid !== undefined
  }

  const { command, expectedExitCode, timeout } = definition.healthCheck

  return new Promise((resolve) => {
    const [cmd, ...args] = command
    const executablePath = findBinaryInPath(cmd) || cmd

    const proc = spawn(executablePath, args, {
      stdio: 'pipe',
      timeout: timeout * 1000,
    })

    proc.on('close', (code) => {
      const isHealthy = code === expectedExitCode
      service.lastCheckedAt = new Date()
      resolve(isHealthy)
    })

    proc.on('error', () => {
      service.lastCheckedAt = new Date()
      resolve(false)
    })
  })
}

/**
 * Get the PID of a running service
 */
async function getServicePid(service: ServiceInstance): Promise<number | undefined> {
  const { definition } = service

  // In test environment, return mock PID
  if (process.env.NODE_ENV === 'test' || process.env.VITEST === 'true') {
    return 12345
  }

  // Try to read PID from PID file
  if (definition.pidFile && fs.existsSync(definition.pidFile)) {
    try {
      const pidContent = await fs.promises.readFile(definition.pidFile, 'utf8')
      const pid = Number.parseInt(pidContent.trim(), 10)
      if (!Number.isNaN(pid)) {
        return pid
      }
    }
    catch {
      // Ignore errors reading PID file
    }
  }

  // Try to find process by name with timeout
  try {
    const { execSync } = await import('node:child_process')
    const output = execSync(`pgrep -f "${definition.executable}"`, {
      encoding: 'utf8',
      timeout: 5000, // 5 second timeout
    })
    const pids = output.trim().split('\n').map(line => Number.parseInt(line.trim(), 10))
    return pids[0]
  }
  catch {
    // Process not found or command timed out
    return undefined
  }
}
