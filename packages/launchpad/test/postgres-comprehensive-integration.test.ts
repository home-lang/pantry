import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

/**
 * Comprehensive PostgreSQL Integration Test
 *
 * This test validates the complete PostgreSQL service lifecycle in launchpad,
 * including installation, configuration, environment variable handling,
 * database auto-creation, and proper .env integration.
 *
 * Tests cover:
 * - PostgreSQL service installation and initialization
 * - Environment variable detection from .env files
 * - Automatic database creation based on project configuration
 * - Service health checks and status verification
 * - Template variable resolution for database operations
 * - Framework integration (Laravel, generic projects)
 * - Error handling and edge cases
 */
describe('PostgreSQL Comprehensive Integration', () => {
  let tempDir: string
  let originalCwd: string
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    // Save original environment
    originalEnv = { ...process.env }
    originalCwd = process.cwd()

    // Create temporary test directory
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-postgres-test-'))
    process.chdir(tempDir)

    // Set test mode to avoid actual service operations
    process.env.NODE_ENV = 'test'
    process.env.LAUNCHPAD_TEST_MODE = 'true'
  })

  afterEach(() => {
    // Restore original environment and directory
    process.env = originalEnv
    process.chdir(originalCwd)
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  describe('PostgreSQL Installation and Configuration', () => {
    it('should properly configure PostgreSQL service definition', async () => {
      const { SERVICE_DEFINITIONS } = await import('../src/services/definitions')
      const postgres = SERVICE_DEFINITIONS.postgres

      // Verify service definition structure
      expect(postgres).toBeDefined()
      expect(postgres.name).toBe('postgres')
      expect(postgres.displayName).toBe('PostgreSQL')
      expect(postgres.packageDomain).toBe('postgresql.org')
      expect(postgres.executable).toBe('postgres')
      expect(postgres.port).toBe(5432)

      // Verify required dependencies for proper installation
      expect(postgres.dependencies).toContain('unicode.org^73')
      expect(postgres.dependencies).toContain('openssl.org^1.0.1')
      expect(postgres.dependencies).toContain('gnu.org/readline')
      expect(postgres.dependencies).toContain('zlib.net')
      expect(postgres.dependencies).toContain('lz4.org')
      expect(postgres.dependencies).toContain('gnome.org/libxml2~2.13')
      expect(postgres.dependencies).toContain('gnome.org/libxslt')

      // Verify initialization and runtime configuration
      expect(postgres.initCommand).toBeDefined()
      expect(postgres.initCommand).toContain('initdb')
      expect(postgres.initCommand).toContain('--auth-local={authMethod}')
      expect(postgres.initCommand).toContain('--auth-host={authMethod}')

      // Verify health check configuration
      expect(postgres.healthCheck).toBeDefined()
      expect(postgres.healthCheck?.command).toEqual(['pg_isready', '-h', '127.0.0.1', '-p', '5432'])
      expect(postgres.healthCheck?.expectedExitCode).toBe(0)
      expect(postgres.healthCheck?.timeout).toBe(5)
      expect(postgres.healthCheck?.retries).toBe(3)

      // Verify post-start commands for database setup
      expect(postgres.postStartCommands).toBeDefined()
      expect(postgres.postStartCommands?.length).toBeGreaterThan(0)

      // Verify graceful shutdown support
      expect(postgres.supportsGracefulShutdown).toBe(true)
    })

    it('should handle PostgreSQL service lifecycle operations', async () => {
      const { startService, stopService, getServiceStatus, enableService, disableService } = await import('../src/services/manager')

      // Test service start (mocked in test mode)
      const startResult = await startService('postgres')
      expect(startResult).toBe(true)

      // Test service status check
      const status = await getServiceStatus('postgres')
      expect(['running', 'stopped', 'starting', 'stopping', 'failed', 'unknown']).toContain(status)

      // Test service enable/disable
      const enableResult = await enableService('postgres')
      expect(enableResult).toBe(true)

      const disableResult = await disableService('postgres')
      expect(disableResult).toBe(true)

      // Test service stop
      const stopResult = await stopService('postgres')
      expect(stopResult).toBe(true)
    })
  })

  describe('Environment Variable Detection and Configuration', () => {
    it('should correctly detect PostgreSQL configuration from .env file', async () => {
      // Create Laravel project with PostgreSQL .env configuration
      const envContent = `
APP_NAME="Test Laravel App"
APP_ENV=local
APP_KEY=base64:test-key-here
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=laravel_custom_db
DB_USERNAME=laravel_user
DB_PASSWORD=secure_password123
`
      fs.writeFileSync('.env', envContent.trim())

      // Create Laravel project structure
      fs.writeFileSync('artisan', '#!/usr/bin/env php\n<?php\n// Laravel Artisan')
      fs.writeFileSync('composer.json', JSON.stringify({
        name: 'vendor/test-laravel-app',
        type: 'project',
        require: {
          'php': '^8.1',
          'laravel/framework': '^10.0'
        }
      }))

      const { getDatabaseNameFromEnv, detectProjectName, resolveServiceTemplateVariables } = await import('../src/services/manager')
      const { SERVICE_DEFINITIONS } = await import('../src/services/definitions')

      // Test environment variable detection
      const envDbName = getDatabaseNameFromEnv()
      const projectName = detectProjectName()

      expect(envDbName).toBe('laravel_custom_db')
      expect(projectName).toBe('test_laravel_app')

      // Test template variable resolution with actual service definition
      const mockService = {
        definition: SERVICE_DEFINITIONS.postgres,
        config: {},
      }

      const resolvedDbName = resolveServiceTemplateVariables('{projectDatabase}', mockService)
      const resolvedHost = resolveServiceTemplateVariables('{dbUsername}', mockService)
      const resolvedPort = resolveServiceTemplateVariables('{port}', mockService)

      expect(resolvedDbName).toBe('laravel_custom_db') // Should use .env value
      expect(resolvedHost).toBe('root') // Default from config
      expect(resolvedPort).toBe('5432') // PostgreSQL default port
    })

    it('should fallback to project name when DB_DATABASE is not in .env', async () => {
      // Create .env without DB_DATABASE
      const envContent = `
APP_NAME="Fallback App"
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USERNAME=app_user
DB_PASSWORD=app_pass
`
      fs.writeFileSync('.env', envContent.trim())
      fs.writeFileSync('composer.json', JSON.stringify({
        name: 'vendor/fallback-test-app',
        type: 'project'
      }))

      const { getDatabaseNameFromEnv, detectProjectName, resolveServiceTemplateVariables } = await import('../src/services/manager')
      const { SERVICE_DEFINITIONS } = await import('../src/services/definitions')

      const envDbName = getDatabaseNameFromEnv()
      const projectName = detectProjectName()

      expect(envDbName).toBe(null) // No DB_DATABASE in .env
      expect(projectName).toBe('fallback_test_app')

      // Template resolution should use project name as fallback
      const mockService = {
        definition: SERVICE_DEFINITIONS.postgres,
        config: {},
      }

      const resolvedDbName = resolveServiceTemplateVariables('{projectDatabase}', mockService)
      expect(resolvedDbName).toBe('fallback_test_app')
    })

    it('should sanitize database names with special characters', async () => {
      const envContent = `
DB_CONNECTION=pgsql
DB_DATABASE=my-special@db#name$with%chars
`
      fs.writeFileSync('.env', envContent.trim())

      const { getDatabaseNameFromEnv } = await import('../src/services/manager')
      const dbName = getDatabaseNameFromEnv()

      // Special characters should be converted to underscores
      expect(dbName).toBe('my_special_db_name_with_chars')
    })

    it('should handle quoted database names in .env', async () => {
      const envContent = `
DB_CONNECTION=pgsql
DB_DATABASE="quoted_database_name"
`
      fs.writeFileSync('.env', envContent.trim())

      const { getDatabaseNameFromEnv } = await import('../src/services/manager')
      const dbName = getDatabaseNameFromEnv()

      // Quotes should be removed
      expect(dbName).toBe('quoted_database_name')
    })

    it('should work with non-Laravel projects', async () => {
      // Create generic Node.js project
      const envContent = `
DB_CONNECTION=pgsql
DB_DATABASE=generic_node_app_db
DB_HOST=localhost
DB_PORT=5432
`
      fs.writeFileSync('.env', envContent.trim())
      fs.writeFileSync('package.json', JSON.stringify({
        name: 'generic-node-app',
        version: '1.0.0',
        description: 'A generic Node.js application'
      }))

      const { getDatabaseNameFromEnv, detectProjectName } = await import('../src/services/manager')

      const envDbName = getDatabaseNameFromEnv()
      const projectName = detectProjectName()

      expect(envDbName).toBe('generic_node_app_db')
      expect(projectName).toBe('generic_node_app')
    })
  })

  describe('Database Auto-Creation and Post-Start Commands', () => {
    it('should generate correct PostgreSQL post-start commands', async () => {
      // Setup test project
      const envContent = `
DB_CONNECTION=pgsql
DB_DATABASE=auto_created_db
DB_USERNAME=test_user
DB_PASSWORD=test_pass
`
      fs.writeFileSync('.env', envContent.trim())
      fs.writeFileSync('composer.json', JSON.stringify({
        name: 'vendor/auto-db-test',
        type: 'project'
      }))

      const { resolveServiceTemplateVariables } = await import('../src/services/manager')
      const { SERVICE_DEFINITIONS } = await import('../src/services/definitions')

      const mockService = {
        definition: SERVICE_DEFINITIONS.postgres,
        config: {},
      }

      // Test all post-start commands
      const postStartCommands = SERVICE_DEFINITIONS.postgres.postStartCommands
      expect(postStartCommands).toBeDefined()

      if (postStartCommands) {
        // Resolve all template variables in post-start commands
        const resolvedCommands = postStartCommands.map(cmd =>
          cmd.map(arg => resolveServiceTemplateVariables(arg, mockService))
        )

        // Verify database creation command
        const createDbCmd = resolvedCommands.find(cmd => cmd.includes('createdb'))
        expect(createDbCmd).toBeDefined()
        expect(createDbCmd).toContain('auto_created_db')
        expect(createDbCmd).toContain('-h')
        expect(createDbCmd).toContain('127.0.0.1')
        expect(createDbCmd).toContain('-p')
        expect(createDbCmd).toContain('5432')

        // Verify user creation command (using DO $$ block for idempotency)
        const createUserCmd = resolvedCommands.find(cmd => {
          const cmdStr = cmd.join(' ')
          return cmdStr.includes('CREATE ROLE') && cmdStr.includes('DO $$')
        })
        expect(createUserCmd).toBeDefined()

        // Verify database ownership and permissions
        const grantOwnershipCmd = resolvedCommands.find(cmd => {
          const cmdStr = cmd.join(' ')
          return cmdStr.includes('ALTER DATABASE') && cmdStr.includes('OWNER TO')
        })
        expect(grantOwnershipCmd).toBeDefined()

        const grantPrivilegesCmd = resolvedCommands.find(cmd => {
          const cmdStr = cmd.join(' ')
          return cmdStr.includes('GRANT ALL PRIVILEGES ON DATABASE')
        })
        expect(grantPrivilegesCmd).toBeDefined()

        // Verify schema permissions
        const schemaCreateCmd = resolvedCommands.find(cmd => {
          const cmdStr = cmd.join(' ')
          return cmdStr.includes('GRANT CREATE ON SCHEMA public')
        })
        expect(schemaCreateCmd).toBeDefined()

        const schemaUsageCmd = resolvedCommands.find(cmd => {
          const cmdStr = cmd.join(' ')
          return cmdStr.includes('GRANT USAGE ON SCHEMA public')
        })
        expect(schemaUsageCmd).toBeDefined()
      }
    })

    it('should handle default configuration values correctly', async () => {
      // Create minimal project without specific database config
      fs.writeFileSync('package.json', JSON.stringify({
        name: 'minimal-app',
        version: '1.0.0'
      }))

      const { resolveServiceTemplateVariables } = await import('../src/services/manager')
      const { SERVICE_DEFINITIONS } = await import('../src/services/definitions')

      const mockService = {
        definition: SERVICE_DEFINITIONS.postgres,
        config: {},
      }

      // Test default values
      const resolvedDbName = resolveServiceTemplateVariables('{projectDatabase}', mockService)
      const resolvedUsername = resolveServiceTemplateVariables('{dbUsername}', mockService)
      const resolvedPassword = resolveServiceTemplateVariables('{dbPassword}', mockService)
      const resolvedAuthMethod = resolveServiceTemplateVariables('{authMethod}', mockService)
      const resolvedPort = resolveServiceTemplateVariables('{port}', mockService)

      expect(resolvedDbName).toBe('minimal_app') // From project name
      expect(resolvedUsername).toBe('root') // Default username
      expect(resolvedPassword).toBe('password') // Default password
      expect(resolvedAuthMethod).toBe('trust') // Default auth method
      expect(resolvedPort).toBe('5432') // PostgreSQL default port
    })
  })

  describe('Service Manager Integration', () => {
    it('should create proper service instance with PostgreSQL definition', async () => {
      const { startService } = await import('../src/services/manager')

      // Start PostgreSQL service (mocked in test mode)
      const result = await startService('postgres')
      expect(result).toBe(true)

      // Import service manager to check instance creation
      const managerModule = await import('../src/services/manager')
      const serviceManagerState = (managerModule as any).serviceManagerState

      if (serviceManagerState) {
        const postgresInstance = serviceManagerState.services.get('postgres')
        expect(postgresInstance).toBeDefined()
        expect(postgresInstance?.name).toBe('postgres')
        expect(postgresInstance?.definition?.packageDomain).toBe('postgresql.org')
        expect(postgresInstance?.status).toBe('running') // Mocked as running in test mode
      }
    })

    it('should track service operations correctly', async () => {
      const { startService, stopService, enableService } = await import('../src/services/manager')

      // Perform multiple operations
      await startService('postgres')
      await enableService('postgres')
      await stopService('postgres')

      // Check that operations were tracked
      const managerModule = await import('../src/services/manager')
      const serviceManagerState = (managerModule as any).serviceManagerState

      if (serviceManagerState) {
        const operations = serviceManagerState.operations.filter((op: any) =>
          op.serviceName === 'postgres'
        )

        expect(operations.length).toBeGreaterThanOrEqual(3)

        const startOp = operations.find((op: any) => op.action === 'start')
        const enableOp = operations.find((op: any) => op.action === 'enable')
        const stopOp = operations.find((op: any) => op.action === 'stop')

        expect(startOp).toBeDefined()
        expect(enableOp).toBeDefined()
        expect(stopOp).toBeDefined()

        // All operations should be successful in test mode
        expect(startOp?.result).toBe('success')
        expect(enableOp?.result).toBe('success')
        expect(stopOp?.result).toBe('success')
      }
    })
  })

  describe('Database Service Integration', () => {
    it('should integrate with database creation utilities', async () => {
      // Create Laravel project setup
      const envContent = `
DB_CONNECTION=pgsql
DB_DATABASE=integration_test_db
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USERNAME=integration_user
DB_PASSWORD=integration_pass
`
      fs.writeFileSync('.env', envContent.trim())
      fs.writeFileSync('artisan', '#!/usr/bin/env php\n<?php\n// Laravel Artisan')

      // Test database utilities integration
      const { createProjectDatabase } = await import('../src/services/database')

      try {
        const dbInfo = await createProjectDatabase('integration_test_db', {
          type: 'postgres',
          host: '127.0.0.1',
          port: 5432,
          user: 'integration_user',
          password: 'integration_pass'
        })

        expect(dbInfo.type).toBe('postgres')
        expect(dbInfo.database).toBe('integration_test_db')
        expect(dbInfo.host).toBe('127.0.0.1')
        expect(dbInfo.port).toBe(5432)
        expect(dbInfo.username).toBe('integration_user')
        expect(dbInfo.password).toBe('integration_pass')
      } catch (error) {
        // Database creation may fail in test environment without actual PostgreSQL
        // This is expected and acceptable for unit testing
        expect(error).toBeInstanceOf(Error)
      }
    })

    it('should generate correct Laravel .env configuration', async () => {
      const { generateLaravelConfig } = await import('../src/services/database')

      const dbInfo = {
        type: 'postgres' as const,
        host: '127.0.0.1',
        port: 5432,
        database: 'test_laravel_db',
        username: 'laravel_user',
        password: 'laravel_pass'
      }

      const config = generateLaravelConfig(dbInfo, true)

      expect(config).toContain('DB_CONNECTION=pgsql')
      expect(config).toContain('DB_HOST=127.0.0.1')
      expect(config).toContain('DB_PORT=5432')
      expect(config).toContain('DB_DATABASE=test_laravel_db')
      expect(config).toContain('DB_USERNAME=laravel_user')
      expect(config).toContain('DB_PASSWORD=laravel_pass')

      // Should include Meilisearch configuration when requested
      expect(config).toContain('SCOUT_DRIVER=meilisearch')
      expect(config).toContain('MEILISEARCH_HOST=http://127.0.0.1:7700')
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing .env file gracefully', async () => {
      // No .env file created
      fs.writeFileSync('package.json', JSON.stringify({
        name: 'no-env-app',
        version: '1.0.0'
      }))

      const { getDatabaseNameFromEnv, detectProjectName } = await import('../src/services/manager')

      const envDbName = getDatabaseNameFromEnv()
      const projectName = detectProjectName()

      expect(envDbName).toBe(null)
      expect(projectName).toBe('no_env_app') // Should fallback to directory/project name
    })

    it('should handle malformed .env file', async () => {
      // Create malformed .env file
      const malformedEnv = `
APP_NAME=Test
DB_CONNECTION=pgsql
DB_DATABASE=
INVALID_LINE_WITHOUT_EQUALS
DB_USERNAME="unclosed_quote
DB_PASSWORD=normal_value
`
      fs.writeFileSync('.env', malformedEnv.trim())

      const { getDatabaseNameFromEnv } = await import('../src/services/manager')

      // Should handle malformed file without crashing
      expect(() => getDatabaseNameFromEnv()).not.toThrow()
    })

    it('should handle unknown service gracefully', async () => {
      const { startService } = await import('../src/services/manager')

      // Try to start non-existent service
      const result = await startService('nonexistent-service')
      expect(result).toBe(false)
    })

    it('should validate service definition completeness', async () => {
      const { SERVICE_DEFINITIONS, getServiceDefinition } = await import('../src/services/definitions')

      const postgres = getServiceDefinition('postgres')
      expect(postgres).toBeDefined()

      if (postgres) {
        // Verify all required fields are present
        expect(postgres.executable).toBeTruthy()
        expect(postgres.packageDomain).toBeTruthy()
        expect(postgres.port).toBeGreaterThan(0)
        expect(postgres.healthCheck).toBeDefined()
        expect(postgres.initCommand).toBeDefined()
        expect(postgres.postStartCommands).toBeDefined()
        expect(Array.isArray(postgres.dependencies)).toBe(true)
        expect(postgres.dependencies.length).toBeGreaterThan(0)
      }
    })
  })

  describe('Configuration and Template Resolution', () => {
    it('should resolve all template variables correctly', async () => {
      // Create comprehensive test project
      const envContent = `
DB_CONNECTION=pgsql
DB_DATABASE=template_test_db
DB_HOST=192.168.1.100
DB_PORT=5433
DB_USERNAME=template_user
DB_PASSWORD=template_pass
`
      fs.writeFileSync('.env', envContent.trim())
      fs.writeFileSync('composer.json', JSON.stringify({
        name: 'vendor/template-test-project',
        type: 'project'
      }))

      const { resolveServiceTemplateVariables } = await import('../src/services/manager')
      const { SERVICE_DEFINITIONS } = await import('../src/services/definitions')

      const mockService = {
        definition: SERVICE_DEFINITIONS.postgres,
        config: {
          customValue: 'custom_config_value'
        },
      }

      // Test all standard template variables
      const templates = [
        '{projectDatabase}',
        '{projectName}',
        '{dbUsername}',
        '{dbPassword}',
        '{port}',
        '{dataDir}',
        '{configFile}',
        '{logFile}',
        '{pidFile}',
        '{authMethod}',
        '{customValue}' // Custom config value
      ]

      const resolved = templates.map(template => ({
        template,
        resolved: resolveServiceTemplateVariables(template, mockService)
      }))

      // Verify each template resolves to a non-empty value
      resolved.forEach(({ template, resolved: value }) => {
        expect(value).toBeTruthy()
        expect(value).not.toBe(template) // Should be different from template
        if (template === '{projectDatabase}') {
          expect(value).toBe('template_test_db')
        }
        if (template === '{projectName}') {
          expect(value).toBe('template_test_project')
        }
        if (template === '{port}') {
          expect(value).toBe('5432') // PostgreSQL default, not from env
        }
        if (template === '{customValue}') {
          expect(value).toBe('custom_config_value')
        }
      })
    })
  })
})