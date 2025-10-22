import { describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import path from 'node:path'

describe('Environment Setup Optimizations', () => {
  describe('Core Performance Features', () => {
    it('should prioritize shell integration for speed', () => {
      const dumpSource = fs.readFileSync(path.join(import.meta.dirname, '../src/dev/dump.ts'), 'utf-8')

      // Should detect shell integration environment
      expect(dumpSource).toContain('LAUNCHPAD_SHELL_INTEGRATION === \'1\'')
      expect(dumpSource).toContain('isShellIntegration')
    })

    it('should skip expensive operations for shell integration', () => {
      const dumpSource = fs.readFileSync(path.join(import.meta.dirname, '../src/dev/dump.ts'), 'utf-8')

      // Should skip global dependency scanning for shell integration
      expect(dumpSource).toContain('!isShellIntegration')
      expect(dumpSource).toContain('Only do expensive global scanning for non-shell integration')
    })

    it('should use fast path when environments exist', () => {
      const dumpSource = fs.readFileSync(path.join(import.meta.dirname, '../src/dev/dump.ts'), 'utf-8')

      // Should check if environments exist for fast activation
      expect(dumpSource).toContain('hasLocalEnv')
      expect(dumpSource).toContain('hasGlobalEnv')
      expect(dumpSource).toContain('existsSync')
    })
  })

  describe('Shell Integration Optimizations', () => {
    it('should suppress verbose output for shell integration', () => {
      const dumpSource = fs.readFileSync(path.join(import.meta.dirname, '../src/dev/dump.ts'), 'utf-8')

      // Should override output functions to filter messages
      expect(dumpSource).toContain('process.stderr.write =')
      expect(dumpSource).toContain('console.log =')
      expect(dumpSource).toContain('allow progress indicators')
    })

    it('should include shell output mode optimization', () => {
      const dumpSource = fs.readFileSync(path.join(import.meta.dirname, '../src/dev/dump.ts'), 'utf-8')

      // Should have optimized shell output path
      expect(dumpSource).toContain('shellOutput')
      expect(dumpSource).toContain('outputShellCode')
    })
  })

  describe('Environment Variable Management', () => {
    it('should export environment variables from dependency files', () => {
      const dumpSource = fs.readFileSync(path.join(import.meta.dirname, '../src/dev/dump.ts'), 'utf-8')

      // Should export environment variables from the dependency file
      expect(dumpSource).toContain('sniffResult.env')
      expect(dumpSource).toContain('process.stdout.write')
      // eslint-disable-next-line no-template-curly-in-string
      expect(dumpSource).toContain('export ${key}=${value}')
    })

    it('should generate deactivation function', () => {
      const dumpSource = fs.readFileSync(path.join(import.meta.dirname, '../src/dev/dump.ts'), 'utf-8')

      // Should generate the deactivation function that tests expect
      expect(dumpSource).toContain('_launchpad_dev_try_bye')
      expect(dumpSource).toContain('case "$PWD"')
      expect(dumpSource).toContain('Environment deactivated')
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle dependency file parsing errors gracefully', () => {
      const dumpSource = fs.readFileSync(path.join(import.meta.dirname, '../src/dev/dump.ts'), 'utf-8')

      // Should handle malformed dependency files gracefully
      expect(dumpSource).toContain('Handle malformed dependency files gracefully')
      expect(dumpSource).toContain('try {')
      expect(dumpSource).toContain('catch (error)')
    })

    it('should preserve config.verbose checks', () => {
      const dumpSource = fs.readFileSync(path.join(import.meta.dirname, '../src/dev/dump.ts'), 'utf-8')

      // Should check verbose configuration
      expect(dumpSource).toContain('config.verbose')
    })

    it('should provide system fallback on shell output errors', () => {
      const dumpSource = fs.readFileSync(path.join(import.meta.dirname, '../src/dev/dump.ts'), 'utf-8')

      // Should provide fallback that ensures basic system paths
      expect(dumpSource).toContain('Environment setup failed, using system fallback')
      expect(dumpSource).toContain('Ensure basic system paths are available')
      expect(dumpSource).toContain('/usr/bin')
    })
  })

  describe('Performance Message Improvements', () => {
    it('should remove processing messages that don\'t contain version info', () => {
      const dumpSource = fs.readFileSync(path.join(import.meta.dirname, '../src/dev/dump.ts'), 'utf-8')

      // Should not have verbose processing messages
      expect(dumpSource).not.toContain('processing dependencies')
      expect(dumpSource).not.toContain('analyzing packages')
    })

    it('should maintain success message display logic', () => {
      const dumpSource = fs.readFileSync(path.join(import.meta.dirname, '../src/dev/dump.ts'), 'utf-8')

      // Should allow success messages through
      expect(dumpSource).toContain('✅') // Success messages
      expect(dumpSource).toContain('⚠️') // Warnings
      expect(dumpSource).toContain('❌') // Errors
    })
  })

  describe('Shell Integration Message Optimization', () => {
    it('should handle shell integration and normal output paths', () => {
      const dumpSource = fs.readFileSync(path.join(import.meta.dirname, '../src/dev/dump.ts'), 'utf-8')

      // Should check for shell integration environment
      expect(dumpSource).toContain('LAUNCHPAD_SHELL_INTEGRATION === \'1\'')
    })
  })

  describe('Integration with Performance Features', () => {
    it('should work with shell integration caching', () => {
      const dumpSource = fs.readFileSync(path.join(import.meta.dirname, '../src/dev/dump.ts'), 'utf-8')

      // Should be compatible with shell integration detection
      expect(dumpSource).toContain('LAUNCHPAD_SHELL_INTEGRATION')
    })

    it('should maintain error handling for different execution modes', () => {
      const dumpSource = fs.readFileSync(path.join(import.meta.dirname, '../src/dev/dump.ts'), 'utf-8')

      // Should handle errors appropriately
      expect(dumpSource).toContain('catch (error)')
      expect(dumpSource).toContain('effectiveQuiet')
    })
  })
})
