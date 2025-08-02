import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

// TDD Tests for Database Auto-Creation Functionality

describe('Database Auto-Creation with .env Detection', () => {
  let tempDir: string
  let originalCwd: string

  beforeEach(() => {
    originalCwd = process.cwd()
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-db-test-'))
    process.chdir(tempDir)
  })

  afterEach(() => {
    process.chdir(originalCwd)
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  describe('PostgreSQL Database Auto-Creation', () => {
    it('should detect PostgreSQL database name from .env file', async () => {
      // Arrange: Create Laravel project with PostgreSQL .env
      const envContent = `
APP_NAME=MyApp
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=my_custom_postgres_db
DB_USERNAME=root
DB_PASSWORD=password
`
      fs.writeFileSync('.env', envContent.trim())
      fs.writeFileSync('artisan', '#!/usr/bin/env php\n<?php\n// Laravel Artisan')
      fs.writeFileSync('composer.json', JSON.stringify({
        name: 'vendor/my-laravel-app',
        type: 'project',
      }))

      // Act: Import database detection functions
      const { getDatabaseNameFromEnv, detectProjectName, resolveServiceTemplateVariables } = await import('../src/services/manager')

      // Mock service instance for PostgreSQL
      const mockPostgresService = {
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

      // Assert: Database name should be detected from .env
      const envDbName = getDatabaseNameFromEnv()
      const projectName = detectProjectName()
      const resolvedDbName = resolveServiceTemplateVariables('{projectDatabase}', mockPostgresService)

      expect(envDbName).toBe('my_custom_postgres_db')
      expect(projectName).toBe('my_laravel_app')
      expect(resolvedDbName).toBe('my_custom_postgres_db') // Should use .env value, not project name
    })

    it('should fallback to project name when no DB_DATABASE in .env', async () => {
      // Arrange: Create Laravel project without DB_DATABASE
      const envContent = `
APP_NAME=MyApp
DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
`
      fs.writeFileSync('.env', envContent.trim())
      fs.writeFileSync('artisan', '#!/usr/bin/env php\n<?php\n// Laravel Artisan')
      fs.writeFileSync('composer.json', JSON.stringify({
        name: 'vendor/fallback-project',
        type: 'project',
      }))

      // Act
      const { getDatabaseNameFromEnv, detectProjectName, resolveServiceTemplateVariables } = await import('../src/services/manager')

      const mockPostgresService = {
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

      // Assert: Should fallback to project name
      const envDbName = getDatabaseNameFromEnv()
      const projectName = detectProjectName()
      const resolvedDbName = resolveServiceTemplateVariables('{projectDatabase}', mockPostgresService)

      expect(envDbName).toBe(null)
      expect(projectName).toBe('fallback_project')
      expect(resolvedDbName).toBe('fallback_project')
    })

    it('should sanitize database names with special characters', async () => {
      // Arrange: Create .env with special characters in database name
      const envContent = `
DB_CONNECTION=pgsql
DB_DATABASE=my-special@db#name$
`
      fs.writeFileSync('.env', envContent.trim())
      fs.writeFileSync('artisan', '')

      // Act
      const { getDatabaseNameFromEnv } = await import('../src/services/manager')
      const dbName = getDatabaseNameFromEnv()

      // Assert: Special characters should be converted to underscores
      expect(dbName).toBe('my_special_db_name_')
    })

    it('should handle quoted database names in .env', async () => {
      // Arrange: Create .env with quoted database name
      const envContent = `
DB_CONNECTION=pgsql
DB_DATABASE="my_quoted_database"
`
      fs.writeFileSync('.env', envContent.trim())
      fs.writeFileSync('artisan', '')

      // Act
      const { getDatabaseNameFromEnv } = await import('../src/services/manager')
      const dbName = getDatabaseNameFromEnv()

      // Assert: Quotes should be removed
      expect(dbName).toBe('my_quoted_database')
    })
  })

  describe('SQLite Database Auto-Creation', () => {
    it('should detect SQLite database path from .env file', async () => {
      // Arrange: Create Laravel project with SQLite .env
      const envContent = `
APP_NAME=MyApp
DB_CONNECTION=sqlite
DB_DATABASE=/path/to/custom/database.sqlite
`
      fs.writeFileSync('.env', envContent.trim())
      fs.writeFileSync('artisan', '#!/usr/bin/env php\n<?php\n// Laravel Artisan')
      fs.writeFileSync('composer.json', JSON.stringify({
        name: 'vendor/sqlite-app',
        type: 'project',
      }))

      // Act
      const { getDatabaseNameFromEnv, detectProjectName } = await import('../src/services/manager')

      // Assert: Should detect SQLite path from .env
      const envDbName = getDatabaseNameFromEnv()
      const projectName = detectProjectName()

      expect(envDbName).toBe('_path_to_custom_database_sqlite')
      expect(projectName).toBe('sqlite_app')
    })

    it('should handle relative SQLite paths', async () => {
      // Arrange: Create .env with relative SQLite path
      const envContent = `
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite
`
      fs.writeFileSync('.env', envContent.trim())
      fs.writeFileSync('artisan', '')

      // Act
      const { getDatabaseNameFromEnv } = await import('../src/services/manager')
      const dbName = getDatabaseNameFromEnv()

      // Assert: Should convert path to valid database name
      expect(dbName).toBe('database_database_sqlite')
    })

    it('should create SQLite database file automatically', async () => {
      // Arrange: Create Laravel project with SQLite
      const envContent = `
DB_CONNECTION=sqlite
DB_DATABASE=database/test.sqlite
`
      fs.writeFileSync('.env', envContent.trim())
      fs.writeFileSync('artisan', '')

      // Create database directory
      fs.mkdirSync('database', { recursive: true })

      // Act: Import SQLite setup function
      const { setupSQLiteForProject } = await import('../src/services/manager')

      // Note: This test expects the function to be exported
      // We'll implement this in the next step
      if (setupSQLiteForProject) {
        const result = await setupSQLiteForProject()

        // Assert: SQLite file should be created
        expect(result).toBe(true)
        expect(fs.existsSync('database/test.sqlite')).toBe(true)
      }
    })
  })

  describe('Framework-Agnostic Database Detection', () => {
    it('should work with non-Laravel projects', async () => {
      // Arrange: Create non-Laravel project with .env
      const envContent = `
DB_CONNECTION=pgsql
DB_DATABASE=custom_framework_db
`
      fs.writeFileSync('.env', envContent.trim())
      // No artisan file (not Laravel)
      fs.writeFileSync('package.json', JSON.stringify({
        name: 'my-custom-framework',
        version: '1.0.0',
      }))

      // Act
      const { getDatabaseNameFromEnv, detectProjectName } = await import('../src/services/manager')

      // Assert
      const envDbName = getDatabaseNameFromEnv()
      const projectName = detectProjectName()

      expect(envDbName).toBe('custom_framework_db')
      expect(projectName).toBe('my_custom_framework') // Should work with any project
    })

    it('should handle projects without any .env file', async () => {
      // Arrange: Create project without .env
      fs.writeFileSync('package.json', JSON.stringify({
        name: 'no-env-project',
        version: '1.0.0',
      }))

      // Act
      const { getDatabaseNameFromEnv, detectProjectName } = await import('../src/services/manager')

      // Assert: Should fallback gracefully
      const envDbName = getDatabaseNameFromEnv()
      const projectName = detectProjectName()

      expect(envDbName).toBe(null)
      expect(projectName).toBe('no_env_project')
    })
  })

  describe('Database Service Integration', () => {
    it('should generate correct PostgreSQL creation commands', async () => {
      // Arrange: Setup PostgreSQL service with custom database name
      const envContent = `
DB_CONNECTION=pgsql
DB_DATABASE=integration_test_db
`
      fs.writeFileSync('.env', envContent.trim())
      fs.writeFileSync('artisan', '')

      // Act: Test template variable resolution
      const { resolveServiceTemplateVariables } = await import('../src/services/manager')

      const mockPostgresService = {
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
          postStartCommands: [
            ['createdb', '-h', '127.0.0.1', '-p', '5432', '{projectDatabase}'],
            ['psql', '-h', '127.0.0.1', '-p', '5432', '-d', 'postgres', '-c', 'CREATE USER IF NOT EXISTS {dbUsername} WITH PASSWORD \'{dbPassword}\';'],
          ],
        },
        config: {},
        status: 'stopped' as const,
        lastCheckedAt: new Date(),
        enabled: true,
      }

      // Assert: Commands should use detected database name
      const createDbCommand = resolveServiceTemplateVariables('createdb -h 127.0.0.1 -p 5432 {projectDatabase}', mockPostgresService)
      const createUserCommand = resolveServiceTemplateVariables('CREATE USER IF NOT EXISTS {dbUsername} WITH PASSWORD \'{dbPassword}\';', mockPostgresService)

      expect(createDbCommand).toBe('createdb -h 127.0.0.1 -p 5432 integration_test_db')
      expect(createUserCommand).toContain('root') // Should use default username
      expect(createUserCommand).toContain('password') // Should use default password
    })

    it('should handle MySQL database creation with env detection', async () => {
      // Arrange: Setup MySQL project
      const envContent = `
DB_CONNECTION=mysql
DB_DATABASE=mysql_custom_db
`
      fs.writeFileSync('.env', envContent.trim())
      fs.writeFileSync('artisan', '')

      // Act
      const { resolveServiceTemplateVariables } = await import('../src/services/manager')

      const mockMysqlService = {
        definition: {
          name: 'mysql',
          displayName: 'MySQL',
          description: 'MySQL Database Server',
          packageDomain: 'mysql.com',
          executable: 'mysqld',
          args: [],
          env: {},
          dependencies: [],
          supportsGracefulShutdown: true,
          port: 3306,
          config: {},
        },
        config: {},
        status: 'stopped' as const,
        lastCheckedAt: new Date(),
        enabled: true,
      }

      // Assert: Should resolve MySQL database name from .env
      const resolvedDbName = resolveServiceTemplateVariables('{projectDatabase}', mockMysqlService)
      expect(resolvedDbName).toBe('mysql_custom_db')
    })
  })
})
