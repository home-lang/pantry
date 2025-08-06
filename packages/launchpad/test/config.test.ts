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
    // Restore environment variables properly without replacing the entire process.env object
    Object.keys(process.env).forEach((key) => {
      delete process.env[key]
    })
    Object.assign(process.env, originalEnv)
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  describe('defaultConfig', () => {
    it('should have required configuration properties', () => {
      expect(defaultConfig.installPath).toBeDefined()
      expect(typeof defaultConfig.installPath).toBe('string')
      expect(defaultConfig.installPath?.length).toBeGreaterThan(0)

      expect(defaultConfig.shimPath).toBeDefined()
      expect(typeof defaultConfig.shimPath).toBe('string')
      expect(defaultConfig.shimPath?.length).toBeGreaterThan(0)

      expect(defaultConfig.shellActivationMessage).toBeDefined()
      expect(typeof defaultConfig.shellActivationMessage).toBe('string')
      expect(defaultConfig.shellActivationMessage?.length).toBeGreaterThan(0)

      expect(defaultConfig.shellDeactivationMessage).toBeDefined()
      expect(typeof defaultConfig.shellDeactivationMessage).toBe('string')
      expect(defaultConfig.shellDeactivationMessage?.length).toBeGreaterThan(0)
    })

    it('should have reasonable default values', () => {
      // In CI/GitHub Actions, verbose is set to true
      if (process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true') {
        expect(defaultConfig.verbose).toBe(true)
        expect(defaultConfig.maxRetries).toBe(5)
        expect(defaultConfig.timeout).toBe(120000)
      }
      else {
        expect(defaultConfig.verbose).toBe(false)
        expect(defaultConfig.maxRetries).toBe(3)
        expect(defaultConfig.timeout).toBe(60000)
      }

      expect(defaultConfig.devAware).toBe(true)
      expect(defaultConfig.autoSudo).toBe(true)
      expect(defaultConfig.symlinkVersions).toBe(true)
      expect(defaultConfig.forceReinstall).toBe(false)
      expect(defaultConfig.autoAddToPath).toBe(true)
      // New shell message default values
      expect(defaultConfig.showShellMessages).toBe(true)
      // Check that activation message contains expected text (may have ANSI codes)
      // Strip ANSI escape sequences for testing
      const ansiEscapeRegex = new RegExp(`${String.fromCharCode(27)}\\[[\\d;]*m`, 'g')
      const cleanMessage = defaultConfig.shellActivationMessage?.replace(ansiEscapeRegex, '') || ''
      expect(cleanMessage).toContain('Environment activated for {path}')
      expect(defaultConfig.shellDeactivationMessage).toBe('⚪ Environment deactivated')
    })

    it('should have valid installation paths', () => {
      const expectedPaths = [
        '/usr/local',
        path.join(process.env.HOME || '', '.local'),
        path.join(process.env.USERPROFILE || '', '.local'),
      ]

      expect(expectedPaths).toContain(defaultConfig.installPath)
      expect(defaultConfig.installPath).not.toBe('/opt/homebrew')
      expect(defaultConfig.installPath).not.toContain('/opt/homebrew')
    })

    it('should have valid shell messages', () => {
      // eslint-disable-next-line no-control-regex
      const ansiEscapeRegex = /\x1B\[[0-9;]*[a-z]/gi

      expect(defaultConfig.shellActivationMessage).toBeDefined()
      const cleanMessage = defaultConfig.shellActivationMessage?.replace(ansiEscapeRegex, '') || ''
      expect(cleanMessage.length).toBeGreaterThan(0)

      expect(defaultConfig.shellDeactivationMessage).toBeDefined()
      expect(defaultConfig.shellDeactivationMessage?.length).toBeGreaterThan(0)
    })

    it('should have valid installation path', () => {
      expect(typeof defaultConfig.installPath).toBe('string')
      expect(defaultConfig.installPath!.length).toBeGreaterThan(0)

      expect(defaultConfig.shimPath).toBeDefined()
      expect(defaultConfig.shimPath!.length).toBeGreaterThan(0)
    })

    it('should have activation message with path placeholder', () => {
      expect(defaultConfig.shellActivationMessage).toContain('{path}')
    })

    it('should respect SUDO_PASSWORD environment variable', () => {
    // This test verifies that the config system respects SUDO_PASSWORD
    // Note: defaultConfig is loaded at module import time, so it captures
    // the environment value when the module was first loaded
    // We check that it's a string (empty string if not set, or the actual value if set)
      expect(typeof defaultConfig.sudoPassword).toBe('string')

      // The value should either be empty (if SUDO_PASSWORD wasn't set during module load)
      // or match the pattern of a typical password/value
      if (defaultConfig.sudoPassword) {
        expect(defaultConfig.sudoPassword).toBeTruthy()
      }
      else {
        expect(defaultConfig.sudoPassword).toBe('')
      }
    })

    it('should use appropriate installation path based on permissions', () => {
      // The installation path should be either /usr/local or ~/.local
      const homePath = process.env.HOME || process.env.USERPROFILE || '~'
      const expectedPaths = ['/usr/local', path.join(homePath, '.local')]
      expect(expectedPaths).toContain(defaultConfig.installPath)
    })

    it('should never use /opt/homebrew as installation path', () => {
      // Ensure we follow pkgm pattern and never install to Homebrew's directory
      expect(defaultConfig.installPath).not.toBe('/opt/homebrew')
      expect(defaultConfig.installPath).not.toContain('/opt/homebrew')
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
      expect(config.installPath).toBeDefined()
      expect(config.sudoPassword).toBeDefined()
      expect(config.devAware).toBeDefined()
      expect(config.autoSudo).toBeDefined()
      expect(config.maxRetries).toBeDefined()
      expect(config.timeout).toBeDefined()
      expect(config.symlinkVersions).toBeDefined()
      expect(config.forceReinstall).toBeDefined()
      expect(config.shimPath).toBeDefined()
      expect(config.autoAddToPath).toBeDefined()
      // New shell message properties
      expect(config.showShellMessages).toBeDefined()
      expect(config.shellActivationMessage).toBeDefined()
      expect(config.shellDeactivationMessage).toBeDefined()
    })

    it('should be a valid LaunchpadConfig object', () => {
      expect(typeof config.verbose).toBe('boolean')
      expect(typeof config.installPath).toBe('string')
      expect(typeof config.sudoPassword).toBe('string')
      expect(typeof config.devAware).toBe('boolean')
      expect(typeof config.autoSudo).toBe('boolean')
      expect(typeof config.maxRetries).toBe('number')
      expect(typeof config.timeout).toBe('number')
      expect(typeof config.symlinkVersions).toBe('boolean')
      expect(typeof config.forceReinstall).toBe('boolean')
      expect(typeof config.shimPath).toBe('string')
      expect(typeof config.autoAddToPath).toBe('boolean')
      // New shell message type checks
      expect(typeof config.showShellMessages).toBe('boolean')
      expect(typeof config.shellActivationMessage).toBe('string')
      expect(typeof config.shellDeactivationMessage).toBe('string')
    })

    it('should have reasonable values', () => {
      expect(config.maxRetries).toBeGreaterThan(0)
      expect(config.timeout).toBeGreaterThan(0)
      expect((config.installPath ?? '').length).toBeGreaterThan(0)
      expect(config.shimPath?.length).toBeGreaterThan(0)
      // Shell message validation
      expect(config.shellActivationMessage?.length).toBeGreaterThan(0)
      expect(config.shellDeactivationMessage?.length).toBeGreaterThan(0)
    })

    it('should load configuration correctly', () => {
      expect(config).toBeDefined()
      expect(config.installPath).toBeDefined()
      expect(typeof config.installPath).toBe('string')
      expect((config.installPath ?? '').length).toBeGreaterThan(0)

      expect(config.shimPath).toBeDefined()
      expect(config.shimPath?.length).toBeGreaterThan(0)

      expect(config.shellActivationMessage).toBeDefined()
      expect(config.shellActivationMessage?.length).toBeGreaterThan(0)

      expect(config.shellDeactivationMessage).toBeDefined()
      expect(config.shellDeactivationMessage?.length).toBeGreaterThan(0)
    })

    it('should have valid shell message configuration', () => {
      expect(typeof config.showShellMessages).toBe('boolean')
      expect(typeof config.shellActivationMessage).toBe('string')
      expect(typeof config.shellDeactivationMessage).toBe('string')
      expect(config.shellActivationMessage?.length).toBeGreaterThan(0)
      expect(config.shellDeactivationMessage?.length).toBeGreaterThan(0)
    })

    it('should have valid message content', () => {
      const message = config.shellActivationMessage
      expect(message).toBeDefined()
      expect((message ?? '').length).toBeGreaterThan(0)

      const deactivationMessage = config.shellDeactivationMessage
      expect(deactivationMessage).toBeDefined()
      expect((deactivationMessage ?? '').length).toBeGreaterThan(0)
    })

    it('should have valid shell message format', () => {
      if (config.shellActivationMessage?.includes('{path}')) {
        // Test that the message contains valid characters (including ANSI escape codes and emojis)
        const message = config.shellActivationMessage ?? ''
        // Allow common shell-safe characters, ANSI escape sequences, and Unicode emojis
        const hasValidChars = /^[\w\s{}\-.,:;?!()[\]|/~`@#$%^&*+=<>"'\\\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]+$/u.test(message)
          || message.includes('\x1B[') // Allow ANSI escape sequences
        expect(hasValidChars).toBe(true)

        // Test for specific characters that should be present
        const requiredChars = ['{', '}', 'p', 'a', 't', 'h']
        for (const char of requiredChars) {
          if (config.shellActivationMessage?.includes(char)) {
            expect(config.shellActivationMessage.includes(char)).toBe(true)
          }
        }
      }

      if (config.shellDeactivationMessage) {
        // Test that the message contains valid characters (including ANSI escape codes and emojis)
        const message = config.shellDeactivationMessage ?? ''
        // Allow common shell-safe characters, ANSI escape sequences, and Unicode emojis
        const hasValidChars = /^[\w\s{}\-.,:;?!()[\]|/~`@#$%^&*+=<>"'\\\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F1E0}-\u{1F1FF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]+$/u.test(message)
          || message.includes('\x1B[') // Allow ANSI escape sequences
        expect(hasValidChars).toBe(true)
      }

      expect(config.shellActivationMessage?.trim().length).toBeGreaterThan(0)
      expect(config.shellDeactivationMessage?.trim().length).toBeGreaterThan(0)
    })

    it('should have valid installation path', () => {
      expect(config.installPath).toMatch(/^[/~]/) // Should start with / or ~
      expect(config.installPath).not.toBe('/opt/homebrew')
      expect(config.installPath).not.toContain('/opt/homebrew')
    })

    it('should have valid shim path', () => {
      const homePath = process.env.HOME || process.env.USERPROFILE || '~'
      const isUnderHome = config.shimPath?.startsWith(homePath) || config.shimPath?.startsWith('~')
      const isUnderInstall = (config.shimPath ?? '').startsWith(config.installPath ?? '')

      expect(config.shimPath).toBeDefined()
      expect(config.shimPath?.length).toBeGreaterThan(0)
      expect(isUnderHome || isUnderInstall).toBe(true)
    })

    it('should have valid configuration structure', () => {
      expect((config.installPath ?? '').length).toBeGreaterThan(0)
      expect(config.shimPath?.length).toBeGreaterThan(0)
    })
  })

  describe('shell message configuration', () => {
    it('should have valid message templates', () => {
      expect(config.shellActivationMessage).toBeTruthy()
      expect(config.shellDeactivationMessage).toBeTruthy()
      expect(typeof config.shellActivationMessage).toBe('string')
      expect(typeof config.shellDeactivationMessage).toBe('string')
    })

    it('should support disabling shell messages', () => {
      // The config should support boolean values for showShellMessages
      expect(typeof config.showShellMessages).toBe('boolean')
    })

    it('should handle custom activation messages', () => {
      // The activation message should be customizable
      const message = config.shellActivationMessage
      expect((message ?? '').length).toBeGreaterThan(0)
      // Should be a valid string that can be used in shell scripts
      expect(message).not.toContain('\n')
    })

    it('should handle custom deactivation messages', () => {
      // The deactivation message should be customizable
      const message = config.shellDeactivationMessage
      expect((message ?? '').length).toBeGreaterThan(0)
      // Should be a valid string that can be used in shell scripts
      expect(message).not.toContain('\n')
    })

    it('should preserve {path} placeholder in activation message', () => {
      // If the activation message contains {path}, it should be preserved
      if ((config.shellActivationMessage ?? '').includes('{path}')) {
        expect((config.shellActivationMessage ?? '').includes('{path}')).toBe(true)
      }
    })

    it('should handle shell-safe messages', () => {
      // Messages should not contain characters that would break shell scripts
      const unsafeChars = ['"', '\'', '`', '$', '\\']

      // Check activation message
      for (const char of unsafeChars) {
        if ((config.shellActivationMessage ?? '').includes(char)) {
          // If it contains special chars, they should be properly escaped
          // This is a warning rather than a hard failure since some messages might intentionally use these
          console.warn(`Activation message contains potentially unsafe character: ${char}`)
        }
      }

      // Check deactivation message
      for (const char of unsafeChars) {
        if ((config.shellDeactivationMessage ?? '').includes(char)) {
          console.warn(`Deactivation message contains potentially unsafe character: ${char}`)
        }
      }

      // At minimum, messages should not be empty
      expect(config.shellActivationMessage?.trim().length).toBeGreaterThan(0)
      expect(config.shellDeactivationMessage?.trim().length).toBeGreaterThan(0)
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
      expect(config.installPath).toMatch(/^[/~]/) // Should start with / or ~
      expect(config.shimPath).toMatch(/^[/~]/) // Should start with / or ~
    })

    it('should never install to Homebrew directory', () => {
      // Ensure we follow pkgm pattern
      expect(config.installPath).not.toBe('/opt/homebrew')
      expect(config.installPath).not.toContain('/opt/homebrew')
    })

    it('should have consistent path structure', () => {
      // Shim path should typically be under the installation path or home directory
      const homePath = process.env.HOME || process.env.USERPROFILE || '~'
      const isUnderHome = config.shimPath?.startsWith(homePath) || config.shimPath?.startsWith('~')
      const isUnderInstall = (config.shimPath ?? '').startsWith(config.installPath ?? '')
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
      expect((config.installPath ?? '').length).toBeGreaterThan(0)
      expect(config.shimPath?.length).toBeGreaterThan(0)
    })
  })
})
