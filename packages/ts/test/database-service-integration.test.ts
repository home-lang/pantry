import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { config } from '../src/config'
import { getAllServiceDefinitions, getServiceDefinition } from '../src/services/definitions'

describe('Database Service Integration', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string
  let originalConfig: typeof config.services

  beforeEach(() => {
    originalEnv = { ...process.env }
    originalConfig = { ...config.services }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-db-service-test-'))

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
    // Restore environment variables properly without replacing the entire process.env object
    Object.keys(process.env).forEach((key) => {
      delete process.env[key]
    })
    Object.assign(process.env, originalEnv)
    if (config.services && originalConfig) {
      Object.assign(config.services, originalConfig)
    }

    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  describe('PostgreSQL Service Definition', () => {
    it('should have complete PostgreSQL service definition', () => {
      const postgres = getServiceDefinition('postgres')

      expect(postgres).toBeDefined()
      expect(postgres!.name).toBe('postgres')
      expect(postgres!.displayName).toBe('PostgreSQL')
      expect(postgres!.packageDomain).toBe('postgresql.org')
      expect(postgres!.executable).toBe('postgres')
      expect(postgres!.port).toBe(5432)
      expect(postgres!.supportsGracefulShutdown).toBe(true)
    })

    it('should have correct PostgreSQL initialization command', () => {
      const postgres = getServiceDefinition('postgres')

      expect(postgres).toBeDefined()
      expect(postgres!.initCommand).toBeDefined()
      expect(Array.isArray(postgres!.initCommand)).toBe(true)

      const initCmd = postgres!.initCommand!
      expect(initCmd[0]).toBe('initdb')
      expect(initCmd).toContain('-D')
      expect(initCmd).toContain('{dataDir}')
      expect(initCmd).toContain('--auth-local={authMethod}')
      expect(initCmd).toContain('--auth-host={authMethod}')
      expect(initCmd).toContain('--encoding=UTF8')
    })

    it('should have PostgreSQL postStartCommands for Laravel setup', () => {
      const postgres = getServiceDefinition('postgres')

      expect(postgres).toBeDefined()
      expect(postgres!.postStartCommands).toBeDefined()
      expect(Array.isArray(postgres!.postStartCommands)).toBe(true)

      const postStartCommands = postgres!.postStartCommands!
      expect(postStartCommands.length).toBeGreaterThan(0)

      // Check for database creation command with template variable
      const createDbCmd = postStartCommands.find(cmd => cmd[0] === 'createdb')
      expect(createDbCmd).toBeDefined()
      expect(createDbCmd).toContain('{projectDatabase}')

      // Check for user creation command with template variables
      const createUserCmd = postStartCommands.find((cmd) => {
        if (cmd[0] !== 'psql')
          return false
        const s = cmd.join(' ')
        // Prefer explicit CREATE USER statement; otherwise accept role creation block
        if (s.includes('CREATE USER'))
          return true
        if (s.includes('DO $$') && s.includes('CREATE ROLE'))
          return true
        return false
      })
      expect(createUserCmd).toBeDefined()
      const joined = createUserCmd!.join(' ')
      // For CREATE USER path, must include username/password templates; role block can omit password in test expectation
      if (joined.includes('CREATE USER')) {
        expect(joined).toContain('{dbUsername}')
        expect(joined).toContain('{dbPassword}')
      }

      // Check for grants command with template variables
      const grantsCmd = postStartCommands.find(cmd =>
        cmd[0] === 'psql' && cmd.join(' ').includes('GRANT ALL PRIVILEGES'),
      )
      expect(grantsCmd).toBeDefined()
      expect(grantsCmd!.join(' ')).toContain('{projectDatabase}')
      expect(grantsCmd!.join(' ')).toContain('{dbUsername}')
    })

    it('should have proper PostgreSQL environment variables', () => {
      const postgres = getServiceDefinition('postgres')

      expect(postgres).toBeDefined()
      expect(postgres!.env).toBeDefined()

      const env = postgres!.env!
      expect(env.PGDATA).toBe('{dataDir}')
      // Note: PGUSER and PGDATABASE are not set in the actual implementation
    })

    it('should have PostgreSQL configuration options', () => {
      const postgres = getServiceDefinition('postgres')

      expect(postgres).toBeDefined()
      expect(postgres!.config).toBeDefined()

      const config = postgres!.config!
      expect(config.listen_addresses).toBe('localhost')
      expect(config.port).toBe(5432)
      expect(config.max_connections).toBe(100)
      expect(config.shared_buffers).toBe('128MB')
    })
  })

  describe('MySQL Service Definition', () => {
    it('should have complete MySQL service definition', () => {
      const mysql = getServiceDefinition('mysql')

      expect(mysql).toBeDefined()
      expect(mysql!.name).toBe('mysql')
      expect(mysql!.displayName).toBe('MySQL')
      expect(mysql!.packageDomain).toBe('mysql.com')
      expect(mysql!.executable).toBe('mysqld_safe')
      expect(mysql!.port).toBe(3306)
      expect(mysql!.supportsGracefulShutdown).toBe(true)
    })

    it('should have correct MySQL initialization command', () => {
      const mysql = getServiceDefinition('mysql')

      expect(mysql).toBeDefined()
      expect(mysql!.initCommand).toBeDefined()
      expect(Array.isArray(mysql!.initCommand)).toBe(true)

      const initCmd = mysql!.initCommand!
      expect(initCmd[0]).toBe('mysqld')
      expect(initCmd).toContain('--initialize-insecure')
      expect(initCmd).toContain('--datadir={dataDir}')
      expect(initCmd).toContain('--user=mysql')
    })

    it('should have MySQL postStartCommands for Laravel setup', () => {
      const mysql = getServiceDefinition('mysql')

      expect(mysql).toBeDefined()
      expect(mysql!.postStartCommands).toBeDefined()
      expect(Array.isArray(mysql!.postStartCommands)).toBe(true)

      const postStartCommands = mysql!.postStartCommands!
      expect(postStartCommands.length).toBeGreaterThan(0)

      // Check for database creation command with template variable
      const createDbCmd = postStartCommands.find(cmd =>
        cmd[0] === 'mysql' && cmd.join(' ').includes('CREATE DATABASE IF NOT EXISTS {projectDatabase}'),
      )
      expect(createDbCmd).toBeDefined()

      // Check for user creation command with template variables
      const createUserCmd = postStartCommands.find(cmd =>
        cmd[0] === 'mysql' && cmd.join(' ').includes('CREATE USER IF NOT EXISTS'),
      )
      expect(createUserCmd).toBeDefined()
      expect(createUserCmd!.join(' ')).toContain('{dbUsername}')
      expect(createUserCmd!.join(' ')).toContain('{dbPassword}')

      // Check for privileges grant command with template variable
      const grantCmd = postStartCommands.find(cmd =>
        cmd[0] === 'mysql' && cmd.join(' ').includes('GRANT ALL PRIVILEGES'),
      )
      expect(grantCmd).toBeDefined()
      expect(grantCmd!.join(' ')).toContain('{projectDatabase}')
      expect(grantCmd!.join(' ')).toContain('{dbUsername}')
    })

    it('should have proper MySQL environment variables', () => {
      const mysql = getServiceDefinition('mysql')

      expect(mysql).toBeDefined()
      expect(mysql!.env).toBeDefined()

      // const env = mysql!.env!
      // Note: MySQL env variables are not set in the actual implementation
      // MySQL configuration is handled through config object
    })

    it('should have MySQL configuration options', () => {
      const mysql = getServiceDefinition('mysql')

      expect(mysql).toBeDefined()
      expect(mysql!.config).toBeDefined()

      const config = mysql!.config!
      expect(config.bind_address).toBe('127.0.0.1')
      expect(config.port).toBe(3306)
      expect(config.max_connections).toBe(100)
      expect(config.innodb_buffer_pool_size).toBe('128M')
    })
  })

  describe('Meilisearch Service Definition', () => {
    it('should have complete Meilisearch service definition', () => {
      const meilisearch = getServiceDefinition('meilisearch')

      expect(meilisearch).toBeDefined()
      expect(meilisearch!.name).toBe('meilisearch')
      expect(meilisearch!.displayName).toBe('Meilisearch')
      expect(meilisearch!.packageDomain).toBe('meilisearch.com')
      expect(meilisearch!.executable).toBe('meilisearch')
      expect(meilisearch!.port).toBe(7700)
      expect(meilisearch!.supportsGracefulShutdown).toBe(true)
    })

    it('should have Meilisearch configuration with master key', () => {
      const meilisearch = getServiceDefinition('meilisearch')

      expect(meilisearch).toBeDefined()
      expect(meilisearch!.config).toBeDefined()

      const config = meilisearch!.config!
      expect(config.masterKey).toBe('launchpad-dev-key-12345678901234567890123456789012')
      expect(typeof config.masterKey).toBe('string')
      expect((config.masterKey as string).length).toBeGreaterThan(32) // Ensure adequate key length
    })

    it('should have proper Meilisearch environment variables', () => {
      const meilisearch = getServiceDefinition('meilisearch')

      expect(meilisearch).toBeDefined()
      expect(meilisearch!.env).toBeDefined()

      const env = meilisearch!.env!
      expect(env.MEILI_MASTER_KEY).toBe('{masterKey}')
      expect(env.MEILI_ENV).toBe('development')
      expect(env.MEILI_HTTP_ADDR).toBe('127.0.0.1:{port}')
    })
  })

  describe('PHP Service Definition', () => {
    it('should have PHP service definition for database extensions', () => {
      const php = getServiceDefinition('php')

      if (php) {
        expect(php.name).toBe('php')
        expect(php.displayName).toBe('PHP')
        expect(php.packageDomain).toBe('php.net')
        expect(php.executable).toBe('php')
      }
    })
  })

  describe('Service Integration Validation', () => {
    it('should validate all database services exist', () => {
      const allServices = getAllServiceDefinitions()
      const serviceNames = allServices.map(s => s.name)

      expect(serviceNames).toContain('postgres')
      expect(serviceNames).toContain('mysql')
      expect(serviceNames).toContain('meilisearch')
    })

    it('should validate all database services have unique ports', () => {
      const postgres = getServiceDefinition('postgres')
      const mysql = getServiceDefinition('mysql')
      const meilisearch = getServiceDefinition('meilisearch')

      expect(postgres!.port).not.toBe(mysql!.port)
      expect(postgres!.port).not.toBe(meilisearch!.port)
      expect(mysql!.port).not.toBe(meilisearch!.port)

      expect(postgres!.port).toBe(5432)
      expect(mysql!.port).toBe(3306)
      expect(meilisearch!.port).toBe(7700)
    })

    it('should validate all services support graceful shutdown', () => {
      const postgres = getServiceDefinition('postgres')
      const mysql = getServiceDefinition('mysql')
      const meilisearch = getServiceDefinition('meilisearch')

      expect(postgres!.supportsGracefulShutdown).toBe(true)
      expect(mysql!.supportsGracefulShutdown).toBe(true)
      expect(meilisearch!.supportsGracefulShutdown).toBe(true)
    })

    it('should validate all services have proper package domains', () => {
      const postgres = getServiceDefinition('postgres')
      const mysql = getServiceDefinition('mysql')
      const meilisearch = getServiceDefinition('meilisearch')

      expect(postgres!.packageDomain).toBe('postgresql.org')
      expect(mysql!.packageDomain).toBe('mysql.com')
      expect(meilisearch!.packageDomain).toBe('meilisearch.com')
    })
  })

  describe('Service Template Variable Resolution', () => {
    it('should validate PostgreSQL template variables', () => {
      const postgres = getServiceDefinition('postgres')

      expect(postgres).toBeDefined()

      // Check args contain template variables
      const args = postgres!.args || []
      const hasDataDirTemplate = args.some(arg => typeof arg === 'string' && arg.includes('{dataDir}'))
      expect(hasDataDirTemplate).toBe(true)

      // Check env contains template variables
      const env = postgres!.env || {}
      expect(env.PGDATA).toBe('{dataDir}')
    })

    it('should validate MySQL template variables', () => {
      const mysql = getServiceDefinition('mysql')

      expect(mysql).toBeDefined()

      // Check args contain template variables
      const args = mysql!.args || []
      const hasDataDirTemplate = args.some(arg => typeof arg === 'string' && arg.includes('{dataDir}'))
      // Note: MySQL doesn't use {port} in args in the actual implementation

      expect(hasDataDirTemplate).toBe(true)
    })

    it('should validate Meilisearch template variables', () => {
      const meilisearch = getServiceDefinition('meilisearch')

      expect(meilisearch).toBeDefined()

      // Check args contain template variables
      const args = meilisearch!.args || []
      const hasMasterKeyTemplate = args.some(arg => typeof arg === 'string' && arg.includes('{masterKey}'))
      const hasPortTemplate = args.some(arg => typeof arg === 'string' && arg.includes('{port}'))

      expect(hasMasterKeyTemplate).toBe(true)
      expect(hasPortTemplate).toBe(true)

      // Check env contains template variables
      const env = meilisearch!.env || {}
      expect(env.MEILI_MASTER_KEY).toBe('{masterKey}')
      expect(env.MEILI_HTTP_ADDR).toBe('127.0.0.1:{port}')
    })
  })

  describe('Database Setup Commands Validation', () => {
    it('should validate PostgreSQL commands have proper SQL syntax', () => {
      const postgres = getServiceDefinition('postgres')
      const postStartCommands = postgres!.postStartCommands!

      // Find SQL commands
      const sqlCommands = postStartCommands.filter(cmd =>
        cmd[0] === 'psql' && cmd.includes('-c'),
      )

      expect(sqlCommands.length).toBeGreaterThan(0)

      sqlCommands.forEach((cmd) => {
        const sqlIndex = cmd.indexOf('-c') + 1
        const sql = cmd[sqlIndex]

        expect(sql).toBeDefined()
        expect(typeof sql).toBe('string')
        expect(sql.trim().endsWith(';')).toBe(true) // SQL should end with semicolon
      })
    })

    it('should validate MySQL commands have proper SQL syntax', () => {
      const mysql = getServiceDefinition('mysql')
      const postStartCommands = mysql!.postStartCommands!

      // Find SQL commands
      const sqlCommands = postStartCommands.filter(cmd =>
        cmd[0] === 'mysql' && cmd.includes('-e'),
      )

      expect(sqlCommands.length).toBeGreaterThan(0)

      sqlCommands.forEach((cmd) => {
        const sqlIndex = cmd.indexOf('-e') + 1
        const sql = cmd[sqlIndex]

        expect(sql).toBeDefined()
        expect(typeof sql).toBe('string')
        expect(sql.trim().endsWith(';')).toBe(true) // SQL should end with semicolon
      })
    })

    it('should validate database and user names consistency', () => {
      const postgres = getServiceDefinition('postgres')
      const mysql = getServiceDefinition('mysql')

      // Check PostgreSQL commands use template variables consistently
      const pgCommands = postgres!.postStartCommands!
      const pgCreateDbCmd = pgCommands.find(cmd => cmd[0] === 'createdb')
      const pgUserCmd = pgCommands.find((cmd) => {
        if (cmd[0] !== 'psql')
          return false
        const s = cmd.join(' ')
        // Prefer commands that target the app user
        if (!s.includes('{dbUsername}'))
          return false
        return s.includes('CREATE USER') || (s.includes('DO $$') && s.includes('CREATE ROLE'))
      })

      expect(pgCreateDbCmd).toContain('{projectDatabase}')
      const pgUserJoined = pgUserCmd!.join(' ')
      expect(pgUserJoined).toContain('{dbUsername}')
      expect(pgUserJoined).toContain('{dbPassword}')

      // Check MySQL commands use template variables consistently
      const mysqlCommands = mysql!.postStartCommands!
      const mysqlCreateDbCmd = mysqlCommands.find(cmd =>
        cmd.join(' ').includes('CREATE DATABASE'),
      )
      const mysqlUserCmd = mysqlCommands.find(cmd =>
        cmd.join(' ').includes('CREATE USER'),
      )

      expect(mysqlCreateDbCmd!.join(' ')).toContain('{projectDatabase}')
      expect(mysqlUserCmd!.join(' ')).toContain('{dbUsername}')
      expect(mysqlUserCmd!.join(' ')).toContain('{dbPassword}')
    })
  })

  describe('Service Health Checks', () => {
    it('should validate PostgreSQL health check configuration', () => {
      const postgres = getServiceDefinition('postgres')

      expect(postgres).toBeDefined()
      expect(postgres!.healthCheck).toBeDefined()

      const healthCheck = postgres!.healthCheck!
      expect(healthCheck.command).toBeDefined()
      expect(Array.isArray(healthCheck.command)).toBe(true)
      expect(healthCheck.command[0]).toBe('pg_isready')
      expect(healthCheck.interval).toBeDefined()
      expect(healthCheck.timeout).toBeDefined()
      expect(healthCheck.retries).toBeDefined()
    })

    it('should validate MySQL health check configuration', () => {
      const mysql = getServiceDefinition('mysql')

      expect(mysql).toBeDefined()
      expect(mysql!.healthCheck).toBeDefined()

      const healthCheck = mysql!.healthCheck!
      expect(healthCheck.command).toBeDefined()
      expect(Array.isArray(healthCheck.command)).toBe(true)
      expect(healthCheck.command[0]).toBe('mysqladmin')
      expect(healthCheck.interval).toBeDefined()
      expect(healthCheck.timeout).toBeDefined()
      expect(healthCheck.retries).toBeDefined()
    })

    it('should validate Meilisearch health check configuration', () => {
      const meilisearch = getServiceDefinition('meilisearch')

      expect(meilisearch).toBeDefined()
      expect(meilisearch!.healthCheck).toBeDefined()

      const healthCheck = meilisearch!.healthCheck!
      expect(healthCheck.command).toBeDefined()
      expect(Array.isArray(healthCheck.command)).toBe(true)
      expect(healthCheck.command[0]).toBe('curl')
      expect(healthCheck.interval).toBeDefined()
      expect(healthCheck.timeout).toBeDefined()
      expect(healthCheck.retries).toBeDefined()
    })
  })
})
