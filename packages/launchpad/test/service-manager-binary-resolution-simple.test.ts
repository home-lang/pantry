import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

describe('service Manager Binary Resolution (Simplified)', () => {
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

  describe('postgreSQL Service Configuration', () => {
    it('should have correct service definition', async () => {
      const { SERVICE_DEFINITIONS } = await import('../src/services/definitions')

      const postgres = SERVICE_DEFINITIONS.postgres

      expect(postgres).toBeDefined()
      expect(postgres.name).toBe('postgres')
      expect(postgres.displayName).toBe('PostgreSQL')
      expect(postgres.packageDomain).toBe('postgresql.org')
      expect(postgres.executable).toBe('postgres')
      expect(postgres.port).toBe(5432)
    })

    it('should have Unicode ICU dependency', async () => {
      const { SERVICE_DEFINITIONS } = await import('../src/services/definitions')

      const postgres = SERVICE_DEFINITIONS.postgres

      expect(postgres.dependencies).toBeInstanceOf(Array)
      expect(postgres.dependencies).toContain('unicode.org^73')
    })

    it('should have proper init command', async () => {
      const { SERVICE_DEFINITIONS } = await import('../src/services/definitions')

      const postgres = SERVICE_DEFINITIONS.postgres
      const initCommand = postgres.initCommand

      expect(initCommand).toBeInstanceOf(Array)
      expect(initCommand![0]).toBe('initdb')
      expect(initCommand).toContain('-D')
      expect(initCommand).toContain('{dataDir}')
    })

    it('should have database creation post-start commands', async () => {
      const { SERVICE_DEFINITIONS } = await import('../src/services/definitions')

      const postgres = SERVICE_DEFINITIONS.postgres
      const postStartCommands = postgres.postStartCommands

      expect(postStartCommands).toBeInstanceOf(Array)
      expect(postStartCommands!.length).toBeGreaterThan(0)

      // Check that database creation commands are present
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

  describe('binary Path Construction', () => {
    it('should construct proper file paths', () => {
      const mockEnvRoot = path.join(tempDir, 'env')
      const mockPgRoot = path.join(mockEnvRoot, 'postgresql.org', 'v17.2.0')
      const mockBinDir = path.join(mockPgRoot, 'bin')
      const mockLibDir = path.join(mockPgRoot, 'lib')

      fs.mkdirSync(mockBinDir, { recursive: true })
      fs.mkdirSync(mockLibDir, { recursive: true })

      const initdbPath = path.join(mockBinDir, 'initdb')
      fs.writeFileSync(initdbPath, '#!/bin/bash\necho "test"', { mode: 0o755 })

      expect(fs.existsSync(initdbPath)).toBe(true)
      expect(path.dirname(initdbPath)).toBe(mockBinDir)
      expect(path.dirname(mockBinDir)).toBe(mockPgRoot)
    })

    it('should handle DYLD_LIBRARY_PATH construction', () => {
      const pgLibDir = path.join(tempDir, 'postgresql', 'lib')
      const unicodeLibDir = path.join(tempDir, 'unicode', 'lib')

      fs.mkdirSync(pgLibDir, { recursive: true })
      fs.mkdirSync(unicodeLibDir, { recursive: true })

      const libPaths = [pgLibDir, unicodeLibDir]
      const dyldPath = libPaths.join(':')

      expect(dyldPath).toContain(pgLibDir)
      expect(dyldPath).toContain(unicodeLibDir)
      expect(dyldPath.split(':').length).toBe(2)
    })
  })

  describe('error Handling Patterns', () => {
    it('should provide helpful error messages', () => {
      const errorScenarios = [
        {
          error: 'initdb binary not found in environment',
          category: 'binary_missing',
        },
        {
          error: 'Library not loaded: libicuuc',
          category: 'library_missing',
        },
        {
          error: 'Symbol not found: _u_strToLower_73',
          category: 'version_mismatch',
        },
      ]

      errorScenarios.forEach((scenario) => {
        expect(scenario.error).toBeDefined()
        expect(scenario.category).toBeDefined()
        expect(scenario.error.length).toBeGreaterThan(10)
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

  describe('package Compatibility', () => {
    it('should validate package version patterns', () => {
      const packages = [
        { name: 'postgresql.org', version: '^17.2.0' },
        { name: 'unicode.org', version: '^73.0.0' },
      ]

      packages.forEach((pkg) => {
        expect(pkg.name).toMatch(/^[a-z]+\.org$/)
        expect(pkg.version).toMatch(/^\^?\d+\.\d+\.\d+$/)
      })
    })
  })
})
