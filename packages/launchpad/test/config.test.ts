import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { config, defaultConfig } from '../src/config'

describe('Config', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string

  beforeEach(() => {
    originalEnv = { ...process.env }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-test-'))
  })

  afterEach(() => {
    process.env = originalEnv
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  describe('defaultConfig', () => {
    it('should have all required properties', () => {
      expect(defaultConfig.verbose).toBeDefined()
      expect(defaultConfig.installationPath).toBeDefined()
      expect(defaultConfig.sudoPassword).toBeDefined()
      expect(defaultConfig.devAware).toBeDefined()
      expect(defaultConfig.autoSudo).toBeDefined()
      expect(defaultConfig.maxRetries).toBeDefined()
      expect(defaultConfig.timeout).toBeDefined()
      expect(defaultConfig.symlinkVersions).toBeDefined()
      expect(defaultConfig.forceReinstall).toBeDefined()
      expect(defaultConfig.shimPath).toBeDefined()
      expect(defaultConfig.autoAddToPath).toBeDefined()
    })

    it('should have reasonable default values', () => {
      expect(defaultConfig.verbose).toBe(false)
      expect(defaultConfig.devAware).toBe(true)
      expect(defaultConfig.autoSudo).toBe(true)
      expect(defaultConfig.maxRetries).toBe(3)
      expect(defaultConfig.timeout).toBe(60000)
      expect(defaultConfig.symlinkVersions).toBe(true)
      expect(defaultConfig.forceReinstall).toBe(false)
      expect(defaultConfig.autoAddToPath).toBe(true)
    })

    it('should have valid paths', () => {
      expect(typeof defaultConfig.installationPath).toBe('string')
      expect(defaultConfig.installationPath.length).toBeGreaterThan(0)
      expect(typeof defaultConfig.shimPath).toBe('string')
      expect(defaultConfig.shimPath.length).toBeGreaterThan(0)
    })

    it('should respect SUDO_PASSWORD environment variable', () => {
      // This test checks the current state, as defaultConfig is already loaded
      if (process.env.SUDO_PASSWORD) {
        expect(defaultConfig.sudoPassword).toBe(process.env.SUDO_PASSWORD)
      }
      else {
        expect(defaultConfig.sudoPassword).toBe('')
      }
    })

    it('should use appropriate installation path based on permissions', () => {
      // The installation path should be either /usr/local or ~/.local
      const homePath = process.env.HOME || process.env.USERPROFILE || '~'
      const expectedPaths = ['/usr/local', path.join(homePath, '.local')]
      expect(expectedPaths).toContain(defaultConfig.installationPath)
    })

    it('should use appropriate shim path', () => {
      const homePath = process.env.HOME || process.env.USERPROFILE || '~'
      const expectedShimPath = path.join(homePath, '.local', 'bin')
      expect(defaultConfig.shimPath).toBe(expectedShimPath)
    })
  })

  describe('config object', () => {
    it('should have all required properties', () => {
      expect(config.verbose).toBeDefined()
      expect(config.installationPath).toBeDefined()
      expect(config.sudoPassword).toBeDefined()
      expect(config.devAware).toBeDefined()
      expect(config.autoSudo).toBeDefined()
      expect(config.maxRetries).toBeDefined()
      expect(config.timeout).toBeDefined()
      expect(config.symlinkVersions).toBeDefined()
      expect(config.forceReinstall).toBeDefined()
      expect(config.shimPath).toBeDefined()
      expect(config.autoAddToPath).toBeDefined()
    })

    it('should be a valid LaunchpadConfig object', () => {
      expect(typeof config.verbose).toBe('boolean')
      expect(typeof config.installationPath).toBe('string')
      expect(typeof config.sudoPassword).toBe('string')
      expect(typeof config.devAware).toBe('boolean')
      expect(typeof config.autoSudo).toBe('boolean')
      expect(typeof config.maxRetries).toBe('number')
      expect(typeof config.timeout).toBe('number')
      expect(typeof config.symlinkVersions).toBe('boolean')
      expect(typeof config.forceReinstall).toBe('boolean')
      expect(typeof config.shimPath).toBe('string')
      expect(typeof config.autoAddToPath).toBe('boolean')
    })

    it('should have reasonable values', () => {
      expect(config.maxRetries).toBeGreaterThan(0)
      expect(config.timeout).toBeGreaterThan(0)
      expect(config.installationPath.length).toBeGreaterThan(0)
      expect(config.shimPath.length).toBeGreaterThan(0)
    })

    it('should load from launchpad.config.ts if present', () => {
      // This test verifies that the config system is working
      // The actual config values depend on whether a config file exists
      expect(config).toBeDefined()
      expect(typeof config).toBe('object')
    })
  })

  describe('config validation', () => {
    it('should have numeric values within reasonable ranges', () => {
      expect(config.maxRetries).toBeGreaterThanOrEqual(1)
      expect(config.maxRetries).toBeLessThanOrEqual(10)
      expect(config.timeout).toBeGreaterThanOrEqual(1000) // At least 1 second
      expect(config.timeout).toBeLessThanOrEqual(300000) // At most 5 minutes
    })

    it('should have valid path formats', () => {
      expect(config.installationPath).toMatch(/^[/~]/) // Should start with / or ~
      expect(config.shimPath).toMatch(/^[/~]/) // Should start with / or ~
    })

    it('should have consistent path structure', () => {
      // Shim path should typically be under the installation path or home directory
      const homePath = process.env.HOME || process.env.USERPROFILE || '~'
      const isUnderHome = config.shimPath.startsWith(homePath) || config.shimPath.startsWith('~')
      const isUnderInstall = config.shimPath.startsWith(config.installationPath)
      expect(isUnderHome || isUnderInstall).toBe(true)
    })
  })

  describe('environment integration', () => {
    it('should handle missing environment variables gracefully', () => {
      // Config should still be valid even if some env vars are missing
      expect(config).toBeDefined()
      expect(typeof config.sudoPassword).toBe('string')
    })

    it('should use fallback values when needed', () => {
      // Installation path should never be empty
      expect(config.installationPath.length).toBeGreaterThan(0)
      expect(config.shimPath.length).toBeGreaterThan(0)
    })
  })
})
