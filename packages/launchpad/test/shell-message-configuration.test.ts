import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { shellcode } from '../src/dev/shellcode'

describe('Shell Message Configuration', () => {
  let originalEnv: Record<string, string | undefined>

  beforeEach(() => {
    // Save original environment
    originalEnv = {
      LAUNCHPAD_SHOW_ENV_MESSAGES: process.env.LAUNCHPAD_SHOW_ENV_MESSAGES,
      LAUNCHPAD_SHELL_ACTIVATION_MESSAGE: process.env.LAUNCHPAD_SHELL_ACTIVATION_MESSAGE,
      LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE: process.env.LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE,
      LAUNCHPAD_VERBOSE: process.env.LAUNCHPAD_VERBOSE,
    }
  })

  afterEach(() => {
    // Restore original environment
    for (const [key, value] of Object.entries(originalEnv)) {
      if (value === undefined) {
        delete process.env[key]
      }
      else {
        process.env[key] = value
      }
    }
  })

  describe('LAUNCHPAD_SHOW_ENV_MESSAGES', () => {
    it('should show activation messages by default in shellcode', () => {
      delete process.env.LAUNCHPAD_SHOW_ENV_MESSAGES

      const shell = shellcode(true)

      expect(shell).toContain('Environment activated')
      expect(shell).toContain('printf')
      expect(shell.length).toBeGreaterThan(1000)
    })

    it('should show activation messages when LAUNCHPAD_SHOW_ENV_MESSAGES=true', () => {
      process.env.LAUNCHPAD_SHOW_ENV_MESSAGES = 'true'

      const shell = shellcode(true)

      expect(shell).toContain('Environment activated')
      expect(shell).toContain('LAUNCHPAD_SHOW_ENV_MESSAGES')
    })

    it('should handle message suppression when LAUNCHPAD_SHOW_ENV_MESSAGES=false', () => {
      process.env.LAUNCHPAD_SHOW_ENV_MESSAGES = 'false'

      const shell = shellcode(true)

      expect(shell).toContain('LAUNCHPAD_SHOW_ENV_MESSAGES')
      // Should still generate shell code but with conditional logic
      expect(shell.length).toBeGreaterThan(1000)
    })
  })

  describe('LAUNCHPAD_SHELL_ACTIVATION_MESSAGE', () => {
    it('should use default activation message when not set', () => {
      delete process.env.LAUNCHPAD_SHELL_ACTIVATION_MESSAGE

      const shell = shellcode(true)

      expect(shell).toContain('Environment activated')
      expect(shell).toContain('printf')
    })

    it('should use custom activation message when set', () => {
      process.env.LAUNCHPAD_SHELL_ACTIVATION_MESSAGE = '🚀 Custom activation: {path}'

      const shell = shellcode(true)

      expect(shell).toContain('🚀 Custom activation')
      expect(shell).toContain('$(basename "$project_dir")')
    })

    it('should replace {path} placeholder with project directory basename', () => {
      process.env.LAUNCHPAD_SHELL_ACTIVATION_MESSAGE = 'Activated: {path}'

      const shell = shellcode(true)

      expect(shell).toContain('Activated:')
      expect(shell).not.toContain('{path}')
      expect(shell).toContain('$(basename "$project_dir")')
    })
  })

  describe('LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE', () => {
    it('should use default deactivation message when not set', () => {
      delete process.env.LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE

      const shell = shellcode(true)

      expect(shell).toContain('deactivated')
    })

    it('should use custom deactivation message when set', () => {
      process.env.LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE = '👋 Custom deactivation'

      const shell = shellcode(true)

      expect(shell).toContain('👋 Custom deactivation')
    })
  })

  describe('Verbose Mode Integration', () => {
    it('should include verbose output when LAUNCHPAD_VERBOSE=true', () => {
      process.env.LAUNCHPAD_VERBOSE = 'true'

      const shell = shellcode(true)

      expect(shell).toContain('verbose_mode')
      expect(shell).toContain('LAUNCHPAD_VERBOSE')
    })

    it('should work with verbose mode disabled', () => {
      process.env.LAUNCHPAD_VERBOSE = 'false'

      const shell = shellcode(true)

      expect(shell.length).toBeGreaterThan(1000)
      expect(shell).toContain('verbose_mode')
    })
  })

  describe('Error Handling', () => {
    it('should handle invalid environment variables gracefully', () => {
      process.env.LAUNCHPAD_SHELL_ACTIVATION_MESSAGE = 'Test with $VAR and `command` and "quotes"'
      process.env.LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE = 'Test with \'single quotes\' and \\backslashes'

      expect(() => shellcode(true)).not.toThrow()
      const shell = shellcode(true)
      expect(shell.length).toBeGreaterThan(1000)
    })

    it('should handle empty message variables', () => {
      process.env.LAUNCHPAD_SHELL_ACTIVATION_MESSAGE = ''
      process.env.LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE = ''

      expect(() => shellcode(true)).not.toThrow()
      const shell = shellcode(true)
      expect(shell.length).toBeGreaterThan(1000)
    })
  })

  describe('Shell Code Quality', () => {
    it('should generate syntactically valid shell code', () => {
      const shell = shellcode(true)

      expect(shell).not.toContain('undefined')
      expect(shell).toContain('function')
      expect(shell.length).toBeGreaterThan(1000)
    })

    it('should include core shell integration functions', () => {
      const shell = shellcode(true)

      expect(shell).toContain('__launchpad_chpwd')
      expect(shell).toContain('LAUNCHPAD_CURRENT_PROJECT')
      expect(shell).toContain('export PATH=')
    })

    it('should handle message configuration properly', () => {
      process.env.LAUNCHPAD_SHOW_ENV_MESSAGES = 'true'
      process.env.LAUNCHPAD_SHELL_ACTIVATION_MESSAGE = 'Test activation: {path}'
      process.env.LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE = 'Test deactivation'

      const shell = shellcode(true)

      expect(shell).toContain('Test activation')
      expect(shell).toContain('Test deactivation')
      expect(shell).toContain('$(basename "$project_dir")')
      expect(shell).not.toContain('{path}')
    })
  })
})
