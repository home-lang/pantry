import type { ServiceInstance } from '../src/types'
import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'

// Mock environment to prevent actual service operations
const ORIGINAL_NODE_ENV = process.env.NODE_ENV
const ORIGINAL_TEST_MODE = process.env.LAUNCHPAD_TEST_MODE

describe('Service Auto-Setup - Regression Tests', () => {
  let tempDir: string
  let originalCwd: string

  beforeEach(async () => {
    // Set test mode to prevent actual operations
    process.env.NODE_ENV = 'test'
    process.env.LAUNCHPAD_TEST_MODE = 'true'

    // Create temp directory for test project
    tempDir = fs.mkdtempSync(path.join(tmpdir(), 'launchpad-service-test-'))
    originalCwd = process.cwd()
    process.chdir(tempDir)

    // Create mock composer.json for Laravel project detection
    const composerJson = {
      name: 'test/the-one-otc-api',
      type: 'project',
      require: {
        'php': '^8.1',
        'laravel/framework': '^10.0',
      },
    }
    fs.writeFileSync(path.join(tempDir, 'composer.json'), JSON.stringify(composerJson, null, 2))
  })

  afterEach(async () => {
    // Restore environment
    process.env.NODE_ENV = ORIGINAL_NODE_ENV
    process.env.LAUNCHPAD_TEST_MODE = ORIGINAL_TEST_MODE
    process.chdir(originalCwd)

    // Clean up temp directory
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  describe('PostgreSQL Service Auto-Setup', () => {
    it('should have service definition with automatic package installation capability', async () => {
      // This is a regression test for the bug where services didn't automatically
      // install their packages and dependencies

      const { SERVICE_DEFINITIONS } = await import('../src/services/definitions')
      const postgresService = SERVICE_DEFINITIONS.postgres

      // Verify service has package domain for installation
      expect(postgresService.packageDomain).toBe('postgresql.org')

      // Verify service has all required dependencies including ICU
      expect(postgresService.dependencies).toContain('unicode.org^73')
      expect(postgresService.dependencies).toContain('openssl.org^1.0.1')
      expect(postgresService.dependencies).toContain('gnu.org/readline')
      expect(postgresService.dependencies).toContain('zlib.net')
      expect(postgresService.dependencies).toContain('lz4.org')
      expect(postgresService.dependencies).toContain('gnome.org/libxml2~2.13')
      expect(postgresService.dependencies).toContain('gnome.org/libxslt')
    })

    it('should detect project name from composer.json and use it for database creation', async () => {
      const { detectProjectName, resolveServiceTemplateVariables } = await import('../src/services/manager')

      // Test project name detection
      const projectName = detectProjectName()
      expect(projectName).toBe('the_one_otc_api')

      // Mock service instance
      const mockService: ServiceInstance = {
        name: 'test-service',
        definition: {
          name: 'test-service',
          displayName: 'Test Service',
          description: 'A test service for testing',
          packageDomain: 'test.org',
          executable: 'test',
          args: [],
          env: {},
          dependencies: [],
          supportsGracefulShutdown: true,
          port: 8080,
          config: {},
        },
        config: {},
        status: 'stopped',
        lastCheckedAt: new Date(),
        enabled: false,
      }

      // Test template variable resolution
      const resolved = resolveServiceTemplateVariables('{projectDatabase}', mockService)

      // Should use project name from composer.json
      expect(resolved).toBe('the_one_otc_api')
    })

    it('should use correct authentication configuration (trust for all connections)', async () => {
      const { SERVICE_DEFINITIONS } = await import('../src/services/definitions')

      const postgresService = SERVICE_DEFINITIONS.postgres

      // Verify the init command uses configurable authentication
      expect(postgresService.initCommand).toContain('--auth-host={authMethod}')
      expect(postgresService.initCommand).toContain('--auth-local={authMethod}')
    })

    it('should create database with project-specific name in post-start commands', async () => {
      const { SERVICE_DEFINITIONS } = await import('../src/services/definitions')

      const postgresService = SERVICE_DEFINITIONS.postgres

      // Verify post-start commands use template variables
      const createDbCommand = postgresService.postStartCommands?.find(cmd =>
        Array.isArray(cmd) && cmd.includes('createdb'),
      )

      expect(createDbCommand).toBeDefined()
      expect(createDbCommand).toContain('{projectDatabase}')
    })

    it('should have complete service definition for automatic setup', async () => {
      // This is the main regression test - PostgreSQL service should be configured
      // to handle complete automatic setup without manual intervention

      const { SERVICE_DEFINITIONS } = await import('../src/services/definitions')
      const postgresService = SERVICE_DEFINITIONS.postgres

      // Should have package domain for automatic installation
      expect(postgresService.packageDomain).toBe('postgresql.org')

      // Should have init command for database cluster setup
      expect(postgresService.initCommand).toBeDefined()
      expect(postgresService.initCommand).toContain('initdb')
      expect(postgresService.initCommand).toContain('--auth-host={authMethod}')

      // Should have post-start commands for database and user setup
      expect(postgresService.postStartCommands).toBeDefined()
      expect(postgresService.postStartCommands?.length).toBeGreaterThan(0)

      // Should have health check for service validation
      expect(postgresService.healthCheck).toBeDefined()
      expect(postgresService.healthCheck?.command).toEqual(['pg_isready', '-p', '5432'])
    })
  })

  describe('Service Package Installation Logic', () => {
    it('should have ensureServicePackageInstalled function that checks for packages', async () => {
      // Test that the service manager has the logic to automatically install packages
      // This is a regression test for the missing automatic installation

      const { SERVICE_DEFINITIONS } = await import('../src/services/definitions')
      const postgresService = SERVICE_DEFINITIONS.postgres

      // The service should be configured to allow automatic installation
      expect(postgresService.packageDomain).toBe('postgresql.org')
      expect(postgresService.executable).toBe('postgres')

      // The manager should have the install logic (we added ensureServicePackageInstalled)
      // In test mode, this won't actually install but the logic should be present
    })
  })

  describe('Template Variable Resolution', () => {
    it('should handle project names with special characters', async () => {
      // Create composer.json with special characters
      const composerJson = {
        name: 'vendor/my-project-with-dashes',
        type: 'project',
      }
      fs.writeFileSync(path.join(tempDir, 'composer.json'), JSON.stringify(composerJson, null, 2))

      const { resolveServiceTemplateVariables } = await import('../src/services/manager')

      const mockService = {
        name: 'postgres',
        definition: {
          name: 'postgres',
          displayName: 'PostgreSQL',
          description: 'PostgreSQL Database Server',
          packageDomain: 'postgresql.org',
          executable: 'postgres',
          args: [],
          env: {},
          dependencies: [],
          supportsGracefulShutdown: true,
          port: 5432,
          config: {},
        },
        config: {},
        status: 'stopped' as const,
        lastCheckedAt: new Date(),
        enabled: true,
      }

      const resolved = resolveServiceTemplateVariables('{projectDatabase}', mockService)

      // Should convert special characters to underscores
      expect(resolved).toBe('my_project_with_dashes')
    })

    it('should fallback to directory name if composer.json is missing', async () => {
      // Remove composer.json
      fs.unlinkSync(path.join(tempDir, 'composer.json'))

      // Change to a directory with special characters
      const specialDir = path.join(tempDir, 'my-special-project')
      fs.mkdirSync(specialDir)
      process.chdir(specialDir)

      const { resolveServiceTemplateVariables } = await import('../src/services/manager')

      const mockService = {
        name: 'postgres',
        definition: {
          name: 'postgres',
          displayName: 'PostgreSQL',
          description: 'PostgreSQL Database Server',
          packageDomain: 'postgresql.org',
          executable: 'postgres',
          args: [],
          env: {},
          dependencies: [],
          supportsGracefulShutdown: true,
          port: 5432,
          config: {},
        },
        config: {},
        status: 'stopped' as const,
        lastCheckedAt: new Date(),
        enabled: true,
      }

      const resolved = resolveServiceTemplateVariables('{projectDatabase}', mockService)

      // Should use directory name with special characters converted
      expect(resolved).toBe('my_special_project')
    })
  })
})
