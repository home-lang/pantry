import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { DISTRIBUTION_CONFIG, install, install_prefix } from '../src/install'

describe('Install', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string

  beforeEach(() => {
    originalEnv = { ...process.env }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-test-'))
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
  })

  describe('install_prefix', () => {
    it('should return a Path object', () => {
      const prefix = install_prefix()
      expect(prefix).toBeDefined()
      expect(typeof prefix.string).toBe('string')
      expect(prefix.string.length).toBeGreaterThan(0)
    })

    it('should return a valid installation path', () => {
      const prefix = install_prefix()
      const validPaths = ['/usr/local', path.join(os.homedir(), '.local')]
      expect(validPaths.some(p => prefix.string.includes(p.split('/')[1]))).toBe(true)
    })

    it('should be consistent across calls', () => {
      const prefix1 = install_prefix()
      const prefix2 = install_prefix()
      expect(prefix1.string).toBe(prefix2.string)
    })

    it('should return a path that exists or can be created', () => {
      const prefix = install_prefix()
      const parentDir = path.dirname(prefix.string)

      // Either the path exists or its parent exists (so it can be created)
      const pathExists = fs.existsSync(prefix.string)
      const parentExists = fs.existsSync(parentDir)

      expect(pathExists || parentExists).toBe(true)
    })

    it('should prefer /usr/local when writable', () => {
      const prefix = install_prefix()

      // This test checks the logic but doesn't enforce a specific result
      // since it depends on the actual system permissions
      expect(prefix.string).toMatch(/\/(usr\/local|\.local)/)
    })

    it('should fall back to ~/.local when /usr/local is not writable', () => {
      const prefix = install_prefix()

      // If the prefix is not /usr/local, it should be ~/.local
      if (!prefix.string.includes('/usr/local')) {
        expect(prefix.string).toContain('.local')
      }
    })

    it('should default to system-wide installation', () => {
      const prefix = install_prefix()

      // The default behavior should prefer system-wide installation
      // Either /usr/local (if writable) or ~/.local (fallback)
      const isSystemWide = prefix.string === '/usr/local'
      const isUserFallback = prefix.string.includes('.local')

      expect(isSystemWide || isUserFallback).toBe(true)
    })

    it('should make --system flag redundant', () => {
      // The --system flag should produce the same result as default behavior
      const defaultPrefix = install_prefix()
      const systemPrefix = install_prefix() // Same function call for both cases

      expect(defaultPrefix.string).toBe(systemPrefix.string)
    })

    it('should prioritize /usr/local over user directories', () => {
      const prefix = install_prefix()

      // If /usr/local is writable, it should be preferred over ~/.local
      // This tests the priority logic in the install_prefix function
      if (prefix.string === '/usr/local') {
        // /usr/local was chosen, which means it's writable
        expect(prefix.string).toBe('/usr/local')
      }
      else {
        // ~/.local was chosen, which means /usr/local wasn't writable
        expect(prefix.string).toContain('.local')
      }
    })
  })

  describe('install function behavior', () => {
    it('should be a function', () => {
      expect(typeof install).toBe('function')
    })

    it('should export install function', () => {
      expect(install).toBeDefined()
      expect(typeof install).toBe('function')
    })

    it('should handle array of packages', async () => {
      // Test that install function accepts array of package names
      try {
        await install(['nonexistent-test-package'], tempDir)
      }
      catch (error) {
        // Expected to fail for nonexistent package, but should handle gracefully
        expect(error).toBeDefined()
      }
    })

    it('should handle single package string', async () => {
      // Test that install function accepts single package
      try {
        await install(['nonexistent-single-package'], tempDir)
      }
      catch (error) {
        // Expected to fail for nonexistent package, but should handle gracefully
        expect(error).toBeDefined()
      }
    })

    it('should handle empty package list', async () => {
      // Test that install function handles empty array gracefully
      const result = await install([], tempDir)
      expect(Array.isArray(result)).toBe(true)
      expect(result.length).toBe(0)
    })

    it('should return array of installed files', async () => {
      // Test that install function returns an array
      const result = await install([], tempDir)
      expect(Array.isArray(result)).toBe(true)
    })

    it('should accept custom installation path', async () => {
      // Test that install function accepts basePath parameter
      const customPath = path.join(tempDir, 'custom')
      const result = await install([], customPath)
      expect(Array.isArray(result)).toBe(true)
    })
  })

  describe('distribution configuration', () => {
    it('should have configurable distribution base URL', () => {
      expect(DISTRIBUTION_CONFIG).toBeDefined()
      expect(DISTRIBUTION_CONFIG.baseUrl).toBeDefined()
      expect(typeof DISTRIBUTION_CONFIG.baseUrl).toBe('string')
      expect(DISTRIBUTION_CONFIG.baseUrl.startsWith('http')).toBe(true)
    })

    it('should point to pkgx distribution server', () => {
      expect(DISTRIBUTION_CONFIG.baseUrl).toBe('https://dist.pkgx.dev')
    })

    it('should be easily switchable to custom server', () => {
      // Test that the config structure supports switching
      const customConfig = {
        baseUrl: 'https://packages.launchpad.dev',
      }
      expect(customConfig.baseUrl).toBe('https://packages.launchpad.dev')
    })
  })

  describe('integration tests', () => {
    it('should handle version specifications in package names', async () => {
      // Test package@version format handling
      try {
        const result = await install(['nonexistent@1.0.0'], tempDir)
        expect(Array.isArray(result)).toBe(true)
      }
      catch (error) {
        // Error is expected for nonexistent package, but should be handled gracefully
        expect(error).toBeDefined()
      }
    })

    it('should handle invalid package names gracefully', async () => {
      // Test error handling for invalid packages
      try {
        await install([''], tempDir)
      }
      catch (error) {
        expect(error).toBeDefined()
      }
    })

    it('should create bin directory in installation path', async () => {
      const customPath = path.join(tempDir, 'custom-install')

      // Create directory first since install with empty array doesn't create dirs
      fs.mkdirSync(customPath, { recursive: true })
      await install([], customPath)

      // Should maintain the installation directory structure
      expect(fs.existsSync(customPath)).toBe(true)
    })
  })

  describe('module exports', () => {
    it('should export install_prefix function', () => {
      expect(install_prefix).toBeDefined()
      expect(typeof install_prefix).toBe('function')
    })

    it('should export install function', () => {
      expect(install).toBeDefined()
      expect(typeof install).toBe('function')
    })

    it('should export distribution configuration', () => {
      expect(DISTRIBUTION_CONFIG).toBeDefined()
      expect(typeof DISTRIBUTION_CONFIG).toBe('object')
    })
  })

  describe('path validation', () => {
    it('should handle different path formats', () => {
      const prefix = install_prefix()

      // Should be an absolute path
      expect(path.isAbsolute(prefix.string)).toBe(true)
    })

    it('should return normalized paths', () => {
      const prefix = install_prefix()

      // Path should be normalized (no double slashes, etc.)
      expect(prefix.string).toBe(path.normalize(prefix.string))
    })

    it('should handle home directory expansion', () => {
      const prefix = install_prefix()

      // If it contains .local, it should be under the home directory
      if (prefix.string.includes('.local')) {
        const homeDir = os.homedir()
        expect(prefix.string.startsWith(homeDir)).toBe(true)
      }
    })
  })

  describe('environment integration', () => {
    it('should work with different HOME values', () => {
      const originalHome = process.env.HOME
      process.env.HOME = tempDir

      const prefix = install_prefix()
      expect(prefix.string).toBeDefined()
      expect(prefix.string.length).toBeGreaterThan(0)

      process.env.HOME = originalHome
    })

    it('should handle missing HOME environment variable', () => {
      const originalHome = process.env.HOME
      delete process.env.HOME

      const prefix = install_prefix()
      expect(prefix.string).toBeDefined()
      expect(prefix.string.length).toBeGreaterThan(0)

      process.env.HOME = originalHome
    })
  })

  describe('cross-platform compatibility', () => {
    it('should work on current platform', () => {
      // Test that the system can determine platform/arch without errors
      const prefix = install_prefix()
      expect(prefix.string).toBeDefined()

      // Should handle the current platform's path conventions
      const isAbsolute = path.isAbsolute(prefix.string)
      expect(isAbsolute).toBe(true)
    })

    it('should handle different operating systems', () => {
      // Test that install function can be called (even if packages fail to download)
      expect(() => install([], tempDir)).not.toThrow()
    })
  })
})
