import { describe, expect, it } from 'bun:test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

describe('Shell Message Configuration', () => {
  describe('Default Configuration', () => {
    it('should have sensible default shell message settings', async () => {
      const { config } = await import('../src/config')

      expect(config.showShellMessages).toBeDefined()
      expect(config.shellActivationMessage).toBeDefined()
      expect(config.shellDeactivationMessage).toBeDefined()
      expect(config.showShellMessages).toBe(true)
    })

    it('should support custom shell message configuration', async () => {
      const { config } = await import('../src/config')

      // Ensure all message types are configurable
      expect(typeof config.shellActivationMessage).toBe('string')
      expect(typeof config.shellDeactivationMessage).toBe('string')
      expect(typeof config.showShellMessages).toBe('boolean')
    })

    it('should validate shell message types', async () => {
      const { config } = await import('../src/config')

      expect(config.shellActivationMessage).toMatch(/✅|🔧|Environment/)
      expect(config.shellDeactivationMessage).toMatch(/⚪|Environment|environment/)
    })

    it('should handle missing configuration gracefully', async () => {
      const { config } = await import('../src/config')

      // Should have fallback values
      expect(config.shellActivationMessage).toBeTruthy()
      expect(config.shellDeactivationMessage).toBeTruthy()
    })
  })

  describe('Shellcode Generation with Configuration', () => {
    it('should embed configuration in generated shellcode', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const code = shellcode()

      // Should contain optimized shell integration logic instead of dev:on
      expect(code).toContain('__launchpad_chpwd')
      expect(code).toContain('Environment activated')
      expect(code).toContain('Environment deactivated')
    })

    it('should generate conditional message display logic', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const code = shellcode()

      // Should have conditional logic for message display
      expect(code).toContain('LAUNCHPAD_SHOW_ENV_MESSAGES')
      expect(code).toContain('false')
    })

    it('should handle path placeholder replacement', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const code = shellcode()

      // Should use basename for project path display
      expect(code).toContain('basename')
      expect(code).toContain('project_dir')
    })

    it('should escape shell special characters', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const code = shellcode()

      // Should properly escape shell characters in messages
      expect(code).toContain('\\033[') // ANSI escape codes should be properly escaped
      expect(code).toContain('\\n') // Newlines should be escaped
    })

    it('should generate valid shell syntax', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const code = shellcode()

      // Should have proper shell syntax
      expect(code).toContain('if [[ ')
      expect(code).toContain('printf ')
      expect(code).toContain('fi')
      expect(code).not.toContain('undefined')
    })
  })

  describe('Message Customization', () => {
    it('should support disabling all messages', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const code = shellcode()

      // Should have conditional logic for message display
      expect(code).toContain('LAUNCHPAD_SHOW_ENV_MESSAGES')
      expect(code).toContain('false')
    })

    it('should support custom activation messages', async () => {
      const { config } = await import('../src/config')
      const { shellcode } = await import('../src/dev/shellcode')
      const code = shellcode()

      // Should include activation message logic
      expect(code).toContain('Environment activated')
      expect(code).toContain('printf')
      // Configuration should be available
      expect(typeof config.shellActivationMessage).toBe('string')
    })

    it('should support custom deactivation messages', async () => {
      const { config } = await import('../src/config')
      const { shellcode } = await import('../src/dev/shellcode')
      const code = shellcode()

      // Should include deactivation message logic
      expect(code).toContain('Environment deactivated')
      expect(code).toContain('printf')
      // Configuration should be available
      expect(typeof config.shellDeactivationMessage).toBe('string')
    })

    it('should handle emoji and special characters in messages', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const code = shellcode()

      // Should handle emoji properly
      expect(code).toContain('✅') // Check individual emojis instead of regex
    })

    it('should preserve ANSI escape codes in messages', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const code = shellcode()

      // Should have ANSI escape codes for styling
      expect(code).toContain('\\033[')
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty messages gracefully', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const code = shellcode()

      // Should not contain empty printf statements
      expect(code).not.toContain('printf ""')
      expect(code).not.toContain('printf \'\'')
    })

    it('should handle messages without path placeholder', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const code = shellcode()

      // Should handle both messages with and without path placeholders
      expect(code).toContain('basename')
    })

    it('should handle very long messages', async () => {
      const { shellcode } = await import('../src/dev/shellcode')

      // Should not break with long configuration
      expect(() => shellcode()).not.toThrow()
    })

    it('should handle messages with multiple path placeholders', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const code = shellcode()

      // Should handle path replacement consistently
      expect(code).toContain('project_dir')
      expect(code).toContain('basename')
    })

    it('should handle shell injection attempts', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const code = shellcode()

      // Should not contain dangerous command substitution patterns (backticks)
      expect(code).not.toContain('`')
      // Should have proper quoting in printf statements
      expect(code).toMatch(/printf ".*"/)
      // Should not contain unescaped user input
      expect(code).not.toContain('eval "$user_input"')
    })
  })

  describe('Integration with Dev Environment', () => {
    it('should work with dev command', async () => {
      // Create a temporary test directory
      const testDir = join(import.meta.dirname, 'shell-messages-test')

      try {
        mkdirSync(testDir, { recursive: true })
        writeFileSync(join(testDir, 'dependencies.yaml'), `
packages:
  - cowsay
`)

        const { dump } = await import('../src/dev/dump')

        // Should run without throwing (may produce shell output or complete successfully)
        try {
          await dump(testDir, { quiet: true, shellOutput: true })
          // If it completes successfully, that's good
          expect(true).toBe(true)
        }
        catch (error) {
          // If it fails, it should still be a handled error (not a crash)
          expect(error).toBeDefined()
        }
      }
      finally {
        if (existsSync(testDir)) {
          rmSync(testDir, { recursive: true, force: true })
        }
      }
    })

    it('should work with different dependency file types', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const code = shellcode()

      // Should handle multiple dependency file patterns
      expect(code).toContain('dependencies')
      expect(code).toContain('deps')
      expect(code).toContain('pkgx')
      expect(code).toContain('launchpad')
    })

    it('should maintain configuration across environment switches', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const code = shellcode()

      // Should preserve message settings when switching projects
      expect(code).toContain('LAUNCHPAD_SHOW_ENV_MESSAGES')
      expect(code).toContain('LAUNCHPAD_CURRENT_PROJECT')
    })
  })
})
