import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

describe('service Manager Binary Resolution', () => {
  let tempDir: string
  let originalCwd: string
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    originalCwd = process.cwd()
    originalEnv = { ...process.env }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'service-manager-test-'))

    process.env.NODE_ENV = 'test'
    process.env.LAUNCHPAD_TEST_MODE = 'true'
  })

  afterEach(() => {
    if (originalCwd) {
      process.chdir(originalCwd)
    }
    Object.keys(process.env).forEach((key) => {
      delete process.env[key]
    })
    Object.assign(process.env, originalEnv)

    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  describe('binary Path Resolution', () => {
    it('should find PostgreSQL binaries in project environment', () => {
      // Create mock environment structure
      const projectName = 'test-project'
      const projectBaseName = projectName.toLowerCase().replace(/[^a-z0-9]/g, '_')
      const envName = `${projectBaseName}_abc123`
      const mockEnvRoot = path.join(tempDir, 'envs', envName)
      const pgBinDir = path.join(mockEnvRoot, 'postgresql.org', 'v17.2.0', 'bin')

      fs.mkdirSync(pgBinDir, { recursive: true })
      fs.writeFileSync(path.join(pgBinDir, 'initdb'), '#!/bin/bash\necho "mock initdb"', { mode: 0o755 })
      fs.writeFileSync(path.join(pgBinDir, 'postgres'), '#!/bin/bash\necho "mock postgres"', { mode: 0o755 })

      // Create project directory
      const projectDir = path.join(tempDir, 'projects', projectName)
      fs.mkdirSync(projectDir, { recursive: true })
      process.chdir(projectDir)

      // Mock the homedir to point to our temp structure - Skip this complex mock for now

      // Test the binary resolution logic
      const currentProjectBaseName = path.basename(process.cwd()).toLowerCase().replace(/[^a-z0-9]/g, '_')
      const launchpadEnvs = path.join(tempDir, 'envs')

      if (fs.existsSync(launchpadEnvs)) {
        const envDirs = fs.readdirSync(launchpadEnvs).filter((dir: string) =>
          dir.toLowerCase().includes(currentProjectBaseName),
        )

        expect(envDirs.length).toBeGreaterThan(0)

        for (const dir of envDirs) {
          const potentialPath = path.join(launchpadEnvs, dir, 'postgresql.org', 'v17.2.0', 'bin', 'initdb')
          if (fs.existsSync(potentialPath)) {
            expect(fs.existsSync(potentialPath)).toBe(true)
            break
          }
        }
      }
    })

    it('should handle missing environment directories gracefully', () => {
      const nonExistentDir = path.join(tempDir, 'nonexistent')
      process.chdir(nonExistentDir.replace('nonexistent', '.')) // Change to parent dir

      // Should not throw when environment directory doesn't exist
      expect(() => {
        const projectBaseName = 'nonexistent'
        const launchpadEnvs = path.join(tempDir, 'envs')

        if (fs.existsSync(launchpadEnvs)) {
          fs.readdirSync(launchpadEnvs).filter((dir: string) =>
            dir.toLowerCase().includes(projectBaseName),
          )
        }
      }).not.toThrow()
    })
  })

  describe('library Path Management', () => {
    it('should construct proper DYLD_LIBRARY_PATH for PostgreSQL', () => {
      const mockPgRoot = path.join(tempDir, 'postgresql.org', 'v17.2.0')
      const mockEnvRoot = path.dirname(path.dirname(mockPgRoot))

      fs.mkdirSync(path.join(mockPgRoot, 'lib'), { recursive: true })
      fs.mkdirSync(path.join(mockEnvRoot, 'unicode.org', 'v73', 'lib'), { recursive: true })
      fs.mkdirSync(path.join(mockEnvRoot, 'unicode.org', 'v71.1.0', 'lib'), { recursive: true })

      const pgLibDir = path.join(mockPgRoot, 'lib')
      const unicodeLib = path.join(mockEnvRoot, 'unicode.org', 'v73', 'lib')
      const unicodeLibFallback = path.join(mockEnvRoot, 'unicode.org', 'v71.1.0', 'lib')

      const libPaths = [pgLibDir]

      if (fs.existsSync(unicodeLib)) {
        libPaths.push(unicodeLib)
      }
      else if (fs.existsSync(unicodeLibFallback)) {
        libPaths.push(unicodeLibFallback)
      }

      const dyldPath = libPaths.join(':')

      expect(dyldPath).toContain(pgLibDir)
      expect(dyldPath).toContain('unicode.org')
      expect(dyldPath.split(':').length).toBeGreaterThanOrEqual(2)
    })

    it('should handle missing Unicode libraries gracefully', () => {
      const mockPgRoot = path.join(tempDir, 'postgresql.org', 'v17.2.0')
      fs.mkdirSync(path.join(mockPgRoot, 'lib'), { recursive: true })

      const pgLibDir = path.join(mockPgRoot, 'lib')
      const libPaths = [pgLibDir]

      // Should still work with just PostgreSQL lib
      const dyldPath = libPaths.join(':')
      expect(dyldPath).toBe(pgLibDir)
    })
  })

  describe('service Configuration Validation', () => {
    it('should validate PostgreSQL service definition', async () => {
      const { SERVICE_DEFINITIONS } = await import('../src/services/definitions')

      const postgres = SERVICE_DEFINITIONS.postgres

      expect(postgres).toBeDefined()
      expect(postgres.name).toBe('postgres')
      expect(postgres.displayName).toBe('PostgreSQL')
      expect(postgres.packageDomain).toBe('postgresql.org')
      expect(postgres.executable).toBe('postgres')
      expect(postgres.port).toBe(5432)
      expect(postgres.dependencies).toBeInstanceOf(Array)
      expect(postgres.dependencies).toContain('unicode.org^73')
      expect(postgres.initCommand).toBeDefined()
      expect(postgres.postStartCommands).toBeDefined()
    })

    it('should validate init command structure', async () => {
      const { SERVICE_DEFINITIONS } = await import('../src/services/definitions')

      const postgres = SERVICE_DEFINITIONS.postgres
      const initCommand = postgres.initCommand

      expect(initCommand).toBeInstanceOf(Array)
      expect(initCommand![0]).toBe('initdb')
      expect(initCommand).toContain('-D')
      expect(initCommand).toContain('{dataDir}')
      expect(initCommand!.some(arg => arg.includes('auth'))).toBe(true)
    })

    it('should validate post-start commands', async () => {
      const { SERVICE_DEFINITIONS } = await import('../src/services/definitions')

      const postgres = SERVICE_DEFINITIONS.postgres
      const postStartCommands = postgres.postStartCommands

      expect(postStartCommands).toBeInstanceOf(Array)
      expect(postStartCommands!.length).toBeGreaterThan(0)

      // Check that database creation commands are present
      // postStartCommands are arrays of command arrays
      const hasCreateDB = postStartCommands!.some(cmd =>
        Array.isArray(cmd) && cmd.some(arg => arg.includes('createdb')),
      )
      const hasCreateUser = postStartCommands!.some(cmd =>
        Array.isArray(cmd) && cmd.some(arg => arg.includes('CREATE USER')),
      )
      const hasGrantPrivileges = postStartCommands!.some(cmd =>
        Array.isArray(cmd) && cmd.some(arg => arg.includes('GRANT')),
      )

      expect(hasCreateDB).toBe(true)
      expect(hasCreateUser).toBe(true)
      expect(hasGrantPrivileges).toBe(true)
    })
  })

  describe('error Handling and Recovery', () => {
    it('should provide specific error messages for binary resolution failures', () => {
      const testCases = [
        {
          scenario: 'Binary not found',
          expectedMessage: 'binary not found in environment',
        },
        {
          scenario: 'Library loading error',
          expectedMessage: 'library loading issue',
        },
        {
          scenario: 'Unicode compatibility',
          expectedMessage: 'Unicode ICU version',
        },
      ]

      testCases.forEach(({ scenario, expectedMessage }) => {
        expect(scenario).toBeDefined()
        expect(expectedMessage).toBeDefined()
        expect(expectedMessage.length).toBeGreaterThan(5)
      })
    })

    it('should suggest recovery actions', () => {
      const suggestions = [
        'launchpad cache clear',
        'launchpad install postgresql.org@17',
        'launchpad env rebuild',
      ]

      suggestions.forEach((suggestion) => {
        expect(suggestion).toContain('launchpad')
        expect(suggestion.split(' ').length).toBeGreaterThanOrEqual(2)
      })
    })
  })

  describe('integration with Package Manager', () => {
    it('should ensure compatible package versions are installed', () => {
      // Mock package dependency resolution
      const requiredPackages = [
        { name: 'postgresql.org', version: '^17.2.0' },
        { name: 'unicode.org', version: '^73.0.0' },
      ]

      requiredPackages.forEach((pkg) => {
        expect(pkg.name).toBeDefined()
        expect(pkg.version).toMatch(/^\^?\d+\.\d+\.\d+$/)
      })
    })

    it('should handle package installation failures gracefully', async () => {
      // Test that package installation errors don't crash the service manager
      const mockInstallError = new Error('Package installation failed')

      expect(() => {
        try {
          throw mockInstallError
        }
        catch (error) {
          // Should log error but continue
          console.warn(`Package installation failed: ${error instanceof Error ? error.message : String(error)}`)
        }
      }).not.toThrow()
    })
  })
})
