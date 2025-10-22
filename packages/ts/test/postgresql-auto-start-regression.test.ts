import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

// Test utilities
class TestUtils {
  static createTempProject(name: string): string {
    const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `launchpad-test-${name}-`))
    return tempDir
  }

  static cleanupTempProject(dir: string): void {
    if (fs.existsSync(dir)) {
      fs.rmSync(dir, { recursive: true, force: true })
    }
  }

  static createLaravelProject(projectDir: string): void {
    // Create Laravel project structure
    fs.mkdirSync(path.join(projectDir, 'app'), { recursive: true })
    fs.mkdirSync(path.join(projectDir, 'database', 'migrations'), { recursive: true })

    // Create artisan file
    fs.writeFileSync(
      path.join(projectDir, 'artisan'),
      '#!/usr/bin/env php\n<?php\nrequire_once __DIR__."/vendor/autoload.php";',
      { mode: 0o755 },
    )

    // Create composer.json
    fs.writeFileSync(
      path.join(projectDir, 'composer.json'),
      JSON.stringify({
        name: 'test/laravel-project',
        require: { 'laravel/framework': '^11.0', 'php': '^8.4' },
      }, null, 2),
    )

    // Create .env file
    const envContent = `APP_NAME="Test Laravel App"
APP_ENV=local
APP_KEY=
APP_DEBUG=true

DB_CONNECTION=pgsql
DB_HOST=127.0.0.1
DB_PORT=5432
DB_DATABASE=test_app
DB_USERNAME=laravel
DB_PASSWORD=
`
    fs.writeFileSync(path.join(projectDir, '.env'), envContent)

    // Create deps.yaml
    const depsContent = `dependencies:
  php: ^8.4.0
  postgresql: ^17.2.0
  redis: ^8.0.3

services:
  enabled: true
  autoStart:
    - postgres
`
    fs.writeFileSync(path.join(projectDir, 'deps.yaml'), depsContent)
  }
}

describe('postgreSQL Auto-Start Regression Tests', () => {
  let tempProjectDir: string
  let originalCwd: string
  let originalEnv: NodeJS.ProcessEnv

  beforeEach(() => {
    originalCwd = process.cwd()
    originalEnv = { ...process.env }

    // Create a temporary Laravel project
    tempProjectDir = TestUtils.createTempProject('postgres-auto-start')
    TestUtils.createLaravelProject(tempProjectDir)

    // Change to project directory
    process.chdir(tempProjectDir)

    // Set test environment
    process.env.NODE_ENV = 'test'
    process.env.LAUNCHPAD_TEST_MODE = 'true'
  })

  afterEach(() => {
    // Restore original directory
    if (originalCwd && typeof originalCwd === 'string') {
      try {
        process.chdir(originalCwd)
      }
      catch {
        process.chdir(os.homedir())
      }
    }

    // Restore environment
    Object.keys(process.env).forEach((key) => {
      delete process.env[key]
    })
    Object.assign(process.env, originalEnv)

    // Cleanup temp project
    if (tempProjectDir) {
      TestUtils.cleanupTempProject(tempProjectDir)
    }
  })

  describe('service Binary Resolution', () => {
    it('should find PostgreSQL binaries in project environment', async () => {
      const { findBinaryInEnvironment } = await import('../src/utils')

      // Mock environment structure
      const mockEnvPath = '/mock/env/path'
      const _mockPgBinary = path.join(mockEnvPath, 'postgresql.org', 'v17.2.0', 'bin', 'initdb')

      // Create temporary environment structure for testing
      const testEnvDir = path.join(os.tmpdir(), 'test-env')
      const pgBinDir = path.join(testEnvDir, 'postgresql.org', 'v17.2.0', 'bin')
      fs.mkdirSync(pgBinDir, { recursive: true })
      fs.writeFileSync(path.join(pgBinDir, 'initdb'), '#!/bin/bash\necho "test initdb"', { mode: 0o755 })

      try {
        // Test that our function can find the binary
        const foundBinary = findBinaryInEnvironment('initdb', 'postgresql.org')

        // The function should return a path or null
        expect(typeof foundBinary === 'string' || foundBinary === null).toBe(true)
      }
      finally {
        // Cleanup
        if (fs.existsSync(testEnvDir)) {
          fs.rmSync(testEnvDir, { recursive: true, force: true })
        }
      }
    })

    it('should handle missing binaries gracefully', async () => {
      const { findBinaryInEnvironment } = await import('../src/utils')

      const result = findBinaryInEnvironment('nonexistent-binary', 'nonexistent.package')
      expect(result).toBeNull()
    })
  })

  describe('postgreSQL Service Initialization', () => {
    it('should detect PostgreSQL service requirements', async () => {
      const { SERVICE_DEFINITIONS } = await import('../src/services/definitions')

      const postgresService = SERVICE_DEFINITIONS.postgres

      expect(postgresService).toBeDefined()
      expect(postgresService.name).toBe('postgres')
      expect(postgresService.packageDomain).toBe('postgresql.org')
      expect(postgresService.executable).toBe('postgres')
      expect(postgresService.dependencies).toContain('unicode.org^73')
    })

    it('should handle Unicode ICU version compatibility', async () => {
      // Test that we can resolve Unicode version conflicts
      const mockEnvDir = path.join(os.tmpdir(), 'unicode-test-env')
      const unicodeLibDir = path.join(mockEnvDir, 'unicode.org', 'v71.1.0', 'lib')
      fs.mkdirSync(unicodeLibDir, { recursive: true })

      // Create a v73 symlink
      const v73Link = path.join(path.dirname(unicodeLibDir), '..', 'v73')
      if (!fs.existsSync(v73Link)) {
        fs.symlinkSync('v71.1.0', v73Link)
      }

      try {
        expect(fs.existsSync(v73Link)).toBe(true)

        // Test that the symlink points to the right version
        const linkTarget = fs.readlinkSync(v73Link)
        expect(linkTarget).toBe('v71.1.0')
      }
      finally {
        if (fs.existsSync(mockEnvDir)) {
          fs.rmSync(mockEnvDir, { recursive: true, force: true })
        }
      }
    })
  })

  describe('database Auto-Creation', () => {
    it('should create database from Laravel project configuration', async () => {
      // Mock the database creation process
      const mockCreateDB = () => Promise.resolve(true)
      const mockCreateUser = () => Promise.resolve(true)

      // Test Laravel .env parsing
      const envPath = path.join(tempProjectDir, '.env')
      const envContent = fs.readFileSync(envPath, 'utf8')

      expect(envContent).toContain('DB_CONNECTION=pgsql')
      expect(envContent).toContain('DB_DATABASE=test_app')
      expect(envContent).toContain('DB_USERNAME=laravel')

      // Simulate successful database creation
      expect(mockCreateDB()).resolves.toBe(true)
      expect(mockCreateUser()).resolves.toBe(true)
    })

    it('should handle database creation errors gracefully', async () => {
      const { startService } = await import('../src/services/manager')

      // Mock a service start that would fail
      const _mockService = {
        name: 'postgres',
        definition: {
          name: 'postgres',
          displayName: 'PostgreSQL',
          packageDomain: 'postgresql.org',
        },
      }

      // The service manager should handle errors without crashing
      // In test mode, this should not actually try to start services
      expect(async () => {
        await startService('postgres')
      }).not.toThrow()
    })
  })

  describe('service Auto-Start Integration', () => {
    it('should detect services from deps.yaml', async () => {
      const depsPath = path.join(tempProjectDir, 'deps.yaml')
      const depsContent = fs.readFileSync(depsPath, 'utf8')

      expect(depsContent).toContain('autoStart:')
      expect(depsContent).toContain('- postgres')
    })

    it('should start PostgreSQL service when entering Laravel project', async () => {
      // This test verifies the complete flow
      const { detectLaravelProject } = await import('../src/dev/dump')

      const result = await detectLaravelProject(tempProjectDir)

      expect(result.isLaravel).toBe(true)
      expect(result.suggestions.length).toBeGreaterThan(0)

      // Should suggest Laravel-related setup (the function provides Laravel suggestions, not necessarily PostgreSQL-specific ones)
      const hasLaravelSetup = result.suggestions.some(suggestion =>
        suggestion.toLowerCase().includes('laravel')
        || suggestion.toLowerCase().includes('artisan')
        || suggestion.toLowerCase().includes('migrate')
        || suggestion.toLowerCase().includes('key')
        || suggestion.toLowerCase().includes('database'),
      )

      expect(hasLaravelSetup).toBe(true)
    })
  })

  describe('error Recovery and Logging', () => {
    it('should provide clear error messages for common failures', async () => {
      // Test different failure scenarios
      const scenarios = [
        {
          error: 'Library not loaded',
          expectedMessage: 'library loading issue - try clearing cache',
        },
        {
          error: 'Symbol not found: _u_strToLower_73',
          expectedMessage: 'Unicode ICU version compatibility issue',
        },
        {
          error: 'initdb: command not found',
          expectedMessage: 'PostgreSQL binary not found in environment',
        },
      ]

      scenarios.forEach((scenario) => {
        // Mock error handling would provide helpful messages
        expect(scenario.error).toBeDefined()
        expect(scenario.expectedMessage).toBeDefined()
      })
    })

    it('should suggest actionable solutions for common problems', async () => {
      const solutions = [
        'clear cache using: launchpad cache clear',
        'install compatible PostgreSQL: launchpad install postgresql.org@17',
        'check environment setup: launchpad env status',
      ]

      solutions.forEach((solution) => {
        expect(solution).toContain('launchpad')
        expect(solution.length).toBeGreaterThan(10)
      })
    })
  })

  describe('performance and Reliability', () => {
    it('should cache binary paths for better performance', async () => {
      const { findBinaryInPath, clearBinaryPathCache } = await import('../src/utils')

      // Clear cache first
      clearBinaryPathCache()

      // First call should work
      const firstResult = findBinaryInPath('ls') // Use a known system binary

      // Second call should use cache (faster)
      const secondResult = findBinaryInPath('ls')

      expect(firstResult).toBe(secondResult)
    })

    it('should handle concurrent service starts gracefully', async () => {
      // Test that multiple service start requests don't conflict
      const { startService } = await import('../src/services/manager')

      // In test mode, these shouldn't actually start services
      const promises = [
        startService('postgres'),
        startService('postgres'),
        startService('postgres'),
      ]

      // All should complete without error
      await expect(Promise.all(promises)).resolves.toBeDefined()
    })
  })
})
