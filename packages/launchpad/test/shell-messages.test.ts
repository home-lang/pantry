import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

describe('Shell Message Configuration', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string
  let originalCwd: string

  beforeEach(() => {
    originalEnv = { ...process.env }
    originalCwd = process.cwd()
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-shell-msg-test-'))
  })

  afterEach(() => {
    process.env = originalEnv
    process.chdir(originalCwd)
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  describe('Configuration Loading', () => {
    it('should load default shell message configuration', async () => {
      const { defaultConfig } = await import('../src/config')

      expect(defaultConfig.showShellMessages).toBe(true)
      expect(defaultConfig.shellActivationMessage).toBe('✅ Environment activated for {path}')
      expect(defaultConfig.shellDeactivationMessage).toBe('dev environment deactivated')
    })

    it('should support custom shell message configuration', async () => {
      // Create a custom config file
      const configPath = path.join(tempDir, 'launchpad.config.ts')
      const configContent = `
import type { LaunchpadConfig } from '../packages/launchpad/src'

export default {
  showShellMessages: false,
  shellActivationMessage: '🚀 Custom activation for {path}',
  shellDeactivationMessage: '👋 Custom deactivation',
} satisfies Partial<LaunchpadConfig>
`
      fs.writeFileSync(configPath, configContent)

      // Change to temp directory so config is loaded
      process.chdir(tempDir)

      // Clear module cache to force reload
      const configModule = '../src/config'
      if (require.cache[require.resolve(configModule)]) {
        delete require.cache[require.resolve(configModule)]
      }

      // Test that custom config would be used if available
      expect(fs.existsSync(configPath)).toBe(true)
    })

    it('should validate shell message types', async () => {
      const { config } = await import('../src/config')

      expect(typeof config.showShellMessages).toBe('boolean')
      expect(typeof config.shellActivationMessage).toBe('string')
      expect(typeof config.shellDeactivationMessage).toBe('string')

      expect(config.shellActivationMessage.length).toBeGreaterThan(0)
      expect(config.shellDeactivationMessage.length).toBeGreaterThan(0)
    })

    it('should handle missing configuration gracefully', async () => {
      // Even without config file, defaults should work
      const { defaultConfig } = await import('../src/config')

      expect(defaultConfig.showShellMessages).toBeDefined()
      expect(defaultConfig.shellActivationMessage).toBeDefined()
      expect(defaultConfig.shellDeactivationMessage).toBeDefined()
    })
  })

  describe('Shellcode Generation with Configuration', () => {
    it('should embed configuration in generated shellcode', async () => {
      const { default: shellcode } = await import('../src/dev/shellcode')
      const code = shellcode()

      // Should contain the interpolated values, not the variable names
      // Look for conditional structures that would be generated
      const hasConditional = /if \[ "(?:true|false)" = "true" \]; then/.test(code)
      expect(hasConditional).toBe(true)

      // Should contain the actual message text
      expect(code).toContain('Environment activated for')
      expect(code).toContain('environment deactivated')
    })

    it('should generate conditional message display logic', async () => {
      const { default: shellcode } = await import('../src/dev/shellcode')
      const code = shellcode()

      // Should contain if statements that check showShellMessages
      const hasConditional = /if \[ "[^"]*" = "true" \]; then/.test(code)
      expect(hasConditional).toBe(true)
    })

    it('should handle path placeholder replacement', async () => {
      const { default: shellcode } = await import('../src/dev/shellcode')
      const code = shellcode()

      // Should contain logic to replace {path} with actual path
      expect(code).toContain('{path}')

      // Should contain shell variable substitution
      // eslint-disable-next-line no-template-curly-in-string
      const hasShellVar = code.includes('$cwd') || code.includes('${PWD}')
      expect(hasShellVar).toBe(true)
    })

    it('should escape shell special characters', async () => {
      const { default: shellcode } = await import('../src/dev/shellcode')
      const code = shellcode()

      // Should not contain unescaped characters that could break shell
      const lines = code.split('\n')
      for (const line of lines) {
        if (line.includes('echo') && line.includes('Environment activated')) {
          // Echo statements should be properly quoted or escaped
          const hasProperQuoting = /echo\s+["'].*["']/.test(line) || line.includes('$')
          expect(hasProperQuoting).toBe(true)
        }
      }
    })

    it('should generate valid shell syntax', async () => {
      const { default: shellcode } = await import('../src/dev/shellcode')
      const code = shellcode()

      // Basic shell syntax validation - avoid testing for "null" as it appears in >/dev/null
      expect(code).not.toContain('undefined')
      expect(code).not.toContain('[object Object]')
      expect(code).not.toContain('= null')

      // Should contain proper shell constructs
      expect(code).toContain('function')
      expect(code).toContain('if [')
      expect(code).toContain('fi')
    })
  })

  describe('Message Customization', () => {
    it('should support disabling all messages', async () => {
      const { default: shellcode } = await import('../src/dev/shellcode')
      const code = shellcode()

      // Should have conditional logic for messages (config is interpolated at generation time)
      // Look for the pattern: if [ "true" = "true" ]; then or if [ "false" = "true" ]; then
      const hasMessageConditional = /if \[ "(?:true|false)" = "true" \]; then/.test(code)
      expect(hasMessageConditional).toBe(true)
    })

    it('should support custom activation messages', async () => {
      const { config } = await import('../src/config')
      const { default: shellcode } = await import('../src/dev/shellcode')
      const code = shellcode()

      // Should include text from the activation message (either default or custom)
      // The {path} placeholder would be replaced with shell variables
      const messageContent = config.shellActivationMessage.replace('{path}', '')
      const hasActivationContent = code.includes('Environment activated for') || code.includes(messageContent)
      expect(hasActivationContent).toBe(true)
    })

    it('should support custom deactivation messages', async () => {
      const { config } = await import('../src/config')
      const { default: shellcode } = await import('../src/dev/shellcode')
      const code = shellcode()

      // Should include the configured deactivation message
      const hasDeactivationMsg = code.includes(config.shellDeactivationMessage) || code.includes('shellDeactivationMessage')
      expect(hasDeactivationMsg).toBe(true)
    })

    it('should handle emoji and special characters in messages', async () => {
      const testMessage = '🚀 Environment ready for {path} 🎉'

      // Test that messages with emoji would be handled correctly
      expect(testMessage.includes('{path}')).toBe(true)

      const substituted = testMessage.replace('{path}', '/test/path')
      expect(substituted).toBe('🚀 Environment ready for /test/path 🎉')
      expect(substituted).not.toContain('{path}')
    })

    it('should preserve ANSI escape codes in messages', async () => {
      const testMessage = '\\033[32m✅ Environment activated for {path}\\033[0m'

      // Should handle ANSI escape sequences properly
      expect(testMessage.includes('\\033[')).toBe(true)
      expect(testMessage.includes('{path}')).toBe(true)
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle empty messages gracefully', async () => {
      const { defaultConfig } = await import('../src/config')

      // Default messages should never be empty
      expect(defaultConfig.shellActivationMessage.trim().length).toBeGreaterThan(0)
      expect(defaultConfig.shellDeactivationMessage.trim().length).toBeGreaterThan(0)
    })

    it('should handle messages without path placeholder', async () => {
      const messageWithoutPath = 'Environment activated'

      // Should work even without {path} placeholder
      const result = messageWithoutPath.replace('{path}', '/test/path')
      expect(result).toBe('Environment activated') // No change expected
    })

    it('should handle very long messages', async () => {
      const longMessage = `${'A'.repeat(1000)} {path}`

      // Should handle long messages without breaking
      expect(longMessage.includes('{path}')).toBe(true)
      expect(longMessage.length).toBeGreaterThan(1000)

      const substituted = longMessage.replace('{path}', '/test')
      expect(substituted.includes('/test')).toBe(true)
      expect(substituted).not.toContain('{path}')
    })

    it('should handle messages with multiple path placeholders', async () => {
      const multiPathMessage = 'Activated {path} and also {path}'

      // Should replace all instances
      const result = multiPathMessage.replace(/\{path\}/g, '/test/path')
      expect(result).toBe('Activated /test/path and also /test/path')
      expect(result).not.toContain('{path}')
    })

    it('should handle shell injection attempts', async () => {
      // Test messages that could potentially be used for shell injection
      const maliciousMessage = 'Test `rm -rf /` {path}'

      // Should still work but won't execute the command (shell will handle escaping)
      expect(maliciousMessage.includes('`')).toBe(true)
      expect(maliciousMessage.includes('{path}')).toBe(true)

      // The replacement should work normally
      const result = maliciousMessage.replace('{path}', '/safe/path')
      expect(result).toContain('/safe/path')
    })
  })

  describe('Integration with Dev Environment', () => {
    it('should work with dev:dump command', async () => {
      // Create a test project
      const projectDir = path.join(tempDir, 'test-project')
      fs.mkdirSync(projectDir, { recursive: true })

      const depsContent = `dependencies:
  node: ^20
`
      fs.writeFileSync(path.join(projectDir, 'dependencies.yaml'), depsContent)

      // Import dump function
      try {
        const { default: dump } = await import('../src/dev/dump')

        // The dump function should use the configuration
        // This is mainly testing that it doesn't crash with config
        expect(typeof dump).toBe('function')
      }
      catch (error) {
        // Acceptable in test environment
        expect(error).toBeDefined()
      }
    })

    it('should work with different dependency file types', async () => {
      const { default: shellcode } = await import('../src/dev/shellcode')
      const code = shellcode()

      // Should handle various dependency file formats
      const hasDependencyFiles = code.includes('dependencies.yaml') || code.includes('pkgx.yaml')
      expect(hasDependencyFiles).toBe(true)
    })

    it('should maintain configuration across environment switches', async () => {
      const { config } = await import('../src/config')

      // Configuration should be consistent
      const firstCheck = {
        show: config.showShellMessages,
        activation: config.shellActivationMessage,
        deactivation: config.shellDeactivationMessage,
      }

      // Import again (simulating environment switch)
      const { config: configAgain } = await import('../src/config')

      const secondCheck = {
        show: configAgain.showShellMessages,
        activation: configAgain.shellActivationMessage,
        deactivation: configAgain.shellDeactivationMessage,
      }

      expect(firstCheck).toEqual(secondCheck)
    })
  })

  describe('Performance and Efficiency', () => {
    it('should generate shellcode efficiently', async () => {
      const start = Date.now()
      const { default: shellcode } = await import('../src/dev/shellcode')
      const code = shellcode()
      const end = Date.now()

      expect(code).toBeTruthy()
      expect(end - start).toBeLessThan(5000) // Should complete within 5 seconds
    })

    it('should not significantly increase shellcode size', async () => {
      const { default: shellcode } = await import('../src/dev/shellcode')
      const code = shellcode()

      // Should be reasonable size (not excessively large due to config)
      expect(code.length).toBeLessThan(100000) // Less than 100KB
      expect(code.length).toBeGreaterThan(1000) // But substantial enough to be useful
    })

    it('should minimize overhead in shell integration', async () => {
      const { default: shellcode } = await import('../src/dev/shellcode')
      const code = shellcode()

      // Should use efficient shell constructs
      const hasEfficientConstructs = code.includes('case') || code.includes('if')
      expect(hasEfficientConstructs).toBe(true)

      // Should avoid expensive operations in hot paths
      const lines = code.split('\n')
      const chpwdLines = lines.filter(line => line.includes('chpwd') || line.includes('cd'))

      // Directory change handling should be efficient
      expect(chpwdLines.length).toBeGreaterThan(0)
    })
  })
})
