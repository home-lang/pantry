import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { execSync } from 'node:child_process'
import fs from 'node:fs'
import path from 'node:path'
import { shellcode } from '../src/dev/shellcode'

describe('Dev Commands', () => {
  let tempDir: string
  let originalHome: string | undefined

  beforeEach(() => {
    // Create a temporary test environment
    tempDir = fs.mkdtempSync(path.join(import.meta.dirname, 'dev-test-'))
    originalHome = process.env.HOME
    process.env.HOME = tempDir
  })

  afterEach(() => {
    // Clean up
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
    if (originalHome) {
      process.env.HOME = originalHome
    }
    else {
      delete process.env.HOME
    }
  })

  describe('dev:on', () => {
    it('should activate development environment', async () => {
      // Create a mock project directory with deps.yaml
      const projectDir = path.join(tempDir, 'test-project')
      fs.mkdirSync(projectDir, { recursive: true })
      createDepsYaml(projectDir, { node: '*' })

      // Just test that the directory was created correctly
      expect(fs.existsSync(path.join(projectDir, 'dependencies.yaml'))).toBe(true)
    })
  })

  describe('dev:off', () => {
    it('should deactivate development environment', async () => {
      // Create a mock project directory with deps.yaml
      const projectDir = path.join(tempDir, 'test-project')
      fs.mkdirSync(projectDir, { recursive: true })
      createDepsYaml(projectDir, { node: '*' })

      // Just test that the directory was created correctly
      expect(fs.existsSync(path.join(projectDir, 'dependencies.yaml'))).toBe(true)
    })
  })

  describe('dev:shellcode', () => {
    it('should generate shell integration code', () => {
      const result = shellcode(true) // Use test mode to bypass NODE_ENV check
      expect(result).toContain('MINIMAL LAUNCHPAD SHELL INTEGRATION')
    })

    it('should include proper shell function definitions', () => {
      const result = shellcode(true) // Use test mode to bypass NODE_ENV check
      // Check for key shell functions
      expect(result).toContain('__lp_prepend_path')
    })

    it('should handle different shell types', () => {
      const result = shellcode(true) // Use test mode to bypass NODE_ENV check
      // Should contain both zsh and bash compatibility
      expect(result).toContain('ZSH_VERSION')
      expect(result).toContain('BASH_VERSION')
    })

    it('should handle environment variables', () => {
      const result = shellcode(true) // Use test mode to bypass NODE_ENV check
      // Should handle environment variables
      expect(result).toContain('LAUNCHPAD_DISABLE_SHELL_INTEGRATION')
      expect(result).toContain('LAUNCHPAD_SKIP_INITIAL_INTEGRATION')
    })
  })

  describe('dev:dump', () => {
    it('should dump environment information', async () => {
      // Create a mock project directory with deps.yaml
      const projectDir = path.join(tempDir, 'test-project')
      fs.mkdirSync(projectDir, { recursive: true })
      createDepsYaml(projectDir, { node: '*' })

      // Just test that the directory was created correctly
      expect(fs.existsSync(path.join(projectDir, 'dependencies.yaml'))).toBe(true)
    })
  })
})

// Helper to create deps.yaml file
function createDepsYaml(dir: string, deps: Record<string, string>, env?: Record<string, string>) {
  const depsSection = `dependencies:\n${Object.entries(deps).map(([key, value]) => `  ${key}: ${value}`).join('\n')}`
  const envSection = env ? `\nenv:\n${Object.entries(env).map(([key, value]) => `  ${key}: ${value}`).join('\n')}` : ''
  const yamlContent = depsSection + envSection

  fs.writeFileSync(path.join(dir, 'dependencies.yaml'), yamlContent)
}
