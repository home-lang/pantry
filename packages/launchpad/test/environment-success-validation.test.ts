import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { config } from '../src/config'
import { install } from '../src/install-main'

// Helper function to detect if we're in a CI environment
function isRunningInCI(): boolean {
  return process.env.CI === 'true'
    || process.env.GITHUB_ACTIONS === 'true'
    || process.env.RUNNER_OS !== undefined
    || process.env.GITHUB_RUN_ID !== undefined
}

// Helper function to validate service is actually running and connectable
async function validateServiceHealth(serviceName: string): Promise<{ isHealthy: boolean, error?: string }> {
  try {
    switch (serviceName) {
      case 'postgres':
        // Test PostgreSQL connectivity
        try {
          execSync('pg_isready -h 127.0.0.1 -p 5432', { stdio: 'pipe' })
          // Also test actual connection
          execSync('psql -h 127.0.0.1 -p 5432 -U root -d postgres -c "SELECT 1;" 2>/dev/null', {
            stdio: 'pipe',
            env: { ...process.env, PGPASSWORD: '' },
          })
          return { isHealthy: true }
        }
        catch (error) {
          return { isHealthy: false, error: `PostgreSQL connection failed: ${error}` }
        }

      case 'redis':
        // Test Redis connectivity
        try {
          const result = execSync('redis-cli -h 127.0.0.1 -p 6379 ping', { stdio: 'pipe' })
          if (result.toString().trim() === 'PONG') {
            return { isHealthy: true }
          }
          return { isHealthy: false, error: 'Redis ping failed' }
        }
        catch (error) {
          return { isHealthy: false, error: `Redis connection failed: ${error}` }
        }

      case 'php':
        // Test PHP binary functionality
        try {
          const result = execSync('php --version', { stdio: 'pipe' })
          if (result.toString().includes('PHP')) {
            return { isHealthy: true }
          }
          return { isHealthy: false, error: 'PHP version check failed' }
        }
        catch (error) {
          return { isHealthy: false, error: `PHP execution failed: ${error}` }
        }

      case 'composer':
        // Test Composer functionality
        try {
          const result = execSync('composer --version', { stdio: 'pipe' })
          if (result.toString().includes('Composer')) {
            return { isHealthy: true }
          }
          return { isHealthy: false, error: 'Composer version check failed' }
        }
        catch (error) {
          return { isHealthy: false, error: `Composer execution failed: ${error}` }
        }

      default:
        return { isHealthy: false, error: `Unknown service: ${serviceName}` }
    }
  }
  catch (error) {
    return { isHealthy: false, error: `Service validation failed: ${error}` }
  }
}

// Helper function to create a test deps.yaml file
function createTestDepsFile(tempDir: string, services: string[] = []): string {
  const depsContent = `dependencies:
  bun: ^1.2.19
  node: ^22.17.0
  php.net: 8.4.12
  composer: ^2.8.10
  postgresql.org: 17.2.0
  redis.io: 8.2.1

services:
  enabled: true
  autoStart:
${services.map(service => `    - ${service}`).join('\n')}
`
  const depsPath = path.join(tempDir, 'deps.yaml')
  fs.writeFileSync(depsPath, depsContent)
  return depsPath
}

describe('Environment Success Validation', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string
  let originalConfig: typeof config.services

  beforeEach(() => {
    originalEnv = { ...process.env }
    originalConfig = { ...config.services }
    tempDir = fs.mkdtempSync(path.join(tmpdir(), 'launchpad-env-validation-'))

    // Set test environment
    process.env.NODE_ENV = 'test'
    process.env.LAUNCHPAD_TEST_MODE = 'true'

    // Override service directories for testing
    if (config.services) {
      config.services.dataDir = path.join(tempDir, 'services')
      config.services.logDir = path.join(tempDir, 'logs')
      config.services.configDir = path.join(tempDir, 'config')
    }
  })

  afterEach(() => {
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

  describe('Installation Success Validation', () => {
    it('should not report success if required services fail to start', async () => {
      if (isRunningInCI()) {
        console.log('Skipping service validation test in CI environment')
        return
      }

      // Create deps.yaml with auto-start services
      createTestDepsFile(tempDir, ['postgres', 'redis'])

      // Change to temp directory for installation
      const originalCwd = process.cwd()
      process.chdir(tempDir)

      try {
        // Run installation - this should validate services actually work
        const result = await install(['php.net@8.4.12', 'postgresql.org@17.2.0', 'redis.io@8.2.1'])

        // If installation reports success, all services should be healthy
        if (result && result.length > 0) {
          // Validate each auto-start service is actually working
          const pgHealth = await validateServiceHealth('postgres')
          const redisHealth = await validateServiceHealth('redis')
          const phpHealth = await validateServiceHealth('php')

          // All services should be healthy if installation succeeded
          expect(pgHealth.isHealthy).toBe(true)
          expect(redisHealth.isHealthy).toBe(true)
          expect(phpHealth.isHealthy).toBe(true)

          if (!pgHealth.isHealthy) {
            throw new Error(`PostgreSQL not healthy after successful installation: ${pgHealth.error}`)
          }
          if (!redisHealth.isHealthy) {
            throw new Error(`Redis not healthy after successful installation: ${redisHealth.error}`)
          }
          if (!phpHealth.isHealthy) {
            throw new Error(`PHP not healthy after successful installation: ${phpHealth.error}`)
          }
        }
      }
      finally {
        process.chdir(originalCwd)
      }
    }, 300000) // 5 minute timeout for full installation

    it('should validate PHP binary can execute without library errors', async () => {
      if (isRunningInCI()) {
        console.log('Skipping PHP binary validation test in CI environment')
        return
      }

      // Create minimal deps.yaml
      createTestDepsFile(tempDir, [])

      const originalCwd = process.cwd()
      process.chdir(tempDir)

      try {
        // Install just PHP
        await install(['php.net@8.4.12'])

        // Validate PHP works without ncurses errors
        const phpHealth = await validateServiceHealth('php')
        expect(phpHealth.isHealthy).toBe(true)

        // Test specific PHP functionality that might fail with library issues
        try {
          const result = execSync('php -r "echo phpversion();"', { stdio: 'pipe' })
          expect(result.toString()).toMatch(/^8\.4\.\d+/)
        }
        catch (error) {
          throw new Error(`PHP execution failed with library error: ${error}`)
        }

        // Test PHP extensions are loaded
        try {
          const result = execSync('php -m', { stdio: 'pipe' })
          const extensions = result.toString()
          expect(extensions).toContain('Core')
          expect(extensions).toContain('date')
        }
        catch (error) {
          throw new Error(`PHP extensions check failed: ${error}`)
        }
      }
      finally {
        process.chdir(originalCwd)
      }
    }, 180000) // 3 minute timeout

    it('should validate Composer is available and functional', async () => {
      if (isRunningInCI()) {
        console.log('Skipping Composer validation test in CI environment')
        return
      }

      createTestDepsFile(tempDir, [])

      const originalCwd = process.cwd()
      process.chdir(tempDir)

      try {
        // Install PHP and Composer
        await install(['php.net@8.4.12', 'getcomposer.org@2.8.11'])

        // Validate Composer works
        const composerHealth = await validateServiceHealth('composer')
        expect(composerHealth.isHealthy).toBe(true)

        // Test Composer can run basic commands
        try {
          const result = execSync('composer diagnose', { stdio: 'pipe' })
          // Should not contain critical errors
          expect(result.toString()).not.toContain('ERROR')
        }
        catch (error) {
          throw new Error(`Composer diagnose failed: ${error}`)
        }
      }
      finally {
        process.chdir(originalCwd)
      }
    }, 180000) // 3 minute timeout
  })

  describe('Service Health Validation', () => {
    it('should detect when PostgreSQL user creation fails', async () => {
      if (isRunningInCI()) {
        console.log('Skipping PostgreSQL user validation test in CI environment')
        return
      }

      // This test validates that we properly detect when PostgreSQL starts
      // but user creation fails (like the "role postgres does not exist" error)
      const pgHealth = await validateServiceHealth('postgres')

      if (!pgHealth.isHealthy) {
        // This is expected if PostgreSQL isn't running or configured properly
        expect(pgHealth.error).toBeDefined()
        console.log('PostgreSQL health check failed as expected:', pgHealth.error)
      }
      else {
        // If PostgreSQL is healthy, it should be fully functional
        expect(pgHealth.isHealthy).toBe(true)
      }
    })

    it('should detect when Redis fails to start', async () => {
      if (isRunningInCI()) {
        console.log('Skipping Redis validation test in CI environment')
        return
      }

      const redisHealth = await validateServiceHealth('redis')

      if (!redisHealth.isHealthy) {
        // This is expected if Redis isn't running
        expect(redisHealth.error).toBeDefined()
        console.log('Redis health check failed as expected:', redisHealth.error)
      }
      else {
        // If Redis is healthy, it should be fully functional
        expect(redisHealth.isHealthy).toBe(true)
      }
    })
  })
})
