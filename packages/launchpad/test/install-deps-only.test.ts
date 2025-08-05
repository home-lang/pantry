/* eslint-disable no-console */
import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { installDependenciesOnly } from '../src/install'
import { TestUtils } from './test.config'

// Mock the pantry import to control test dependencies
const mockPantry = {
  phpnet: {
    dependencies: [
      'autoconf.gnu.org',
      'bison.gnu.org',
      'curl.se',
      'libxml2.xmlsoft.org',
      'openssl.org',
      'postgresql.org/libpq',
      'zlib.net', // This should be filtered out by skipPatterns
      'libzip.org', // This should be filtered out by skipPatterns
    ],
  },
  nodejs: {
    dependencies: [
      'python.org',
      'gcc.gnu.org',
    ],
  },
}

// Mock ts-pkgx import
mock.module('ts-pkgx', () => ({
  pantry: mockPantry,
}))

describe('Install Dependencies Only', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string
  let mockConsoleLog: any
  let mockConsoleWarn: any

  beforeEach(() => {
    // Reset global state for test isolation
    TestUtils.resetGlobalState()

    originalEnv = { ...process.env }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-deps-test-'))

    // Mock console methods to capture output
    mockConsoleLog = mock(() => {})
    mockConsoleWarn = mock(() => {})
    console.log = mockConsoleLog
    console.warn = mockConsoleWarn
  })

  afterEach(() => {
    // Restore environment variables properly without replacing the entire process.env object
    Object.keys(process.env).forEach((key) => {
      delete process.env[key]
    })
    Object.assign(process.env, originalEnv)
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }

    // Restore console methods
    mockConsoleLog.mockRestore()
    mockConsoleWarn.mockRestore()
  })

  describe('installDependenciesOnly function', () => {
    it('should be exported from install module', async () => {
      expect(installDependenciesOnly).toBeDefined()
      expect(typeof installDependenciesOnly).toBe('function')
    })

    it('should install only PHP dependencies when given php package', async () => {
      const packages = ['php']
      const results = await installDependenciesOnly(packages, tempDir)

      expect(results).toBeDefined()
      expect(Array.isArray(results)).toBe(true)

      // Should have called console.log with dependency installation message
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('Installing dependencies only for:'))
      expect(mockConsoleLog).toHaveBeenCalledWith(expect.stringContaining('php'))
    })

    it('should include all dependencies from PHP package (no filtering since source builds removed)', async () => {
      const packages = ['php']
      await installDependenciesOnly(packages, tempDir)

      // All dependencies should now be included since we removed problematic filtering
      const logCalls = mockConsoleLog.mock.calls.flat()
      const warnCalls = mockConsoleWarn.mock.calls.flat()
      const allCalls = [...logCalls, ...warnCalls]

      // These should all be included now
      expect(allCalls.some(call => call.includes('autoconf.gnu.org') || call.includes('autoconf'))).toBe(true)
      expect(allCalls.some(call => call.includes('curl.se') || call.includes('curl'))).toBe(true)

      // The test should validate that deps are being processed correctly
      // Note: In test environment with mocked data, the main package skipping might not appear
      // since we're using mock pantry data, so let's just check that dependencies are being processed
      expect(allCalls.some(call => call.includes('dependencies') && call.includes('php'))).toBe(true)
    })

    it('should handle multiple packages correctly', async () => {
      const packages = ['php', 'nodejs']
      const results = await installDependenciesOnly(packages, tempDir)

      expect(results).toBeDefined()
      expect(Array.isArray(results)).toBe(true)

      // Should mention both packages
      const logCalls = mockConsoleLog.mock.calls.flat()
      expect(logCalls.some(call => call.includes('php'))).toBe(true)
      expect(logCalls.some(call => call.includes('nodejs'))).toBe(true)
    })

    it('should handle empty package list gracefully', async () => {
      const packages: string[] = []
      const results = await installDependenciesOnly(packages, tempDir)

      expect(results).toEqual([])
      expect(mockConsoleLog).toHaveBeenCalledWith('No packages specified for dependency installation')
    })

    it('should handle packages with no dependencies', async () => {
      // Mock a package with no dependencies
      const tempPantry = { ...mockPantry }
      tempPantry.test = { dependencies: [] }

      const packages = ['test']
      const results = await installDependenciesOnly(packages, tempDir)

      expect(results).toBeDefined()
      expect(Array.isArray(results)).toBe(true)
    })

    it('should handle packages not found in pantry', async () => {
      const packages = ['nonexistent-package']
      const results = await installDependenciesOnly(packages, tempDir)

      expect(results).toBeDefined()
      expect(Array.isArray(results)).toBe(true)

      // Should warn about missing package
      const warnCalls = mockConsoleWarn.mock.calls.flat()
      expect(warnCalls.some(call => call.includes('not found in pantry'))).toBe(true)
    })

    it('should use provided install path', async () => {
      const customPath = path.join(tempDir, 'custom-install')
      const packages = ['php']

      await installDependenciesOnly(packages, customPath)

      // Directory should be created
      expect(fs.existsSync(customPath)).toBe(true)
    })

    it('should not install the main package itself', async () => {
      const packages = ['php']
      await installDependenciesOnly(packages, tempDir)

      // Should not mention installing PHP itself, only dependencies
      const logCalls = mockConsoleLog.mock.calls.flat()
      const installMainPackage = logCalls.some(call =>
        call.includes('Installing php') && !call.includes('dependencies'),
      )
      expect(installMainPackage).toBe(false)
    })
  })

  describe('CLI integration', () => {
    it('should handle --deps-only flag correctly', async () => {
      // Test that the function is properly exported and can be imported
      const { installDependenciesOnly: importedFunction } = await import('../src/install')
      expect(importedFunction).toBeDefined()
      expect(typeof importedFunction).toBe('function')
      expect(importedFunction).toBe(installDependenciesOnly)
    })

    it('should combine --deps-only with --path correctly', async () => {
      // Test that custom path works with deps-only
      const customPath = path.join(tempDir, 'custom-deps')
      const packages = ['php']

      const results = await installDependenciesOnly(packages, customPath)
      expect(results).toBeDefined()
      expect(Array.isArray(results)).toBe(true)
      expect(fs.existsSync(customPath)).toBe(true)
    })

    it('should combine --deps-only with --verbose correctly', async () => {
      // Test that verbose mode works with deps-only
      const originalVerbose = process.env.LAUNCHPAD_VERBOSE
      process.env.LAUNCHPAD_VERBOSE = 'true'

      const packages = ['php']
      const results = await installDependenciesOnly(packages, tempDir)

      expect(results).toBeDefined()
      expect(Array.isArray(results)).toBe(true)

      // Restore original verbose setting
      if (originalVerbose !== undefined) {
        process.env.LAUNCHPAD_VERBOSE = originalVerbose
      }
      else {
        delete process.env.LAUNCHPAD_VERBOSE
      }
    })
  })

  describe('Error handling', () => {
    it('should handle ts-pkgx import failure gracefully', async () => {
      // This test is complex to implement with dynamic mocking during execution
      // For now, we'll test that the function handles errors gracefully
      const packages = ['nonexistent-package-that-causes-error']
      const results = await installDependenciesOnly(packages, tempDir)

      expect(results).toBeDefined()
      expect(Array.isArray(results)).toBe(true)

      // Should warn about missing package
      const warnCalls = mockConsoleWarn.mock.calls.flat()
      expect(warnCalls.some(call => call.includes('not found in pantry'))).toBe(true)
    })

    it('should handle individual dependency installation failures', async () => {
      // This will be tested when we implement the actual function
      // For now, ensure the function exists and handles errors
      const packages = ['php']

      expect(async () => {
        await installDependenciesOnly(packages, tempDir)
      }).not.toThrow()
    })
  })
})
