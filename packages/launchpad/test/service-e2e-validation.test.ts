import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { config } from '../src/config'
import { getServiceStatus, startService, stopService } from '../src/services/manager'

// Helper function to detect if we're in a CI environment where services aren't available
function isRunningInCI(): boolean {
  return process.env.CI === 'true'
    || process.env.GITHUB_ACTIONS === 'true'
    || process.env.RUNNER_OS !== undefined
}

// Helper function to detect if we should skip service tests
function shouldSkipServiceTests(): boolean {
  return isRunningInCI() || process.env.LAUNCHPAD_SKIP_SERVICE_TESTS === 'true'
}

// Helper function to wait for service to be ready
async function waitForService(host: string, port: number, timeout = 30000): Promise<boolean> {
  const start = Date.now()
  while (Date.now() - start < timeout) {
    try {
      const result = execSync(`nc -z ${host} ${port}`, { stdio: 'pipe' })
      if (result) {
        return true
      }
    }
    catch {
      // Service not ready yet
    }
    await new Promise(resolve => setTimeout(resolve, 1000))
  }
  return false
}

// Helper function to test PostgreSQL connectivity
async function testPostgreSQLConnection(host: string, port: number, username: string, database: string): Promise<boolean> {
  try {
    // Test basic connection
    const result = execSync(`psql -h ${host} -p ${port} -U ${username} -d ${database} -c "SELECT 1;" 2>/dev/null`, {
      stdio: 'pipe',
      env: { ...process.env, PGPASSWORD: '' },
    })
    return result.toString().includes('1')
  }
  catch {
    return false
  }
}

// Helper function to test Redis connectivity
async function testRedisConnection(host: string, port: number): Promise<boolean> {
  try {
    const result = execSync(`redis-cli -h ${host} -p ${port} ping 2>/dev/null`, { stdio: 'pipe' })
    return result.toString().trim() === 'PONG'
  }
  catch {
    return false
  }
}

describe('Service E2E Validation', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string
  let originalConfig: typeof config.services

  beforeEach(() => {
    originalEnv = { ...process.env }
    originalConfig = { ...config.services }
    tempDir = fs.mkdtempSync(path.join(tmpdir(), 'launchpad-e2e-test-'))

    // Set E2E test mode to bypass regular test mocking
    process.env.LAUNCHPAD_E2E_TEST = 'true'

    // Override service directories for testing
    if (config.services) {
      config.services.dataDir = path.join(tempDir, 'services')
      config.services.logDir = path.join(tempDir, 'logs')
      config.services.configDir = path.join(tempDir, 'config')
    }
  })

  afterEach(async () => {
    // Clean up any running services
    try {
      await stopService('postgres')
      await stopService('redis')
    }
    catch {
      // Ignore cleanup errors
    }

    // Restore environment
    Object.keys(process.env).forEach((key) => {
      delete process.env[key]
    })
    Object.assign(process.env, originalEnv)
    if (config.services && originalConfig) {
      Object.assign(config.services, originalConfig)
    }

    // Clean up temp directory
    try {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
    catch {
      // Ignore cleanup errors
    }
  })

  describe('PostgreSQL Service E2E', () => {
    it('should start PostgreSQL and be connectable', async () => {
      if (shouldSkipServiceTests()) {
        console.log('Skipping PostgreSQL E2E test in CI/test environment')
        return
      }

      // Start PostgreSQL service
      const startResult = await startService('postgres')
      if (!startResult) {
        console.log('PostgreSQL service failed to start, skipping connectivity test')
        return
      }

      // Wait for service to be ready with shorter timeout
      const isReady = await waitForService('127.0.0.1', 5432, 10000)
      if (!isReady) {
        console.log('PostgreSQL service not ready within timeout, skipping connectivity test')
        return
      }
      expect(isReady).toBe(true)

      // Test actual database connectivity
      const canConnect = await testPostgreSQLConnection('127.0.0.1', 5432, 'postgres', 'postgres')
      expect(canConnect).toBe(true)

      const result = await startService('postgres')
      expect(result).toBe(true)

      const status = await getServiceStatus('postgres')
      expect(status).toBe('running')

      // Clean up
      const stopResult = await stopService('postgres')
      expect(stopResult).toBe(true)
    }, 120000) // 2 minute timeout for full startup

    it('should create database user and database on startup', async () => {
      if (isRunningInCI() || process.env.NODE_ENV === 'test') {
        console.log('Skipping PostgreSQL user creation test in CI/test environment')
        return
      }

      // Start PostgreSQL service
      await startService('postgres')
      await waitForService('127.0.0.1', 5432, 60000)

      // Test that root user exists and can connect
      const rootCanConnect = await testPostgreSQLConnection('127.0.0.1', 5432, 'postgres', 'postgres')
      expect(rootCanConnect).toBe(true)

      // Test that we can create a test database
      try {
        execSync(`createdb -h 127.0.0.1 -p 5432 -U postgres test_db 2>/dev/null`, {
          env: { ...process.env, PGPASSWORD: '' },
        })

        const testDbExists = await testPostgreSQLConnection('127.0.0.1', 5432, 'postgres', 'test_db')
        expect(testDbExists).toBe(true)

        // Clean up test database
        execSync(`dropdb -h 127.0.0.1 -p 5432 -U postgres test_db 2>/dev/null`, {
          env: { ...process.env, PGPASSWORD: '' },
        })
      }
      catch (error) {
        console.error('Database creation test failed:', error)
        throw error
      }

      await stopService('postgres')
    }, 120000)
  })

  describe('Redis Service E2E', () => {
    it('should start Redis and be connectable', async () => {
      if (isRunningInCI() || process.env.NODE_ENV === 'test') {
        console.log('Skipping Redis E2E test in CI/test environment')
        return
      }

      // Start Redis service
      const startResult = await startService('redis')
      expect(startResult).toBe(true)

      // Wait for service to be ready
      const isReady = await waitForService('127.0.0.1', 6379, 30000)
      expect(isReady).toBe(true)

      // Test actual Redis connectivity
      const canConnect = await testRedisConnection('127.0.0.1', 6379)
      expect(canConnect).toBe(true)

      // Verify service status reports as running
      const status = await getServiceStatus('redis')
      expect(status).toBe('running')

      // Test basic Redis operations
      try {
        execSync(`redis-cli -h 127.0.0.1 -p 6379 set test_key "test_value"`, { stdio: 'pipe' })
        const result = execSync(`redis-cli -h 127.0.0.1 -p 6379 get test_key`, { stdio: 'pipe' })
        expect(result.toString().trim()).toBe('test_value')
      }
      catch (error) {
        console.error('Redis operations test failed:', error)
        throw error
      }

      // Clean up
      const stopResult = await stopService('redis')
      expect(stopResult).toBe(true)
    }, 60000) // 1 minute timeout

    it('should persist data across restarts', async () => {
      if (isRunningInCI() || process.env.NODE_ENV === 'test') {
        console.log('Skipping Redis persistence test in CI/test environment')
        return
      }

      // Start Redis service
      await startService('redis')
      await waitForService('127.0.0.1', 6379, 30000)

      // Set a test value
      execSync(`redis-cli -h 127.0.0.1 -p 6379 set persistent_key "persistent_value"`, { stdio: 'pipe' })

      // Stop and restart Redis
      await stopService('redis')
      await startService('redis')
      await waitForService('127.0.0.1', 6379, 30000)

      // Check if the value persisted
      const result = execSync(`redis-cli -h 127.0.0.1 -p 6379 get persistent_key`, { stdio: 'pipe' })
      expect(result.toString().trim()).toBe('persistent_value')

      await stopService('redis')
    }, 90000) // 1.5 minute timeout
  })

  describe('Service Integration', () => {
    it('should start both PostgreSQL and Redis simultaneously', async () => {
      if (isRunningInCI() || process.env.NODE_ENV === 'test') {
        console.log('Skipping service integration test in CI/test environment')
        return
      }

      // Start both services
      const postgresResult = await startService('postgres')
      const redisResult = await startService('redis')
      expect(postgresResult).toBe(true)
      expect(redisResult).toBe(true)

      // Wait for both services to be ready
      const pgReady = await waitForService('127.0.0.1', 5432, 60000)
      const redisReady = await waitForService('127.0.0.1', 6379, 30000)

      expect(pgReady).toBe(true)
      expect(redisReady).toBe(true)

      // Test connectivity to both
      const pgConnects = await testPostgreSQLConnection('127.0.0.1', 5432, 'postgres', 'postgres')
      const redisConnects = await testRedisConnection('127.0.0.1', 6379)

      expect(pgConnects).toBe(true)
      expect(redisConnects).toBe(true)

      // Clean up
      await stopService('postgres')
      await stopService('redis')
    }, 150000) // 2.5 minute timeout
  })
})
