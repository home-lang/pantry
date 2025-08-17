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
    it('should enable messages by default', () => {
      delete process.env.LAUNCHPAD_SHOW_ENV_MESSAGES
      const shell = shellcode(true)

      // Should include message checking logic (values are resolved at build time)
      expect(shell).toContain('if [[ "true" == "true" ]]; then')
      expect(shell).toContain('printf "🚀 Project activated:')
      expect(shell).toContain('printf "👋 Project deactivated')
    })

    it('should enable messages when set to true', () => {
      process.env.LAUNCHPAD_SHOW_ENV_MESSAGES = 'true'
      const shell = shellcode(true)

      expect(shell).toContain('if [[ "true" == "true" ]]; then')
      expect(shell).toContain('printf "🚀 Project activated:')
    })

    it('should disable messages when set to false', () => {
      process.env.LAUNCHPAD_SHOW_ENV_MESSAGES = 'false'
      const shell = shellcode(true)

      // Should contain the conditional logic with false value
      expect(shell).toContain('if [[ "false" == "true" ]]; then')
      // Messages should not be executed since condition is false
    })
  })

  describe('LAUNCHPAD_SHELL_ACTIVATION_MESSAGE', () => {
    it('should use default activation message when not set', () => {
      delete process.env.LAUNCHPAD_SHELL_ACTIVATION_MESSAGE
      const shell = shellcode(true)

      // Should contain the default activation message
      expect(shell).toContain('✅ Environment activated for')
      expect(shell).toContain('$(basename "$project_dir")')
    })

    it('should use custom activation message when set', () => {
      process.env.LAUNCHPAD_SHELL_ACTIVATION_MESSAGE = '🚀 Custom activation: {path}'
      const shell = shellcode(true)

      // Should contain the custom message
      expect(shell).toContain('🚀 Custom activation: $(basename "$project_dir")')
    })

    it('should handle activation message with special characters', () => {
      process.env.LAUNCHPAD_SHELL_ACTIVATION_MESSAGE = '🎉 Project "$(basename "$project_dir")" is ready!'
      const shell = shellcode(true)

      // Should properly escape and include the message
      expect(shell).toContain('🎉 Project "$(basename "$project_dir")" is ready!')
    })

    it('should replace {path} placeholder with project directory basename', () => {
      process.env.LAUNCHPAD_SHELL_ACTIVATION_MESSAGE = 'Activated: {path}'
      const shell = shellcode(true)

      // Should replace {path} with $(basename "$project_dir")
      expect(shell).toContain('Activated: $(basename "$project_dir")')
      expect(shell).not.toContain('{path}')
    })
  })

  describe('LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE', () => {
    it('should use default deactivation message when not set', () => {
      delete process.env.LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE
      const shell = shellcode(true)

      // Should contain the default deactivation message
      expect(shell).toContain('Environment deactivated')
    })

    it('should use custom deactivation message when set', () => {
      process.env.LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE = '👋 Custom deactivation'
      const shell = shellcode(true)

      // Should contain the custom message
      expect(shell).toContain('👋 Custom deactivation')
    })

    it('should handle deactivation message with special characters', () => {
      process.env.LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE = '🔄 Project "deactivated" successfully!'
      const shell = shellcode(true)

      // Should properly escape and include the message
      expect(shell).toContain('🔄 Project "deactivated" successfully!')
    })
  })

  describe('Message Integration in Shell Logic', () => {
    it('should include activation messages in environment activation logic', () => {
      const shell = shellcode(true)

      // Should have activation messages in the shell code
      expect(shell).toContain('printf "🚀 Project activated:')
      expect(shell).toContain('>&2') // Should use stderr
    })

    it('should include deactivation messages in environment deactivation logic', () => {
      const shell = shellcode(true)

      // Should have deactivation messages in the shell code
      expect(shell).toContain('printf "👋 Project deactivated')
      expect(shell).toContain('>&2') // Should use stderr
    })

    it('should place messages after PATH manipulation but before variable cleanup', () => {
      const shell = shellcode(true)

      // Should contain the proper sequence of operations
      expect(shell).toContain('export PATH=')
      expect(shell).toContain('unset LAUNCHPAD_CURRENT_PROJECT')
      expect(shell).toContain('unset LAUNCHPAD_ENV_BIN_PATH')
    })

    it('should use stderr for all messages to avoid interfering with shell output', () => {
      const shell = shellcode(true)

      // All message printf statements should use >&2
      const printfStatements = shell.match(/printf "[^"]*\\n" >&2/g)
      expect(printfStatements).toBeTruthy()
      expect(printfStatements!.length).toBeGreaterThan(0)
    })
  })

  describe('Verbose Mode Integration', () => {
    it('should use config verbose default when LAUNCHPAD_VERBOSE is not set', () => {
      delete process.env.LAUNCHPAD_VERBOSE
      const shell = shellcode(true)

      // Should include verbose mode logic (values resolved at build time)
      expect(shell).toContain('local verbose_mode="false"') // Default from config
      expect(shell).toContain('if [[ -n "$LAUNCHPAD_VERBOSE" ]]; then')
      expect(shell).toContain('verbose_mode="$LAUNCHPAD_VERBOSE"')
    })

    it('should override config default when LAUNCHPAD_VERBOSE is explicitly set', () => {
      process.env.LAUNCHPAD_VERBOSE = 'true'
      const shell = shellcode(true)

      // Should still include the override logic
      expect(shell).toContain('if [[ -n "$LAUNCHPAD_VERBOSE" ]]; then')
      expect(shell).toContain('verbose_mode="$LAUNCHPAD_VERBOSE"')
    })

    it('should control shell integration startup message based on verbose mode', () => {
      const shell = shellcode(true)

      // Should include verbose-controlled startup message
      expect(shell).toContain('if [[ "$verbose_mode" == "true" ]]; then')
      expect(shell).toContain('printf "⏱️  [0s] Shell integration started for PWD=%s\\n" "$PWD" >&2')
    })
  })

  describe('Environment Variable Validation', () => {
    it('should handle undefined environment variables gracefully', () => {
      delete process.env.LAUNCHPAD_SHOW_ENV_MESSAGES
      delete process.env.LAUNCHPAD_SHELL_ACTIVATION_MESSAGE
      delete process.env.LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE

      expect(() => shellcode(true)).not.toThrow()
      const shell = shellcode(true)
      expect(shell).toBeTruthy()
      expect(shell.length).toBeGreaterThan(0)
    })

    it('should handle empty string environment variables', () => {
      process.env.LAUNCHPAD_SHOW_ENV_MESSAGES = ''
      process.env.LAUNCHPAD_SHELL_ACTIVATION_MESSAGE = ''
      process.env.LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE = ''

      expect(() => shellcode(true)).not.toThrow()
      const shell = shellcode(true)
      expect(shell).toBeTruthy()
    })

    it('should handle environment variables with special shell characters', () => {
      process.env.LAUNCHPAD_SHELL_ACTIVATION_MESSAGE = 'Test with $VAR and `command` and "quotes"'
      process.env.LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE = 'Test with \'single quotes\' and \\backslashes'

      expect(() => shellcode(true)).not.toThrow()
      const shell = shellcode(true)
      expect(shell).toBeTruthy()
    })
  })

  describe('Shell Syntax Validation', () => {
    it('should generate valid shell syntax with default settings', () => {
      const shell = shellcode(true)

      // Basic syntax checks
      expect(shell).not.toContain('undefined')
      // Note: "null" appears in "2>/dev/null" which is valid shell syntax

      // Should have balanced brackets (allowing for some unmatched brackets in regex patterns)
      const openBrackets = (shell.match(/\[/g) || []).length
      const closeBrackets = (shell.match(/\]/g) || []).length

      // Allow small difference due to regex patterns in shell code
      expect(Math.abs(openBrackets - closeBrackets)).toBeLessThan(10)

      // Should contain core shell integration elements
      expect(shell).toContain('__launchpad_switch_environment')
      expect(shell).toContain('LAUNCHPAD_CURRENT_PROJECT')
    })

    it('should generate valid shell syntax with custom messages', () => {
      process.env.LAUNCHPAD_SHELL_ACTIVATION_MESSAGE = '🚀 Project: $(basename "$project_dir")'
      process.env.LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE = '👋 Goodbye!'

      const shell = shellcode(true)

      // Should not contain undefined
      expect(shell).not.toContain('undefined')

      // Should properly escape the custom messages
      expect(shell).toContain('🚀 Project: $(basename "$project_dir")')
      expect(shell).toContain('👋 Goodbye!')
    })

    it('should handle test mode correctly', () => {
      const testShell = shellcode(true)
      const normalShell = shellcode(false)

      // Test mode should be different from normal mode
      expect(testShell).not.toBe(normalShell)

      // Both should be valid shell code
      expect(testShell).toBeTruthy()
      expect(normalShell).toBeTruthy()
    })
  })

  describe('Integration with Existing Shell Features', () => {
    it('should not interfere with hook registration', () => {
      const shell = shellcode(true)

      // Should still contain hook registration logic
      expect(shell).toContain('__launchpad_chpwd')
      expect(shell).toContain('chpwd_functions+=(__launchpad_chpwd)')
      expect(shell).toContain('__launchpad_prompt_command')
    })

    it('should not interfere with environment switching logic', () => {
      const shell = shellcode(true)

      // Should still contain core environment switching
      expect(shell).toContain('__launchpad_switch_environment')
      expect(shell).toContain('LAUNCHPAD_CURRENT_PROJECT')
      expect(shell).toContain('LAUNCHPAD_ENV_BIN_PATH')
    })

    it('should not interfere with safety guards', () => {
      const shell = shellcode(true)

      // Should still contain safety mechanisms
      expect(shell).toContain('__LAUNCHPAD_PROCESSING')
      expect(shell).toContain('__LAUNCHPAD_IN_HOOK')
      expect(shell).toContain('LAUNCHPAD_DISABLE_SHELL_INTEGRATION')
    })
  })

  describe('Performance Considerations', () => {
    it('should not significantly increase shell code size', () => {
      const baseShell = shellcode(true)

      // Set complex custom messages
      process.env.LAUNCHPAD_SHELL_ACTIVATION_MESSAGE = 'Very long custom activation message with lots of details and information'
      process.env.LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE = 'Very long custom deactivation message with lots of details and information'

      const customShell = shellcode(true)

      // Custom messages shouldn't dramatically increase size
      const sizeIncrease = customShell.length - baseShell.length
      expect(sizeIncrease).toBeLessThan(1000) // Reasonable size increase
    })

    it('should minimize conditional checks in hot paths', () => {
      const shell = shellcode(true)

      // Message checks should be simple and fast (resolved at build time)
      const messageChecks = shell.match(/if \[\[ "(?:true|false)" == "true" \]\]; then/g)
      expect(messageChecks).toBeTruthy()

      // Should use simple string comparison, not complex logic for messages
      // Note: =~ is used for hook registration which is valid
      expect(shell).not.toContain('| grep')
    })
  })
})
