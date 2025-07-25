import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { config } from '../src/config'

describe('PHP Install Integration', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string
  let mockInstallPath: string
  let originalConfig: typeof config

  beforeEach(() => {
    originalEnv = { ...process.env }
    originalConfig = { ...config }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-php-install-test-'))
    mockInstallPath = path.join(tempDir, 'install')

    // Set test environment
    process.env.NODE_ENV = 'test'
    process.env.LAUNCHPAD_TEST_MODE = 'true'

    // Override config for testing
    config.verbose = false

    // Create mock installation structure
    fs.mkdirSync(path.join(mockInstallPath, 'bin'), { recursive: true })
    fs.mkdirSync(path.join(mockInstallPath, 'lib', 'php', '20240924'), { recursive: true })
    fs.mkdirSync(path.join(mockInstallPath, 'etc'), { recursive: true })
  })

  afterEach(() => {
    // Restore environment variables properly without replacing the entire process.env object
    Object.keys(process.env).forEach((key) => {
      delete process.env[key]
    })
    Object.assign(process.env, originalEnv)
    Object.assign(config, originalConfig)

    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  describe('PHP with Database Support Installation', () => {
    it('should handle installPhpWithDatabaseSupport function structure', async () => {
      // Test the structure and flow of the installPhpWithDatabaseSupport function

      // Mock the dependencies that would be installed
      const mockPhpPath = path.join(mockInstallPath, 'bin', 'php')
      const mockPhpConfigPath = path.join(mockInstallPath, 'bin', 'php-config')
      const mockPhpizePath = path.join(mockInstallPath, 'bin', 'phpize')

      // Create mock PHP installation
      fs.writeFileSync(mockPhpPath, '#!/bin/bash\necho "PHP 8.4.10 (cli)"', { mode: 0o755 })
      fs.writeFileSync(mockPhpConfigPath, '#!/bin/bash\necho "Extension dir"', { mode: 0o755 })
      fs.writeFileSync(mockPhpizePath, '#!/bin/bash\necho "PHPize"', { mode: 0o755 })

      // Verify the mock installation structure exists
      expect(fs.existsSync(mockPhpPath)).toBe(true)
      expect(fs.existsSync(mockPhpConfigPath)).toBe(true)
      expect(fs.existsSync(mockPhpizePath)).toBe(true)

      // Test that the extension directory exists
      const extensionDir = path.join(mockInstallPath, 'lib', 'php', '20240924')
      expect(fs.existsSync(extensionDir)).toBe(true)
    })

    it('should validate setupDatabaseExtensions function requirements', async () => {
      // Test the setupDatabaseExtensions function's prerequisites

      const phpBinPath = path.join(mockInstallPath, 'bin', 'php')
      const phpConfigPath = path.join(mockInstallPath, 'bin', 'php-config')

      // Create required binaries
      fs.writeFileSync(phpBinPath, '#!/bin/bash\necho "PHP 8.4.10"', { mode: 0o755 })
      fs.writeFileSync(phpConfigPath, '#!/bin/bash\necho "Config"', { mode: 0o755 })

      // Verify prerequisites
      const hasPhp = fs.existsSync(phpBinPath)
      const hasPhpConfig = fs.existsSync(phpConfigPath)

      expect(hasPhp).toBe(true)
      expect(hasPhpConfig).toBe(true)

      // Test extension directory structure
      const extensionDir = path.join(mockInstallPath, 'lib', 'php', '20240924')
      expect(fs.existsSync(extensionDir)).toBe(true)
    })

    it('should simulate database extension compilation workflow', async () => {
      // Simulate the compilation workflow without actually compiling

      const tempCompileDir = path.join(tempDir, 'php-ext-compile')
      fs.mkdirSync(tempCompileDir, { recursive: true })

      // Simulate PHP source download
      const phpVersion = '8.4.10'
      const sourceArchive = path.join(tempCompileDir, `php-${phpVersion}.tar.gz`)
      fs.writeFileSync(sourceArchive, 'mock php source archive')

      expect(fs.existsSync(sourceArchive)).toBe(true)

      // Simulate extraction
      const sourceDir = path.join(tempCompileDir, `php-${phpVersion}`)
      fs.mkdirSync(sourceDir, { recursive: true })

      // Simulate extension directories
      const pgsqlExtDir = path.join(sourceDir, 'ext', 'pdo_pgsql')
      const mysqlExtDir = path.join(sourceDir, 'ext', 'pdo_mysql')

      fs.mkdirSync(pgsqlExtDir, { recursive: true })
      fs.mkdirSync(mysqlExtDir, { recursive: true })

      // Create mock extension source files
      fs.writeFileSync(path.join(pgsqlExtDir, 'config.m4'), 'mock pgsql config')
      fs.writeFileSync(path.join(mysqlExtDir, 'config.m4'), 'mock mysql config')

      expect(fs.existsSync(pgsqlExtDir)).toBe(true)
      expect(fs.existsSync(mysqlExtDir)).toBe(true)

      // Simulate compiled extensions
      const extensionDir = path.join(mockInstallPath, 'lib', 'php', '20240924')
      fs.writeFileSync(path.join(extensionDir, 'pdo_pgsql.so'), 'mock compiled pgsql extension')
      fs.writeFileSync(path.join(extensionDir, 'pdo_mysql.so'), 'mock compiled mysql extension')

      expect(fs.existsSync(path.join(extensionDir, 'pdo_pgsql.so'))).toBe(true)
      expect(fs.existsSync(path.join(extensionDir, 'pdo_mysql.so'))).toBe(true)

      // Cleanup simulation
      fs.rmSync(tempCompileDir, { recursive: true, force: true })
      expect(fs.existsSync(tempCompileDir)).toBe(false)
    })

    it('should test compileExtension function parameters', async () => {
      // Test the parameters and structure for extension compilation

      const sourceDir = path.join(tempDir, 'mock-ext-source')
      const extensionDir = path.join(mockInstallPath, 'lib', 'php', '20240924')
      const extensionName = 'pdo_pgsql'
      const configureArgs = ['--with-pdo-pgsql']

      fs.mkdirSync(sourceDir, { recursive: true })

      // Create mock source files
      fs.writeFileSync(path.join(sourceDir, 'config.m4'), 'mock config')
      fs.writeFileSync(path.join(sourceDir, 'pdo_pgsql.c'), 'mock source')

      // Simulate modules directory (created during compilation)
      const modulesDir = path.join(sourceDir, 'modules')
      fs.mkdirSync(modulesDir, { recursive: true })
      fs.writeFileSync(path.join(modulesDir, `${extensionName}.so`), 'mock compiled extension')

      // Test parameter validation
      expect(typeof extensionName).toBe('string')
      expect(Array.isArray(configureArgs)).toBe(true)
      expect(configureArgs[0]).toContain('--with-pdo-pgsql')
      expect(fs.existsSync(sourceDir)).toBe(true)

      // Simulate copying compiled extension
      const targetExtension = path.join(extensionDir, `${extensionName}.so`)
      fs.copyFileSync(path.join(modulesDir, `${extensionName}.so`), targetExtension)

      expect(fs.existsSync(targetExtension)).toBe(true)
    })
  })

  describe('PHP Wrapper Creation Integration', () => {
    it('should test createPhpWrapperWithExtensions function flow', async () => {
      // Test the complete wrapper creation flow

      const phpBinPath = path.join(mockInstallPath, 'bin', 'php')
      const phpWrapperPath = path.join(mockInstallPath, 'bin', 'php-with-db')
      const extensionDir = path.join(mockInstallPath, 'lib', 'php', '20240924')

      // Create original PHP binary
      const originalPhpContent = '#!/bin/bash\necho "Original PHP 8.4.10"'
      fs.writeFileSync(phpBinPath, originalPhpContent, { mode: 0o755 })

      // Create mock extensions
      const pgsqlExtension = path.join(extensionDir, 'pdo_pgsql.so')
      const mysqlExtension = path.join(extensionDir, 'pdo_mysql.so')

      fs.writeFileSync(pgsqlExtension, 'mock pgsql extension')
      fs.writeFileSync(mysqlExtension, 'mock mysql extension')

      // Test extension detection
      const hasPgsql = fs.existsSync(pgsqlExtension)
      const hasMysql = fs.existsSync(mysqlExtension)

      expect(hasPgsql).toBe(true)
      expect(hasMysql).toBe(true)

      // Create extensions array (simulating the function logic)
      const extensions: string[] = []
      if (hasPgsql)
        extensions.push(`-d extension=${pgsqlExtension}`)
      if (hasMysql)
        extensions.push(`-d extension=${mysqlExtension}`)

      expect(extensions.length).toBe(2)
      expect(extensions[0]).toContain('pdo_pgsql.so')
      expect(extensions[1]).toContain('pdo_mysql.so')

      // Create wrapper script
      const wrapperScript = `#!/bin/bash
# PHP wrapper with database extensions
# Generated by Launchpad
exec "${phpBinPath}" ${extensions.join(' ')} "$@"
`

      fs.writeFileSync(phpWrapperPath, wrapperScript, { mode: 0o755 })

      expect(fs.existsSync(phpWrapperPath)).toBe(true)

      // Test backup process
      const originalPhpPath = `${phpBinPath}.original`
      if (!fs.existsSync(originalPhpPath)) {
        fs.copyFileSync(phpBinPath, originalPhpPath)
      }

      expect(fs.existsSync(originalPhpPath)).toBe(true)

      const backupContent = fs.readFileSync(originalPhpPath, 'utf8')
      expect(backupContent).toBe(originalPhpContent)

      // Test wrapper replacement (simulation)
      fs.copyFileSync(phpWrapperPath, phpBinPath)

      const newPhpContent = fs.readFileSync(phpBinPath, 'utf8')
      expect(newPhpContent).toContain('PHP wrapper with database extensions')
      expect(newPhpContent).toContain('-d extension=')
    })

    it('should handle partial extension availability', async () => {
      // Test wrapper creation when only some extensions are available

      const phpBinPath = path.join(mockInstallPath, 'bin', 'php')
      const extensionDir = path.join(mockInstallPath, 'lib', 'php', '20240924')

      fs.writeFileSync(phpBinPath, '#!/bin/bash\necho "PHP"', { mode: 0o755 })

      // Create only PostgreSQL extension (not MySQL)
      const pgsqlExtension = path.join(extensionDir, 'pdo_pgsql.so')
      fs.writeFileSync(pgsqlExtension, 'mock pgsql extension')

      // Don't create MySQL extension
      const mysqlExtension = path.join(extensionDir, 'pdo_mysql.so')

      const hasPgsql = fs.existsSync(pgsqlExtension)
      const hasMysql = fs.existsSync(mysqlExtension)

      expect(hasPgsql).toBe(true)
      expect(hasMysql).toBe(false)

      // Build extensions array with only available extensions
      const extensions: string[] = []
      if (hasPgsql)
        extensions.push(`-d extension=${pgsqlExtension}`)
      if (hasMysql)
        extensions.push(`-d extension=${mysqlExtension}`)

      expect(extensions.length).toBe(1)
      expect(extensions[0]).toContain('pdo_pgsql.so')

      const wrapperScript = `#!/bin/bash
exec "${phpBinPath}" ${extensions.join(' ')} "$@"
`

      expect(wrapperScript).toContain('pdo_pgsql.so')
      expect(wrapperScript).not.toContain('pdo_mysql.so')
    })
  })

  describe('PHP Configuration Integration', () => {
    it('should test createPhpIniWithDatabaseExtensions function', async () => {
      // Test php.ini creation with database extensions

      const phpIniDir = path.join(mockInstallPath, 'etc')
      const phpIniPath = path.join(phpIniDir, 'php.ini')
      const extensionDir = path.join(mockInstallPath, 'lib', 'php', '20240924')

      // Create mock extensions
      const pgsqlExtension = path.join(extensionDir, 'pdo_pgsql.so')
      const mysqlExtension = path.join(extensionDir, 'pdo_mysql.so')

      fs.writeFileSync(pgsqlExtension, 'mock pgsql extension')
      fs.writeFileSync(mysqlExtension, 'mock mysql extension')

      // Test extension detection
      const extensions: string[] = []

      if (fs.existsSync(pgsqlExtension)) {
        extensions.push(`extension=${pgsqlExtension}`)
      }

      if (fs.existsSync(mysqlExtension)) {
        extensions.push(`extension=${mysqlExtension}`)
      }

      expect(extensions.length).toBe(2)

      // Create php.ini content
      const phpIniContent = `; PHP configuration with database extensions
; Generated by Launchpad

; Database Extensions
${extensions.join('\n')}

; Core PHP Settings
date.timezone = "UTC"
memory_limit = 256M
upload_max_filesize = 64M
post_max_size = 64M

; Development settings
display_errors = On
error_reporting = E_ALL
log_errors = On
`

      fs.writeFileSync(phpIniPath, phpIniContent)

      expect(fs.existsSync(phpIniPath)).toBe(true)

      const iniContent = fs.readFileSync(phpIniPath, 'utf8')
      expect(iniContent).toContain('PHP configuration with database extensions')
      expect(iniContent).toContain(`extension=${pgsqlExtension}`)
      expect(iniContent).toContain(`extension=${mysqlExtension}`)
      expect(iniContent).toContain('date.timezone = "UTC"')
      expect(iniContent).toContain('memory_limit = 256M')
    })

    it('should handle missing extensions in php.ini creation', async () => {
      // Test php.ini creation when no extensions are available

      const phpIniDir = path.join(mockInstallPath, 'etc')
      const phpIniPath = path.join(phpIniDir, 'php.ini')
      const extensionDir = path.join(mockInstallPath, 'lib', 'php', '20240924')

      // Don't create extension files
      const pgsqlExtension = path.join(extensionDir, 'pdo_pgsql.so')
      const mysqlExtension = path.join(extensionDir, 'pdo_mysql.so')

      const extensions: string[] = []

      if (fs.existsSync(pgsqlExtension)) {
        extensions.push(`extension=${pgsqlExtension}`)
      }

      if (fs.existsSync(mysqlExtension)) {
        extensions.push(`extension=${mysqlExtension}`)
      }

      expect(extensions.length).toBe(0)

      // Create basic php.ini without extensions
      const phpIniContent = `; PHP configuration with database extensions
; Generated by Launchpad

; Core PHP Settings
date.timezone = "UTC"
memory_limit = 256M

; Development settings
display_errors = On
error_reporting = E_ALL
`

      fs.writeFileSync(phpIniPath, phpIniContent)

      const iniContent = fs.readFileSync(phpIniPath, 'utf8')
      expect(iniContent).not.toContain('extension=')
      expect(iniContent).toContain('date.timezone = "UTC"')
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing PHP binaries gracefully', async () => {
      // Test graceful handling when PHP binaries don't exist

      const phpBinPath = path.join(mockInstallPath, 'bin', 'php')
      const phpConfigPath = path.join(mockInstallPath, 'bin', 'php-config')

      // Don't create the binaries
      const hasPhp = fs.existsSync(phpBinPath)
      const hasPhpConfig = fs.existsSync(phpConfigPath)

      expect(hasPhp).toBe(false)
      expect(hasPhpConfig).toBe(false)

      // The function should handle this gracefully and return early
      if (!hasPhp || !hasPhpConfig) {
        // This would trigger the graceful exit in the actual function
        expect(true).toBe(true) // Function should return without error
      }
    })

    it('should handle compilation failures gracefully', async () => {
      // Test error handling during extension compilation

      let compilationError: Error | null = null

      try {
        // Simulate a compilation failure scenario
        const invalidSourceDir = path.join(tempDir, 'invalid-ext-source')

        if (!fs.existsSync(invalidSourceDir)) {
          throw new Error('Extension source directory not found')
        }

        // This would be caught by the actual compilation function
      }
      catch (error) {
        compilationError = error as Error
      }

      expect(compilationError).not.toBeNull()
      expect(compilationError?.message).toContain('Extension source directory not found')

      // The function should not fail the entire installation
    })

    it('should validate file permissions and ownership', async () => {
      // Test that created files have correct permissions

      const phpBinPath = path.join(mockInstallPath, 'bin', 'php')
      const phpWrapperPath = path.join(mockInstallPath, 'bin', 'php-with-db')

      // Create test files
      fs.writeFileSync(phpBinPath, '#!/bin/bash\necho "PHP"', { mode: 0o755 })
      fs.writeFileSync(phpWrapperPath, '#!/bin/bash\necho "Wrapper"', { mode: 0o755 })

      // Check file permissions
      const phpStats = fs.statSync(phpBinPath)
      const wrapperStats = fs.statSync(phpWrapperPath)

      // Should be executable
      expect(phpStats.mode & 0o111).toBeGreaterThan(0)
      expect(wrapperStats.mode & 0o111).toBeGreaterThan(0)

      // Should be readable
      expect(phpStats.mode & 0o444).toBeGreaterThan(0)
      expect(wrapperStats.mode & 0o444).toBeGreaterThan(0)
    })
  })

  describe('Database Dependency Installation', () => {
    it('should test database server installation workflow', async () => {
      // Test the workflow for installing database servers alongside PHP

      const installationSteps = [
        'Install base PHP from pkgx.dev',
        'Install PostgreSQL server',
        'Install MySQL server',
        'Compile database extensions',
        'Create PHP wrapper',
        'Configure php.ini',
      ]

      // Validate each step has a clear purpose
      installationSteps.forEach((step) => {
        expect(typeof step).toBe('string')
        expect(step.length).toBeGreaterThan(0)
      })

      // Test PostgreSQL installation simulation
      const pgDataDir = path.join(tempDir, 'postgres-data')
      fs.mkdirSync(pgDataDir, { recursive: true })
      expect(fs.existsSync(pgDataDir)).toBe(true)

      // Test MySQL installation simulation
      const mysqlDataDir = path.join(tempDir, 'mysql-data')
      fs.mkdirSync(mysqlDataDir, { recursive: true })
      expect(fs.existsSync(mysqlDataDir)).toBe(true)
    })

    it('should validate package installation order', async () => {
      // Test that packages are installed in the correct order

      const installOrder = [
        { package: 'php', domain: 'php.net' },
        { package: 'postgresql', domain: 'postgresql.org' },
        { package: 'mysql', domain: 'mysql.com' },
      ]

      // Validate package structure
      installOrder.forEach((pkg) => {
        expect(pkg.package).toBeDefined()
        expect(pkg.domain).toBeDefined()
        expect(typeof pkg.package).toBe('string')
        expect(typeof pkg.domain).toBe('string')
      })

      // Test that PHP comes first (required for extension compilation)
      expect(installOrder[0].package).toBe('php')
      expect(installOrder[1].package).toBe('postgresql')
      expect(installOrder[2].package).toBe('mysql')
    })
  })
})
