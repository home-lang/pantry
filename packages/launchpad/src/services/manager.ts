/* eslint-disable no-console */
import type { ServiceInstance, ServiceManagerState, ServiceOperation, ServiceStatus } from '../types'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import { homedir, platform } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { config } from '../config'
import { install } from '../install-main'
import { logUniqueMessage } from '../logging'
import { findBinaryInEnvironment, findBinaryInPath } from '../utils'
import { createDefaultServiceConfig, getServiceDefinition } from './definitions'
import { generateLaunchdPlist, generateSystemdService, getServiceFilePath, isPlatformSupported, writeLaunchdPlist, writeSystemdService } from './platform'

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
  const servicesConfig = config.services
  if (!servicesConfig) {
    throw new Error('Services configuration not found')
  }

  const dirs = [
    servicesConfig.dataDir,
    servicesConfig.logDir,
    servicesConfig.configDir,
  ].filter(Boolean) as string[]

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
    status: 'pending',
  }

  // In test mode, still validate service exists but mock the actual operation
  // Skip test mode for E2E validation tests
  if ((process.env.NODE_ENV === 'test' || process.env.LAUNCHPAD_TEST_MODE === 'true') && !process.env.LAUNCHPAD_E2E_TEST) {
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
      operation.error = String(error)
      operation.duration = 0
      manager.operations.push(operation)
      return false
    }
  }

  try {
    const service = await getOrCreateServiceInstance(serviceName)

    if (service.status === 'running') {
      // Verify actual health with a couple retries to avoid false negatives
      let healthy = await checkServiceHealth(service)
      if (!healthy) {
        await new Promise(r => setTimeout(r, 500))
        healthy = await checkServiceHealth(service)
      }
      if (healthy) {
        logUniqueMessage(`✅ Service ${serviceName} is already running`, true)
        operation.result = 'success'
        operation.duration = 0
        manager.operations.push(operation)
        return true
      }
      else {
        logUniqueMessage(`⚠️  ${service.definition?.displayName || serviceName} reported running but appears unhealthy. Attempting gentle restart...`, true)
        await stopService(serviceName)
        // fall through to start flow
      }
    }

    logUniqueMessage(`🚀 Starting ${service.definition?.displayName || serviceName}...`, true)

    // Update status to starting
    service.status = 'starting'
    service.lastCheckedAt = new Date()
    service.startedAt = new Date()

    // Install service package and dependencies if needed
    const installResult = await ensureServicePackageInstalled(service)
    if (!installResult) {
      console.error(`❌ Failed to install ${service.definition?.displayName || serviceName} package`)
      operation.result = 'failure'
      operation.error = 'Package installation failed'
      manager.operations.push(operation)
      return false
    }


    // Auto-initialize databases first
    const autoInitResult = await autoInitializeDatabase(service)
    if (!autoInitResult) {
      console.error(`❌ Failed to auto-initialize ${service.definition?.displayName || serviceName}`)
      operation.result = 'failure'
      operation.error = 'Auto-initialization failed'
      manager.operations.push(operation)
      return false
    }

    // Initialize service if needed
    if (service.definition?.initCommand && !await isServiceInitialized(service)) {
      console.warn(`🔧 Initializing ${service.definition?.displayName || serviceName}...`)
      await initializeService(service)
    }

    // Create/update service files
    await createServiceFiles(service)

    // Provide template variables for postgres commands
    if (service.definition?.name === 'postgres') {
      const projectName = detectProjectName()
      service.config = {
        ...(service.config || {}),
        projectDatabase: projectName.replace(/\W/g, '_'),
        appUser: 'postgres',
        appPassword: '',
      }
    }

    // Start the service using platform-specific method
    let startSuccess = await startServicePlatform(service)
    if (!startSuccess && service.definition?.name === 'postgres') {
      // Fallback: start with pg_ctl in the foreground and wait
      try {
        const { findBinaryInPath } = await import('../utils')
        const pgCtl = findBinaryInPath('pg_ctl') || 'pg_ctl'
        const dataDir = service.dataDir || service.definition.dataDirectory
        const port = service.definition.port || 5432
        const extraArgs = `-p ${port} -c listen_addresses=127.0.0.1`
        console.warn('⚠️  launchd/system start failed; falling back to pg_ctl start')
        await new Promise<void>((resolve, reject) => {
          // Use -l to redirect logs, don't use -w to avoid hanging
          const logFile = service.logFile || service.definition.logFile
          const proc = spawn(pgCtl, ['-D', String(dataDir), '-o', extraArgs, '-l', logFile || '/dev/null', 'start'], {
            stdio: config.verbose ? 'inherit' : 'pipe',
          })

          // Add timeout for pg_ctl start (5 seconds should be enough without -w)
          const timeout = setTimeout(() => {
            proc.kill('SIGTERM')
            reject(new Error('pg_ctl start timed out after 5s'))
          }, 5000)

          proc.on('close', (code) => {
            clearTimeout(timeout)
            if (code === 0)
              resolve()
            else reject(new Error(`pg_ctl start failed with exit ${code}`))
          })
          proc.on('error', (err) => {
            clearTimeout(timeout)
            reject(err)
          })
        })
        startSuccess = true
      }
      catch (e) {
        console.error(`❌ Fallback start failed: ${e instanceof Error ? e.message : String(e)}`)
      }
    }
    if (!startSuccess && (service.definition?.name === 'mysql' || service.definition?.name === 'mariadb')) {
      // Fallback: start mysqld directly with explicit DYLD_LIBRARY_PATH
      try {
        const { findBinaryInPath } = await import('../utils')
        // Use the actual mysqld binary, not the shim
        const mysqldPath = service.definition.executable.includes('mysql.com')
          ? service.definition.executable
          : path.join(homedir(), '.local', 'mysql.com', 'v8.4.6', 'bin', 'mysqld')

        const dataDir = service.dataDir || service.definition.dataDirectory
        const pidFile = service.definition.pidFile
        const port = service.definition.port || 3306

        console.warn('⚠️  launchd/system start failed; falling back to direct mysqld start')

        // Get the library path from MySQL's installation directory
        const mysqlLibDir = path.join(path.dirname(path.dirname(mysqldPath)), 'lib')

        const { exec } = await import('child_process')
        const { promisify } = await import('util')
        const execAsync = promisify(exec)

        // Start mysqld with DYLD_LIBRARY_PATH set explicitly
        const command = `DYLD_LIBRARY_PATH="${mysqlLibDir}" "${mysqldPath}" --daemonize --datadir="${dataDir}" --pid-file="${pidFile}" --port=${port} --bind-address=127.0.0.1`

        await execAsync(command, { shell: '/bin/bash' })

        // Wait for MySQL to start
        await new Promise(r => setTimeout(r, 2000))

        startSuccess = true
      }
      catch (e) {
        console.error(`❌ Fallback start failed: ${e instanceof Error ? e.message : String(e)}`)
      }
    }
    if (!startSuccess) {
      console.error(`❌ Failed to start ${service.definition?.displayName || serviceName}`)
      operation.result = 'failure'
      operation.error = 'Start failed'
      manager.operations.push(operation)
      return false
    }

    // Post-start health verification; if unhealthy, attempt pg_ctl fallback for postgres
    if (service.definition?.name === 'postgres') {
      let healthy = await checkServiceHealth(service)
      if (!healthy) {
        await new Promise(r => setTimeout(r, 500))
        healthy = await checkServiceHealth(service)
      }
      if (!healthy) {
        try {
          const { findBinaryInPath } = await import('../utils')
          const pgCtl = findBinaryInPath('pg_ctl') || 'pg_ctl'
          const dataDir = service.dataDir || service.definition.dataDirectory
          const port = service.definition.port || 5432
          const extraArgs = `-p ${port} -c listen_addresses=127.0.0.1`
          if (config.verbose) {
            console.warn('⚠️  Service unhealthy after start; attempting pg_ctl restart')
          }
          const stop = spawn(pgCtl, ['-D', String(dataDir), '-m', 'fast', 'stop'], { stdio: 'ignore' })
          await new Promise(res => stop.on('close', () => res(null)))
          await new Promise<void>((resolve, reject) => {
            const proc = spawn(pgCtl, ['-D', String(dataDir), '-o', extraArgs, '-w', 'start'], { stdio: config.verbose ? 'inherit' : 'pipe' })
            proc.on('close', code => code === 0 ? resolve() : reject(new Error(`pg_ctl start failed with exit ${code}`)))
            proc.on('error', reject)
          })
        }
        catch (e) {
          console.error(`❌ pg_ctl restart failed: ${e instanceof Error ? e.message : String(e)}`)
        }
      }
    }

    // Execute post-start commands
    // Small grace before post-start commands to avoid races
    await new Promise(r => setTimeout(r, 500))
    await executePostStartCommands(service)

    // For databases, perform a final readiness handshake to avoid races with immediate consumers
    if (service.definition?.name === 'postgres' && process.platform === 'darwin') {
      try {
        // quick extra wait to ensure socket/listen transition is complete
        await new Promise(r => setTimeout(r, 300))
      }
      catch {}
    }

    // Health check after starting
    setTimeout(() => {
      void checkServiceHealth(service)
    }, 2000)

    // Mark operation success and update service status
    service.status = 'running'
    service.lastCheckedAt = new Date()
    operation.result = 'success'
    operation.duration = 0
    manager.operations.push(operation)
    return true
  }
  catch (error) {
    console.error(`❌ Failed to start service ${serviceName}: ${error}`)
    operation.result = 'failure'
    operation.error = String(error)
    operation.duration = 0
    manager.operations.push(operation)
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
    status: 'pending',
  }

  // In test mode, still validate and track operations
  // Skip test mode for E2E validation tests
  if ((process.env.NODE_ENV === 'test' || process.env.LAUNCHPAD_TEST_MODE === 'true') && !process.env.LAUNCHPAD_E2E_TEST) {
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
    // Get or create service instance (ensures service is registered)
    const service = await getOrCreateServiceInstance(serviceName)

    // Check actual service health to determine if it's really running
    const isActuallyRunning = await checkServiceHealth(service)
    if (!isActuallyRunning) {
      service.status = 'stopped'
      console.log(`✅ Service ${serviceName} is already stopped`)
      operation.result = 'success'
      operation.duration = 0
      manager.operations.push(operation)
      return true
    }

    // Update status based on health check
    service.status = 'running'

    console.warn(`🛑 Stopping ${service.definition?.displayName || serviceName}...`)

    // Update status to stopping
    service.status = 'stopping'
    service.lastCheckedAt = new Date()

    // Stop the service using platform-specific method
    let success = await stopServicePlatform(service)

    // Fallback for PostgreSQL if platform stop failed
    if (!success && service.definition?.name === 'postgres') {
      try {
        const { findBinaryInPath } = await import('../utils')
        const pgCtl = findBinaryInPath('pg_ctl') || 'pg_ctl'
        const dataDir = service.dataDir || service.definition.dataDirectory
        console.warn('⚠️  Platform stop failed; trying pg_ctl stop')

        await new Promise<void>((resolve, reject) => {
          const proc = spawn(pgCtl, ['-D', String(dataDir), 'stop'], {
            stdio: config.verbose ? 'inherit' : 'pipe',
          })
          proc.on('close', (code) => {
            if (code === 0 || code === null)
              resolve()
            else reject(new Error(`pg_ctl stop failed with exit ${code}`))
          })
          proc.on('error', reject)
        })
        success = true
      }
      catch {
        // pg_ctl failed too
      }
    }

    // Fallback for MySQL if platform stop failed
    if (!success && (service.definition?.name === 'mysql' || service.definition?.name === 'mariadb')) {
      try {
        const { findBinaryInPath } = await import('../utils')
        const mysqladmin = findBinaryInPath('mysqladmin') || 'mysqladmin'
        console.warn('⚠️  Platform stop failed; trying mysqladmin shutdown')

        const { exec } = await import('child_process')
        const { promisify } = await import('util')
        const execAsync = promisify(exec)

        await execAsync(`"${mysqladmin}" -h 127.0.0.1 -P ${service.definition.port || 3306} -u root shutdown`, {
          shell: '/bin/bash',
        })

        success = true
      }
      catch {
        // mysqladmin failed, try killing via PID file
        try {
          const pidFile = service.definition?.pidFile
          if (pidFile && fs.existsSync(pidFile)) {
            const pid = fs.readFileSync(pidFile, 'utf8').trim()
            if (pid) {
              process.kill(Number.parseInt(pid), 'SIGTERM')
              success = true
            }
          }
        }
        catch {
          // Kill failed too
        }
      }
    }

    if (success) {
      service.status = 'stopped'
      service.pid = undefined
      service.startedAt = undefined

      console.log(`✅ ${service.definition?.displayName || serviceName} stopped successfully`)
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
    operation.error = String(error)
    operation.duration = Date.now() - operation.timestamp.getTime()
    manager.operations.push(operation)

    console.error(`❌ Failed to stop ${serviceName}: ${operation.error}`)
    return false
  }
}

/**
 * Restart a service
 */
export async function restartService(serviceName: string): Promise<{ success: boolean, error?: string }> {
  console.warn(`🔄 Restarting ${serviceName}...`)

  const stopSuccess = await stopService(serviceName)
  if (!stopSuccess) {
    return { success: false, error: 'Failed to stop service for restart' }
  }

  // Wait a moment before starting
  await new Promise(resolve => setTimeout(resolve, 1000))

  const startSuccess = await startService(serviceName)
  return { success: startSuccess, error: startSuccess ? undefined : 'Failed to start service after restart' }
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
    status: 'pending',
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
      operation.error = String(error)
      operation.duration = 0
      manager.operations.push(operation)
      return false
    }
  }

  try {
    const service = await getOrCreateServiceInstance(serviceName)

    if (service.enabled) {
      console.log(`✅ Service ${serviceName} is already enabled`)
      operation.result = 'success'
      operation.duration = 0
      manager.operations.push(operation)
      return true
    }

    console.warn(`🔧 Enabling ${service.definition?.displayName || serviceName} for auto-start...`)

    service.enabled = true
    await createServiceFiles(service)

    const success = await enableServicePlatform(service)

    if (success) {
      console.log(`✅ ${service.definition?.displayName || serviceName} enabled for auto-start`)
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
    operation.error = String(error)
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
    status: 'pending',
  }

  // In test mode, still validate and track operations
  // Skip test mode for E2E validation tests
  if ((process.env.NODE_ENV === 'test' || process.env.LAUNCHPAD_TEST_MODE === 'true') && !process.env.LAUNCHPAD_E2E_TEST) {
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
      console.log(`✅ Service ${serviceName} is already disabled`)
      operation.result = 'success'
      operation.duration = 0
      manager.operations.push(operation)
      return true
    }

    console.warn(`🔧 Disabling ${service.definition?.displayName || serviceName} from auto-start...`)

    service.enabled = false
    await createServiceFiles(service)

    const success = await disableServicePlatform(service)

    if (success) {
      console.log(`✅ ${service.definition?.displayName || serviceName} disabled from auto-start`)
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
    operation.error = String(error)
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
  try {
    // Get or create service instance to ensure it's registered
    const service = await getOrCreateServiceInstance(serviceName)

    // Always check actual health to get real-time status
    const isActuallyRunning = await checkServiceHealth(service)
    service.status = isActuallyRunning ? 'running' : 'stopped'

    return service.status
  }
  catch {
    // If service definition not found, return stopped
    return 'stopped'
  }
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
    name: serviceName,
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
  if (definition?.dataDirectory) {
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

  if (!definition?.initCommand) {
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
      .replace('{configFile}', service.configFile || definition.configFile || '')
      .replace('{currentUser}', process.env.USER || 'root')
      .replace('{dbUsername}', getDatabaseUsernameFromEnv() || config.services?.database?.username || 'root')
      .replace('{authMethod}', config.services?.database?.authMethod || 'trust'),
  )

  const [command, ...args] = resolvedArgs
  const executablePath = findBinaryInPath(command) || command

  return new Promise((resolve, reject) => {
    // Set up environment for MySQL dependencies
    let serviceEnv = { ...process.env, ...definition.env }
    if (definition.name === 'mysql') {
      const mysqlBinPath = process.env.PATH?.split(':').find(path => path.includes('mysql.com'))
      if (mysqlBinPath) {
        const envPath = mysqlBinPath.replace(/\/mysql\.com\/v\d+\.\d+\.\d+\/bin/, '').replace('/bin', '')
        serviceEnv.DYLD_LIBRARY_PATH = [
          `${envPath}/unicode.org/v71/lib`,
          `${envPath}/libevent.org/v2/lib`,
          `${envPath}/openssl.org/v3/lib`, // Updated for OpenSSL v3 which is more common in MySQL 9.x
          `${envPath}/openssl.org/v1/lib`, // Keep v1 for backward compatibility
          `${envPath}/facebook.com/zstd/v1/lib`,
          `${envPath}/protobuf.dev/v21/lib`,
          `${envPath}/lz4.org/v1/lib`,
          serviceEnv.DYLD_LIBRARY_PATH
        ].filter(Boolean).join(':')
      }
    }

    const proc = spawn(executablePath, args, {
      stdio: config.verbose ? 'inherit' : 'pipe',
      env: serviceEnv,
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
  if (definition?.configFile && !fs.existsSync(definition.configFile)) {
    const defaultConfig = createDefaultServiceConfig(definition.name || service.name)
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
  const dataDir = service.dataDir || definition?.dataDirectory
  if (dataDir) {
    await fs.promises.mkdir(dataDir, { recursive: true })
  }

  // Create log directory
  const servicesConfig = config.services
  if (!servicesConfig) {
    throw new Error('Services configuration not found')
  }

  const logDir = service.logFile ? path.dirname(service.logFile) : servicesConfig.logDir
  if (logDir) {
    await fs.promises.mkdir(logDir, { recursive: true })
  }

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

  if (!definition) {
    throw new Error(`Service ${service.name} has no definition`)
  }

  if (!definition.packageDomain) {
    // Service doesn't require a package (e.g., built-in services)
    return true
  }

  const { findBinaryInPath } = await import('../utils')

  // Check if main executable is already available
  if (findBinaryInPath(definition.executable)) {
    return true
  }

  if (config.verbose)
    console.warn(`📦 Installing ${definition.displayName} package...`)

  try {
    // Validate packageDomain before calling install to prevent JavaScript errors
    if (!definition.packageDomain || typeof definition.packageDomain !== 'string') {
      throw new Error(`Invalid package domain for ${definition.displayName}: ${definition.packageDomain}`)
    }

    // Use the statically imported install function
    if (typeof install !== 'function') {
      console.error(`❌ Install function not available`)
      return false
    }

    // Install the main service package - this will automatically install all dependencies
    const installPath = path.join(homedir(), '.local')

    // Call install with proper error handling and shorter timeout
    try {
      if (config.verbose) {
        console.warn(`📦 Installing ${definition.displayName} package (${definition.packageDomain})...`)
      }

      // Add timeout to prevent hanging - use longer timeout in CI environments
      const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true'
      const timeoutMinutes = isCI ? 15 : 10 // 15 minutes for CI, 10 for local
      const installPromise = install([definition.packageDomain], installPath)
      const timeoutPromise = new Promise<boolean>((_, reject) => {
        setTimeout(() => reject(new Error(`Package installation timeout after ${timeoutMinutes} minutes`)), timeoutMinutes * 60 * 1000)
      })

      await Promise.race([installPromise, timeoutPromise])

      if (config.verbose) {
        console.log(`✅ ${definition.displayName} package installed successfully`)
      }
    }
    catch (installError) {
      // If installation fails or times out, try to continue without the package
      console.warn(`⚠️  Package installation failed for ${definition.displayName}, continuing without it`)
      console.warn(`  - Error: ${installError instanceof Error ? installError.message : String(installError)}`)

      // Check if binary is already available in system PATH as fallback
      const { findBinaryInPath } = await import('../utils')
      if (findBinaryInPath(definition.executable)) {
        console.warn(`✅ Found ${definition.executable} in system PATH, using system version`)
        return true
      }

      return false
    }

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
      console.log(`✅ Created SQLite database file: ${sqliteDbPath}`)
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
        console.log(`✅ Updated .env file to use SQLite`)
      }
    }

    console.log(`✅ Database service started`)

    return true
  }
  catch (error) {
    console.warn(`⚠️  Could not set up SQLite automatically: ${error instanceof Error ? error.message : String(error)}`)
    return false
  }
}

/**
 * Auto-initialize databases on first start
 */
async function autoInitializeDatabase(service: ServiceInstance): Promise<boolean> {
  const { definition } = service

  if (!definition) {
    throw new Error(`Service ${service.name} has no definition`)
  }

  // PostgreSQL auto-initialization
  if (definition.name === 'postgres' || definition.name === 'postgresql') {
    // Use the definition's dataDirectory for consistency with runtime
    const dataDir = service.dataDir || definition.dataDirectory || path.join(homedir(), '.local', 'share', 'launchpad', 'services', 'postgres', 'data')
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

      // Load .env file from current directory if it exists
      const envPath = path.join(process.cwd(), '.env')
      if (fs.existsSync(envPath)) {
        const envContent = fs.readFileSync(envPath, 'utf-8')
        const envLines = envContent.split('\n')
        for (const line of envLines) {
          const trimmed = line.trim()
          if (trimmed && !trimmed.startsWith('#')) {
            const [key, ...valueParts] = trimmed.split('=')
            if (key && valueParts.length > 0) {
              const value = valueParts.join('=').trim()
              process.env[key.trim()] = value
            }
          }
        }
      }

      // Load project-specific config from current directory
      const { loadConfig: loadProjectConfig } = await import('bunfig')
      const projectConfig = await loadProjectConfig({
        name: 'launchpad',
        alias: 'deps',
        cwd: process.cwd(),
      })

      // Get database username and auth method from project config, env vars, or defaults
      const dbUsername = projectConfig?.services?.database?.username || process.env.DB_USERNAME || 'root'
      const authMethod = projectConfig?.services?.database?.authMethod || process.env.DB_AUTH_METHOD || 'trust'

      // Always log the username being used for initialization (important for debugging)
      console.log(`🔧 Initializing PostgreSQL with username: ${dbUsername}, auth: ${authMethod}`)
      if (config.verbose) {
        console.log(`Project config database:`, projectConfig?.services?.database)
        console.log(`Current directory:`, process.cwd())
        console.log(`DB_USERNAME from env:`, process.env.DB_USERNAME)
      }

      execSync(`${command} -D "${dataDir}" -U "${dbUsername}" --auth-local=${authMethod} --auth-host=${authMethod} --encoding=UTF8`, {
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
    const dataDir = service.dataDir || definition.dataDirectory || path.join(homedir(), '.local', 'share', 'launchpad', 'services', 'mysql', 'data')
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
      // Find MySQL installation path - try multiple methods
      let basedir = '/usr/local/mysql'

      // Method 1: Look for mysql.com in PATH
      const mysqlBinPath = process.env.PATH?.split(':').find(p => p.includes('mysql.com'))
      if (mysqlBinPath) {
        basedir = mysqlBinPath.replace('/bin', '')
      }
      else {
        // Method 2: Try to find mysqld via which command
        try {
          const mysqldPath = execSync('which mysqld', { encoding: 'utf-8' }).trim()
          if (mysqldPath && fs.existsSync(mysqldPath)) {
            // Check if it's a shim script (text file)
            const content = fs.readFileSync(mysqldPath, 'utf-8')
            if (content.startsWith('#!/bin/sh') || content.startsWith('#!/usr/bin/env bash')) {
              // It's a shim - extract the real path from the exec line
              const execMatch = content.match(/exec\s+"([^"]+)"/)
              if (execMatch && execMatch[1]) {
                const realMysqldPath = execMatch[1]
                basedir = path.dirname(path.dirname(realMysqldPath)) // Up two levels from bin/mysqld
              }
            }
            else {
              // It's a binary - follow symlinks if needed
              const realPath = fs.realpathSync(mysqldPath)
              basedir = path.dirname(path.dirname(realPath)) // Up two levels from bin/mysqld
            }
          }
        }
        catch {
          // Fall back to checking known locations
          const knownLocations = [
            path.join(homedir(), '.local', 'mysql.com', 'v9.4.0'),
            path.join(homedir(), '.local', 'mysql.com', 'v9'),
            path.join(homedir(), '.local', 'mysql.com', 'v8'),
          ]

          for (const dir of knownLocations) {
            if (fs.existsSync(path.join(dir, 'bin', 'mysqld'))) {
              basedir = dir
              break
            }
          }
        }
      }

      // Handle both MySQL 8.x and 9.x paths
      const isMySQL9 = mysqlBinPath && mysqlBinPath.includes('/v9.')
      const mysqlVersion = isMySQL9 ? 'v9' : 'v8'

      // Set up environment for MySQL dependencies - handle both MySQL 8.x and 9.x
      const envPath = basedir.replace(/\/mysql\.com\/v\d+\.\d+\.\d+/, '')

      // Dynamically discover library versions by scanning directories
      const findLibraryPath = (domain: string): string[] => {
        try {
          const domainPath = path.join(envPath, domain)
          if (!fs.existsSync(domainPath)) return []

          const versions = fs.readdirSync(domainPath)
            .filter(name => name.startsWith('v'))
            .sort((a, b) => b.localeCompare(a)) // Sort descending to get latest first

          return versions.map(version => path.join(domainPath, version, 'lib')).filter(libPath => fs.existsSync(libPath))
        } catch {
          return []
        }
      }

      const libraryPaths = [
        ...findLibraryPath('unicode.org'),
        ...findLibraryPath('libevent.org'),
        ...findLibraryPath('openssl.org'),
        ...findLibraryPath('facebook.com/zstd'),
        ...findLibraryPath('protobuf.dev'),
        ...findLibraryPath('lz4.org'),
        ...findLibraryPath('abseil.io'),
        ...findLibraryPath('curl.se'),
        ...findLibraryPath('zlib.net'),
        ...findLibraryPath('tukaani.org/xz'),
        ...findLibraryPath('invisible-island.net/ncurses')
      ]

      const env = {
        ...process.env,
        DYLD_LIBRARY_PATH: [
          ...libraryPaths,
          process.env.DYLD_LIBRARY_PATH
        ].filter(Boolean).join(':')
      }

      if (config.verbose) {
        console.log(`Using MySQL basedir: ${basedir}`)
        console.log(`Using datadir: ${dataDir}`)
        console.log(`DYLD_LIBRARY_PATH: ${env.DYLD_LIBRARY_PATH}`)
      }

      // Use the real mysqld binary path instead of shim
      const mysqldBin = path.join(basedir, 'bin', 'mysqld')
      execSync(`"${mysqldBin}" --initialize-insecure --datadir="${dataDir}" --basedir="${basedir}" --user=$(whoami)`, {
        stdio: config.verbose ? 'inherit' : 'pipe',
        timeout: 120000,
        env,
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

  if (!definition) {
    throw new Error(`Service ${service.name} has no definition`)
  }

  if (!definition.postStartCommands || definition.postStartCommands.length === 0) {
    return
  }

  // Wait for the service to be fully ready, especially for databases
  if (definition.name === 'postgres' || definition.name === 'mysql') {
    // Immediate feedback so it doesn't look frozen after the "started successfully" line
    logUniqueMessage(`⏳ Waiting for ${definition.displayName} to be ready...`, true)
    // For databases, minimal initial wait to allow server to start accepting connections
    const isCI = process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true'
    const waitTime = isCI ? 2000 : 800 // 2s in CI, 800ms locally for initial startup
    await new Promise(resolve => setTimeout(resolve, waitTime))

    // Try to verify the service is responding before running post-start commands
    if (definition.healthCheck) {
      // Try up to 5 times with shorter backoff
      for (let i = 0; i < 5; i++) {
        try {
          const healthResult = await checkServiceHealth(service)
          if (healthResult) {
            logUniqueMessage(`✅ ${definition.displayName} is accepting connections`, true)
            break
          }
        }
        catch {
          // Health check failed, wait a bit more
          const backoff = Math.min(500 * (i + 1), 2000)
          await new Promise(resolve => setTimeout(resolve, backoff))
        }
      }
    }

    // Additional verification for postgres using psql with configured username
    if (definition.name === 'postgres') {
      const { findBinaryInPath } = await import('../utils')
      const psql = findBinaryInPath('psql') || 'psql'
      const dbUsername = getDatabaseUsernameFromEnv() || config.services?.database?.username || 'root'
      for (let i = 0; i < 5; i++) {
        const ok = await new Promise<boolean>((resolve) => {
          const proc = spawn(psql, ['-h', '127.0.0.1', '-p', '5432', '-U', dbUsername, '-tAc', 'SELECT 1'], { stdio: 'ignore' })
          proc.on('close', code => resolve(code === 0))
          proc.on('error', () => resolve(false))
        })
        if (ok)
          break
        await new Promise(r => setTimeout(r, 200 + i * 100))
      }
    }

    // Announce post-start setup phase for databases
    logUniqueMessage(`🔧 ${definition.displayName} post-start setup...`, true)
  }
  else {
    // For other services, use the original wait time
    await new Promise(resolve => setTimeout(resolve, 2000))
  }

  let allOk = true
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
        let stderr = ''
        const proc = spawn(executablePath, args, {
          stdio: config.verbose ? 'inherit' : 'pipe',
          env: { ...process.env, ...definition.env },
        })

        // Capture stderr to check for "already exists" errors
        if (!config.verbose && proc.stderr) {
          proc.stderr.on('data', (data) => {
            stderr += data.toString()
          })
        }

        // Reduce timeout for post-start commands to 10 seconds
        const timeout = setTimeout(() => {
          if (config.verbose) {
            console.warn(`⚠️ Post-start command timed out after 10s: ${resolvedCommand.join(' ')}`)
          }
          proc.kill('SIGTERM')
          allOk = false
          resolve()
        }, 10000)

        proc.on('close', (code) => {
          clearTimeout(timeout)
          // Treat "already exists" errors as success for createdb
          const isAlreadyExistsError = stderr.includes('already exists') || stderr.includes('duplicate')

          if (code === 0 || isAlreadyExistsError) {
            if (config.verbose && isAlreadyExistsError) {
              console.warn(`✓ Database/resource already exists (skipped): ${resolvedCommand.join(' ')}`)
            }
            resolve()
          }
          else {
            if (config.verbose) {
              console.warn(`⚠️ Post-start command failed with exit code ${code}: ${resolvedCommand.join(' ')}`)
              if (stderr) {
                console.warn(`   stderr: ${stderr.trim()}`)
              }
            }
            allOk = false
            resolve()
          }
        })

        proc.on('error', (error) => {
          clearTimeout(timeout)
          if (config.verbose) {
            console.warn(`⚠️ Post-start command error: ${error.message}`)
          }
          allOk = false
          resolve()
        })
      })
    }
    catch (error) {
      if (config.verbose) {
        console.warn(`⚠️ Failed to execute post-start command: ${error instanceof Error ? error.message : String(error)}`)
      }
      allOk = false
    }
  }

  if (definition.name === 'postgres' || definition.name === 'mysql') {
    if (allOk)
      logUniqueMessage(`✅ ${definition.displayName} post-start setup completed`, true)
    else logUniqueMessage(`⚠️ ${definition.displayName} post-start setup completed with warnings`, true)
  }

  // Execute postDatabaseSetup commands if configured
  if (allOk && config.services?.postDatabaseSetup) {
    await executePostDatabaseSetupCommands()
  }
}

/**
 * Execute post-database setup commands (e.g., migrations, seeding)
 */
async function executePostDatabaseSetupCommands(): Promise<void> {
  const commands = config.services?.postDatabaseSetup
  if (!commands) return

  const commandList = Array.isArray(commands) ? commands : [commands]

  logUniqueMessage(`🌱 Running post-database setup...`, true)

  for (const cmdString of commandList) {
    try {
      const parts = cmdString.trim().split(/\s+/)
      const [command, ...args] = parts
      const executablePath = findBinaryInPath(command) || command

      if (config.verbose) {
        console.warn(`📋 Executing: ${cmdString}`)
      }

      await new Promise<void>((resolve, reject) => {
        let stdout = ''
        let stderr = ''
        const proc = spawn(executablePath, args, {
          stdio: config.verbose ? 'inherit' : 'pipe',
          cwd: process.cwd(),
        })

        if (!config.verbose) {
          if (proc.stdout) {
            proc.stdout.on('data', (data) => {
              stdout += data.toString()
            })
          }
          if (proc.stderr) {
            proc.stderr.on('data', (data) => {
              stderr += data.toString()
            })
          }
        }

        // Timeout for setup commands (5 minutes max for migrations/seeding)
        const timeout = setTimeout(() => {
          proc.kill('SIGTERM')
          reject(new Error(`Post-database setup command timed out after 5 minutes: ${cmdString}`))
        }, 300000)

        proc.on('close', (code) => {
          clearTimeout(timeout)
          if (code === 0) {
            if (config.verbose) {
              console.log(`✅ Successfully executed: ${cmdString}`)
            }
            resolve()
          }
          else {
            const errorMsg = `Post-database setup command failed with exit code ${code}: ${cmdString}`
            if (!config.verbose && stderr) {
              console.error(`❌ ${errorMsg}`)
              console.error(`   stderr: ${stderr.trim()}`)
            }
            reject(new Error(errorMsg))
          }
        })

        proc.on('error', (error) => {
          clearTimeout(timeout)
          reject(new Error(`Failed to execute ${cmdString}: ${error.message}`))
        })
      })
    }
    catch (error) {
      console.error(`❌ Post-database setup failed: ${error instanceof Error ? error.message : String(error)}`)
      throw error // Propagate error so setup is retried on next cd
    }
  }

  logUniqueMessage(`✅ Post-database setup completed`, true)
}

/**
 * Resolve template variables in service configuration
 */
export function resolveServiceTemplateVariables(template: string, service: ServiceInstance): string {
  const { definition } = service

  if (!definition) {
    throw new Error(`Service ${service.name} has no definition`)
  }

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

  // Get username and password, preferring env vars, then config, then defaults
  const dbUsername = getDatabaseUsernameFromEnv() || config.services?.database?.username || 'root'
  const dbPassword = getDatabasePasswordFromEnv() || config.services?.database?.password || ''
  const authMethod = config.services?.database?.authMethod || 'trust'

  let resolved = template
    .replace('{dataDir}', dataDir || '')
    .replace('{configFile}', configFile || '')
    .replace('{logFile}', logFile || '')
    .replace('{pidFile}', definition.pidFile || '')
    .replace('{port}', String(port || 5432))
    .replace('{projectName}', projectName)
    .replace('{projectDatabase}', databaseName) // Use env database name or project name
    .replace('{dbUsername}', dbUsername)
    .replace('{dbPassword}', dbPassword)
    .replace('{authMethod}', authMethod)

  // Replace service-specific config variables
  for (const [key, value] of Object.entries(serviceConfig)) {
    resolved = resolved.replace(new RegExp(`{${key}}`, 'g'), String(value))
  }

  return resolved
}

/**
 * Get database name from environment variables
 */
function getDatabaseNameFromEnv(): string | null {
  return process.env.DB_NAME || process.env.DB_DATABASE || null
}

/**
 * Get database username from environment variables
 */
function getDatabaseUsernameFromEnv(): string | null {
  return process.env.DB_USERNAME || process.env.DB_USER || null
}

/**
 * Get database password from environment variables
 */
function getDatabasePasswordFromEnv(): string | null {
  return process.env.DB_PASSWORD || null
}

/**
 * Detect project name from current directory or composer.json
 */
export function detectProjectName(): string {
  try {
    // Try to read composer.json for Laravel projects
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
 * Get database username from environment files
 */
export function getDatabaseUsernameFromEnv(): string | null {
  try {
    // Check .env file first
    const envPath = path.join(process.cwd(), '.env')
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8')
      const dbUsernameMatch = envContent.match(/^DB_USERNAME=(.*)$/m)

      if (dbUsernameMatch && dbUsernameMatch[1]) {
        let username = dbUsernameMatch[1].trim()
        // Remove quotes if present
        if ((username.startsWith('"') && username.endsWith('"'))
          || (username.startsWith('\'') && username.endsWith('\''))) {
          username = username.slice(1, -1)
        }
        return username
      }
    }

    // Check deps.yaml file
    const depsPath = path.join(process.cwd(), 'deps.yaml')
    if (fs.existsSync(depsPath)) {
      const content = fs.readFileSync(depsPath, 'utf-8')
      const lines = content.split('\n')
      let inDatabase = false

      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed === 'database:') {
          inDatabase = true
          continue
        }
        if (inDatabase && trimmed.startsWith('  ')) {
          const [key, ...valueParts] = trimmed.replace(/^  /, '').split(':')
          if (key === 'username' && valueParts.length > 0) {
            return valueParts.join(':').trim()
          }
        } else if (inDatabase && !trimmed.startsWith('  ')) {
          break // End of database section
        }
      }
    }

    return null
  }
  catch {
    return null
  }
}

/**
 * Get database password from environment files
 */
export function getDatabasePasswordFromEnv(): string | null {
  try {
    // Check .env file first
    const envPath = path.join(process.cwd(), '.env')
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8')
      const dbPasswordMatch = envContent.match(/^DB_PASSWORD=(.*)$/m)

      if (dbPasswordMatch && dbPasswordMatch[1]) {
        let password = dbPasswordMatch[1].trim()
        // Remove quotes if present
        if ((password.startsWith('"') && password.endsWith('"'))
          || (password.startsWith('\'') && password.endsWith('\''))) {
          password = password.slice(1, -1)
        }
        return password
      }
    }

    // Check deps.yaml file
    const depsPath = path.join(process.cwd(), 'deps.yaml')
    if (fs.existsSync(depsPath)) {
      const content = fs.readFileSync(depsPath, 'utf-8')
      const lines = content.split('\n')
      let inDatabase = false

      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed === 'database:') {
          inDatabase = true
          continue
        }
        if (inDatabase && trimmed.startsWith('  ')) {
          const [key, ...valueParts] = trimmed.replace(/^  /, '').split(':')
          if (key === 'password' && valueParts.length > 0) {
            return valueParts.join(':').trim()
          }
        } else if (inDatabase && !trimmed.startsWith('  ')) {
          break // End of database section
        }
      }
    }

    return null
  }
  catch {
    return null
  }
}

/**
 * Get database name from environment files
 */
export function getDatabaseNameFromEnv(): string | null {
  try {
    // Check .env file first
    const envPath = path.join(process.cwd(), '.env')
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8')

      // Try DB_DATABASE first (Laravel standard)
      let dbDatabaseMatch = envContent.match(/^DB_DATABASE=(.*)$/m)

      // If not found, try DB_NAME (common alternative)
      if (!dbDatabaseMatch || !dbDatabaseMatch[1]) {
        dbDatabaseMatch = envContent.match(/^DB_NAME=(.*)$/m)
      }

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
    }

    // Check deps.yaml file
    const depsPath = path.join(process.cwd(), 'deps.yaml')
    if (fs.existsSync(depsPath)) {
      const content = fs.readFileSync(depsPath, 'utf-8')
      const lines = content.split('\n')
      let inDatabase = false

      for (const line of lines) {
        const trimmed = line.trim()
        if (trimmed === 'database:') {
          inDatabase = true
          continue
        }
        if (inDatabase && trimmed.startsWith('  ')) {
          const [key, ...valueParts] = trimmed.replace(/^  /, '').split(':')
          if (key === 'name' && valueParts.length > 0) {
            const value = valueParts.join(':').trim()
            return value.replace(/\W/g, '_')
          }
        } else if (inDatabase && !trimmed.startsWith('  ')) {
          break // End of database section
        }
      }
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

  if (!service.definition?.name) {
    throw new Error(`Service ${service.name} has no definition or name`)
  }

  const serviceFilePath = getServiceFilePath(service.definition.name)
  if (!serviceFilePath) {
    throw new Error(`Could not determine service file path for ${service.definition.name}`)
  }

  return new Promise((resolve) => {
    const proc = spawn('launchctl', ['load', '-w', serviceFilePath], {
      stdio: config.verbose ? 'inherit' : 'pipe',
    })
    let stderr = ''
    if (!config.verbose) {
      proc.stderr?.on('data', (d) => {
        stderr += d.toString()
      })
    }

    // Add timeout for launchctl load (5 seconds max)
    const timeout = setTimeout(() => {
      proc.kill('SIGTERM')
      resolve(false)
    }, 5000)

    proc.on('close', (code) => {
      clearTimeout(timeout)
      const ok = code === 0 && !(stderr.includes('Load failed') || stderr.includes('Input/output error'))
      resolve(ok)
    })
    proc.on('error', () => {
      clearTimeout(timeout)
      resolve(false)
    })
  })
}

async function stopServiceLaunchd(service: ServiceInstance): Promise<boolean> {
  // In test mode, mock successful operation
  if (process.env.NODE_ENV === 'test' || process.env.LAUNCHPAD_TEST_MODE === 'true') {
    return true
  }

  if (!service.definition?.name) {
    throw new Error(`Service ${service.name} has no definition or name`)
  }

  const serviceFilePath = getServiceFilePath(service.definition.name)
  if (!serviceFilePath) {
    throw new Error(`Could not determine service file path for ${service.definition.name}`)
  }

  const launchctlSuccess = await new Promise<boolean>((resolve) => {
    const proc = spawn('launchctl', ['unload', '-w', serviceFilePath], {
      stdio: config.verbose ? 'inherit' : 'pipe',
    })

    proc.on('close', (code) => {
      resolve(code === 0)
    })

    proc.on('error', () => {
      resolve(false)
    })
  })

  if (!launchctlSuccess) {
    return false
  }

  // Verify the service actually stopped by checking health
  await new Promise(r => setTimeout(r, 500))
  const stillRunning = await checkServiceHealth(service)

  return !stillRunning
}

async function enableServiceLaunchd(_service: ServiceInstance): Promise<boolean> {
  // For launchd, enabling is handled by the RunAtLoad property in the plist
  // In test mode or normal mode, this always succeeds
  return true
}

async function disableServiceLaunchd(service: ServiceInstance): Promise<boolean> {
  // First stop the service using unload
  await stopServiceLaunchd(service)

  // Then fully unregister from launchd using bootout
  const serviceFilePath = getServiceFilePath(service.definition?.name || service.name)
  if (!serviceFilePath || !fs.existsSync(serviceFilePath)) {
    return true // Already unregistered
  }

  const userId = process.getuid?.() || 501
  const domain = `gui/${userId}`

  const bootoutSuccess = await new Promise<boolean>((resolve) => {
    const proc = spawn('launchctl', ['bootout', domain, serviceFilePath], {
      stdio: config.verbose ? 'inherit' : 'pipe',
    })

    proc.on('close', (code) => {
      resolve(code === 0)
    })

    proc.on('error', () => {
      resolve(false)
    })
  })

  if (config.verbose && bootoutSuccess) {
    console.log(`✅ Unregistered ${service.definition?.name || service.name} from launchd`)
  }

  return bootoutSuccess
}

// Linux systemd implementations

async function startServiceSystemd(service: ServiceInstance): Promise<boolean> {
  // In test mode, mock successful operation
  if (process.env.NODE_ENV === 'test' || process.env.LAUNCHPAD_TEST_MODE === 'true') {
    return true
  }

  if (!service.definition?.name) {
    throw new Error(`Service ${service.name} has no definition or name`)
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

  if (!service.definition?.name) {
    throw new Error(`Service ${service.name} has no definition or name`)
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

  if (!service.definition?.name) {
    throw new Error(`Service ${service.name} has no definition or name`)
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

  if (!service.definition?.name) {
    throw new Error(`Service ${service.name} has no definition or name`)
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

  if (!definition) {
    throw new Error(`Service ${service.name} has no definition`)
  }

  if (!definition.healthCheck) {
    // If no health check is defined, assume the service is healthy if it has a PID
    return service.pid !== undefined
  }

  const { command, expectedExitCode, timeout } = definition.healthCheck

  return new Promise((resolve) => {
    // Resolve template variables in health check command
    const resolvedCommand = command.map(arg => resolveServiceTemplateVariables(arg, service))
    const [cmd, ...args] = resolvedCommand
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
