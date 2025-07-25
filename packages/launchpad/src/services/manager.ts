/* eslint-disable no-console */
import type { ServiceInstance, ServiceManagerState, ServiceOperation, ServiceStatus } from '../types'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import { platform } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { config } from '../config'
import { findBinaryInPath } from '../utils'
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
      // Create data directory
      fs.mkdirSync(dataDir, { recursive: true })

      // Initialize database
      const { execSync } = await import('node:child_process')
      execSync(`initdb -D "${dataDir}" --auth-local=trust --auth-host=md5`, {
        stdio: config.verbose ? 'inherit' : 'pipe',
        timeout: 60000,
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
function resolveServiceTemplateVariables(template: string, service: ServiceInstance): string {
  const { definition } = service
  const dataDir = service.dataDir || definition.dataDirectory
  const configFile = service.configFile || definition.configFile
  const logFile = service.logFile || definition.logFile
  const port = definition.port

  // Get service config with defaults
  const serviceConfig = { ...definition.config, ...service.config }

  let resolved = template
    .replace('{dataDir}', dataDir || '')
    .replace('{configFile}', configFile || '')
    .replace('{logFile}', logFile || '')
    .replace('{pidFile}', definition.pidFile || '')
    .replace('{port}', String(port || 5432))

  // Replace service-specific config variables
  for (const [key, value] of Object.entries(serviceConfig)) {
    resolved = resolved.replace(new RegExp(`{${key}}`, 'g'), String(value))
  }

  return resolved
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
