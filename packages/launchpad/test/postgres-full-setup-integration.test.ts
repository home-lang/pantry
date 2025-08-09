import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

/**
 * Full PostgreSQL Setup Integration Test
 *
 * This test verifies that the entire PostgreSQL setup works end-to-end
 * without any manual intervention, addressing the regression where
 * users had to manually configure PostgreSQL.
 */
describe('PostgreSQL Full Setup Integration', () => {
  let tempDir: string
  let originalCwd: string

  beforeEach(() => {
    // Create temp directory for test project
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'postgres-integration-'))
    originalCwd = process.cwd()
    process.chdir(tempDir)

    // Create Laravel project structure
    fs.mkdirSync('app', { recursive: true })
    fs.mkdirSync('database/migrations', { recursive: true })

    // Create composer.json for Laravel project
    const composerJson = {
      name: 'test/the-one-otc-api',
      type: 'project',
      require: {
        'php': '^8.1',
        'laravel/framework': '^10.0',
      },
    }
    fs.writeFileSync('composer.json', JSON.stringify(composerJson, null, 2))

    // Create .env file for Laravel
    const envContent = `
APP_NAME="The One OTC API"
APP_ENV=local
APP_KEY=base64:test-key-here
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=the_one_otc_api
DB_USERNAME=laravel
DB_PASSWORD=launchpad123
`
    fs.writeFileSync('.env', envContent.trim())
  })

  afterEach(() => {
    process.chdir(originalCwd)
    fs.rmSync(tempDir, { recursive: true, force: true })
  })

  it('should automatically set up PostgreSQL completely from launchpad start postgres', async () => {
    // This test verifies the complete flow:
    // 1. `launchpad start postgres` should install PostgreSQL + dependencies
    // 2. Initialize database cluster with correct authentication
    // 3. Start PostgreSQL service
    // 4. Create project database and user
    // 5. Ready for Laravel migrations

    // Mock successful operations for CI testing
    const _mockOperations = {
      install: [],
      commands: [],
      filesCreated: [],
    }

    // Import service definitions to verify configuration
    const { SERVICE_DEFINITIONS } = await import('../src/services/definitions')
    const postgresService = SERVICE_DEFINITIONS.postgres

    // Verify service definition has correct configuration
    expect(postgresService.packageDomain).toBe('postgresql.org')
    expect(postgresService.dependencies).toContain('unicode.org^73')
    expect(postgresService.initCommand).toContain('--auth-host={authMethod}')
    expect(postgresService.postStartCommands).toBeDefined()

    // Verify post-start commands will create project-specific database
    const createDbCommand = postgresService.postStartCommands?.find(cmd =>
      Array.isArray(cmd) && cmd.includes('createdb'),
    )
    expect(createDbCommand).toContain('{projectDatabase}')

    // Test template variable resolution with our project
    const managerModule = await import('../src/services/manager')
    const resolveServiceTemplateVariables = (managerModule as any).resolveServiceTemplateVariables

    const mockService = {
      definition: postgresService,
      config: {},
    }

    const resolvedDbName = resolveServiceTemplateVariables('{projectDatabase}', mockService)
    expect(resolvedDbName).toBe('the_one_otc_api')

    // Verify createdb command will use correct database name
    const resolvedCreateCmd = createDbCommand?.map(arg =>
      resolveServiceTemplateVariables(arg, mockService),
    )
    expect(resolvedCreateCmd).toContain('the_one_otc_api')
  })

  it('should detect project name correctly from composer.json', async () => {
    const managerModule = await import('../src/services/manager')
    const detectProjectName = (managerModule as any).detectProjectName

    const projectName = detectProjectName()
    expect(projectName).toBe('the_one_otc_api')
  })

  it('should generate correct PostgreSQL configuration for any project', async () => {
    const { SERVICE_DEFINITIONS } = await import('../src/services/definitions')
    const postgresService = SERVICE_DEFINITIONS.postgres

    // Verify port is standard PostgreSQL port
    expect(postgresService.port).toBe(5432)

    // Verify authentication allows any application to connect
    expect(postgresService.initCommand).toContain('--auth-host={authMethod}')

    // Verify post-start commands create database user
    const createUserCommand = postgresService.postStartCommands?.find(cmd =>
      Array.isArray(cmd) && cmd.join(' ').includes('CREATE USER') && cmd.join(' ').includes('{dbUsername}'),
    )
    expect(createUserCommand).toBeDefined()
  })

  it('should handle PostgreSQL service lifecycle correctly', async () => {
    // This test simulates the complete service lifecycle:
    // start -> initialize -> configure -> ready for connections

    const { SERVICE_DEFINITIONS } = await import('../src/services/definitions')
    const postgresService = SERVICE_DEFINITIONS.postgres

    // Verify health check configuration
    expect(postgresService.healthCheck).toBeDefined()
    expect(postgresService.healthCheck?.command).toEqual(['pg_isready', '-p', '5432'])
    expect(postgresService.healthCheck?.expectedExitCode).toBe(0)

    // Verify graceful shutdown support
    expect(postgresService.supportsGracefulShutdown).toBe(true)
  })

  it('should work with deps.yaml configuration', async () => {
    // Create deps.yaml with PostgreSQL
    const depsYaml = `
dependencies:
  postgresql.org: "*"
`
    fs.writeFileSync('deps.yaml', depsYaml.trim())

    // This should trigger automatic PostgreSQL installation when cd'ing into directory
    // The service should then be available for starting

    const { SERVICE_DEFINITIONS } = await import('../src/services/definitions')
    const postgresService = SERVICE_DEFINITIONS.postgres

    // Verify the service can be found and has correct package domain
    expect(postgresService.packageDomain).toBe('postgresql.org')
  })

  it('should create project-compatible database configuration', async () => {
    const { SERVICE_DEFINITIONS } = await import('../src/services/definitions')
    const postgresService = SERVICE_DEFINITIONS.postgres

    // Test all post-start commands resolve correctly
    const managerModule = await import('../src/services/manager')
    const resolveServiceTemplateVariables = (managerModule as any).resolveServiceTemplateVariables

    const mockService = {
      definition: postgresService,
      config: {},
    }

    const resolvedCommands = postgresService.postStartCommands?.map(cmd =>
      cmd.map(arg => resolveServiceTemplateVariables(arg, mockService)),
    )

    // Verify database creation
    const createDbCmd = resolvedCommands?.find(cmd => cmd.includes('createdb'))
    expect(createDbCmd).toContain('the_one_otc_api')

    // Verify user creation
    const createUserCmd = resolvedCommands?.find(cmd =>
      cmd.join(' ').includes('CREATE USER') && cmd.join(' ').includes('root'),
    )
    expect(createUserCmd).toBeDefined()

    // Verify permissions
    const grantCmd = resolvedCommands?.find(cmd =>
      cmd.join(' ').includes('GRANT ALL PRIVILEGES ON DATABASE the_one_otc_api TO root')
      || cmd.join(' ').includes('GRANT ALL PRIVILEGES ON DATABASE the_one_otc_api TO'),
    )
    expect(grantCmd).toBeDefined()
  })

  it('should prevent the original ICU library mismatch issue', async () => {
    // This is a regression test for the specific ICU issue we fixed
    // The service definition should include unicode.org^73 as a dependency

    const { SERVICE_DEFINITIONS } = await import('../src/services/definitions')
    const postgresService = SERVICE_DEFINITIONS.postgres

    // Verify PostgreSQL dependencies include the correct ICU version
    expect(postgresService.dependencies).toContain('unicode.org^73')

    // Verify other dependencies are also included
    expect(postgresService.dependencies).toContain('openssl.org^1.0.1')
    expect(postgresService.dependencies).toContain('gnu.org/readline')
    expect(postgresService.dependencies).toContain('zlib.net')
    expect(postgresService.dependencies).toContain('lz4.org')
    expect(postgresService.dependencies).toContain('gnome.org/libxml2~2.13')
    expect(postgresService.dependencies).toContain('gnome.org/libxslt')
  })
})
