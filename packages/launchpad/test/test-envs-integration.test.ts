import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import sniff from '../src/dev/sniff'

describe('Test Environments Integration', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-test-envs-'))
  })

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  // Helper function to copy test environment
  const copyTestEnv = (envName: string): string => {
    const sourceDir = path.join(process.cwd(), '../../test-envs', envName)
    const targetDir = path.join(tempDir, envName)

    if (!fs.existsSync(sourceDir)) {
      throw new Error(`Test environment ${envName} not found at ${sourceDir}`)
    }

    fs.mkdirSync(targetDir, { recursive: true })

    // Copy all possible dependency files
    const possibleFiles = ['dependencies.yaml', 'deps.yaml', 'deps.yml', 'pkgx.yaml']
    for (const fileName of possibleFiles) {
      const sourceFile = path.join(sourceDir, fileName)
      if (fs.existsSync(sourceFile)) {
        fs.copyFileSync(sourceFile, path.join(targetDir, fileName))
      }
    }

    return targetDir
  }

  describe('Global Installation Tests', () => {
    it('global-all: should install all packages globally with top-level flag', async () => {
      const envDir = copyTestEnv('global-all')
      const result = await sniff({ string: envDir })

      expect(result.pkgs).toHaveLength(4)

      // All packages should have global: true
      for (const pkg of result.pkgs) {
        expect(pkg.global).toBe(true)
      }

      // Verify specific packages
      const packages = result.pkgs.map(p => p.project)
      expect(packages).toContain('node')
      expect(packages).toContain('python')
      expect(packages).toContain('git')
      expect(packages).toContain('bun')
    })

    it('simple-global-string: should handle simple array format with global flag', async () => {
      const envDir = copyTestEnv('simple-global-string')
      const result = await sniff({ string: envDir })

      expect(result.pkgs).toHaveLength(3)

      // All packages should have global: true
      for (const pkg of result.pkgs) {
        expect(pkg.global).toBe(true)
      }
    })

    it('dev-machine-setup: should install comprehensive dev tools globally', async () => {
      const envDir = copyTestEnv('dev-machine-setup')
      const result = await sniff({ string: envDir })

      expect(result.pkgs.length).toBeGreaterThan(5)

      // All packages should have global: true
      for (const pkg of result.pkgs) {
        expect(pkg.global).toBe(true)
      }

      // Should include core development tools
      const packages = result.pkgs.map(p => p.project)
      expect(packages).toContain('node')
      expect(packages).toContain('python')
      expect(packages).toContain('go')
      expect(packages).toContain('bun')
    })
  })

  describe('Mixed Global/Local Tests', () => {
    it('mixed-global-local: should handle top-level global with individual overrides', async () => {
      const envDir = copyTestEnv('mixed-global-local')
      const result = await sniff({ string: envDir })

      expect(result.pkgs).toHaveLength(4)

      // bun.sh should be global (uses top-level)
      const bunPkg = result.pkgs.find(p => p.project === 'bun.sh')
      expect(bunPkg).toBeDefined()
      expect(bunPkg!.global).toBe(true)
      expect(bunPkg!.constraint.toString()).toBe('1.2.3')

      // python.org should be local (overrides top-level)
      const pythonPkg = result.pkgs.find(p => p.project === 'python.org')
      expect(pythonPkg).toBeDefined()
      expect(pythonPkg!.global).toBe(false)
      expect(pythonPkg!.constraint.toString()).toBe('^3.11')

      // node@22 should be global (uses top-level)
      const nodePkg = result.pkgs.find(p => p.project === 'node@22')
      expect(nodePkg).toBeDefined()
      expect(nodePkg!.global).toBe(true)

      // git@2.42 should be global (uses top-level)
      const gitPkg = result.pkgs.find(p => p.project === 'git@2.42')
      expect(gitPkg).toBeDefined()
      expect(gitPkg!.global).toBe(true)
    })

    it('team-standard: should handle individual global flags without top-level', async () => {
      const envDir = copyTestEnv('team-standard')
      const result = await sniff({ string: envDir })

      expect(result.pkgs.length).toBeGreaterThan(5)

      // Global shared tools
      const globalPkgs = result.pkgs.filter(p => p.global === true)
      const localPkgs = result.pkgs.filter(p => p.global === false)

      expect(globalPkgs.length).toBeGreaterThan(0)
      expect(localPkgs.length).toBeGreaterThan(0)

      // Verify specific packages
      const nodePkg = result.pkgs.find(p => p.project === 'node@22')
      expect(nodePkg?.global).toBe(true)

      const typescriptPkg = result.pkgs.find(p => p.project === 'typescript@5.0')
      expect(typescriptPkg?.global).toBe(false)
    })

    it('fullstack-mixed: should handle complex fullstack development setup', async () => {
      const envDir = copyTestEnv('fullstack-mixed')
      const result = await sniff({ string: envDir })

      expect(result.pkgs.length).toBeGreaterThan(8)

      // Core runtimes should be global
      const nodePkg = result.pkgs.find(p => p.project === 'node@22')
      expect(nodePkg?.global).toBe(true)

      const pythonPkg = result.pkgs.find(p => p.project === 'python@3.12')
      expect(pythonPkg?.global).toBe(true)

      // Project tools should be local
      const typescriptPkg = result.pkgs.find(p => p.project === 'typescript@5.0')
      expect(typescriptPkg?.global).toBe(false)

      const jestPkg = result.pkgs.find(p => p.project === 'jest@29.0')
      expect(jestPkg?.global).toBe(false)
    })
  })

  describe('Override Scenario Tests', () => {
    it('override-scenarios: should handle various override patterns correctly', async () => {
      const envDir = copyTestEnv('override-scenarios')
      const result = await sniff({ string: envDir })

      expect(result.pkgs.length).toBeGreaterThan(5)

      // String format packages with top-level global: true
      const nodePkg = result.pkgs.find(p => p.project === 'node@22')
      expect(nodePkg?.global).toBe(true)

      // Explicit global: false override
      const typescriptPkg = result.pkgs.find(p => p.project === 'typescript@5.0')
      expect(typescriptPkg?.global).toBe(false)

      const eslintPkg = result.pkgs.find(p => p.project === 'eslint@8.50')
      expect(eslintPkg?.global).toBe(false)

      // Object format without explicit global (uses top-level)
      const bunPkg = result.pkgs.find(p => p.project === 'bun@1.2.3')
      expect(bunPkg?.global).toBe(true)
    })

    it('global-false-override: should handle top-level false with selective overrides', async () => {
      const envDir = copyTestEnv('global-false-override')
      const result = await sniff({ string: envDir })

      expect(result.pkgs.length).toBeGreaterThan(3)

      // String format with top-level global: false (should not have global property)
      const nodePkg = result.pkgs.find(p => p.project === 'node@22')
      expect(nodePkg?.global).toBeUndefined()

      const typescriptPkg = result.pkgs.find(p => p.project === 'typescript@5.0')
      expect(typescriptPkg?.global).toBeUndefined()

      // Explicit global: true overrides
      const pythonPkg = result.pkgs.find(p => p.project === 'python@3.12')
      expect(pythonPkg?.global).toBe(true)

      const gitPkg = result.pkgs.find(p => p.project === 'git@2.42')
      expect(gitPkg?.global).toBe(true)

      // Explicit global: false (same as top-level)
      const eslintPkg = result.pkgs.find(p => p.project === 'eslint@8.50')
      expect(eslintPkg?.global).toBe(false)
    })

    it('individual-global-flags: should handle per-package flags without top-level', async () => {
      const envDir = copyTestEnv('individual-global-flags')
      const result = await sniff({ string: envDir })

      expect(result.pkgs.length).toBeGreaterThan(3)

      // Packages with explicit global: true
      const nodePkg = result.pkgs.find(p => p.project === 'node@22')
      expect(nodePkg?.global).toBe(true)

      const pythonPkg = result.pkgs.find(p => p.project === 'python@3.12')
      expect(pythonPkg?.global).toBe(true)

      // Package with explicit global: false
      const typescriptPkg = result.pkgs.find(p => p.project === 'typescript@5.0')
      expect(typescriptPkg?.global).toBe(false)

      // String format packages (no global property)
      const eslintPkg = result.pkgs.find(p => p.project === 'eslint@8.50')
      expect(eslintPkg?.global).toBeUndefined()
    })
  })

  describe('Default Behavior Tests', () => {
    it('no-global-flag: should default to local installation', async () => {
      const envDir = copyTestEnv('no-global-flag')
      const result = await sniff({ string: envDir })

      expect(result.pkgs).toHaveLength(3)

      // All packages should not have global property (defaults to local)
      for (const pkg of result.pkgs) {
        expect(pkg.global).toBeUndefined()
      }

      // Verify specific packages
      const packages = result.pkgs.map(p => p.project)
      expect(packages).toContain('node@22')
      expect(packages).toContain('python@3.12')
      expect(packages).toContain('typescript@5.0')
    })
  })

  describe('Existing Test Environments', () => {
    it('complex-deps: should handle complex dependency configuration', async () => {
      const envDir = copyTestEnv('complex-deps')
      const result = await sniff({ string: envDir })

      expect(result.pkgs.length).toBeGreaterThan(3)

      // Should include various development tools
      const packages = result.pkgs.map(p => p.project)
      expect(packages).toContain('nodejs.org')
      expect(packages).toContain('python.org')
    })

    it('working-test: should handle known working packages', async () => {
      const envDir = copyTestEnv('working-test')
      const result = await sniff({ string: envDir })

      expect(result.pkgs.length).toBeGreaterThan(2)

      // Should include reliable packages
      const packages = result.pkgs.map(p => p.project)
      expect(packages).toContain('python.org')
    })

    it('minimal: should handle minimal configuration', async () => {
      const envDir = copyTestEnv('minimal')
      const result = await sniff({ string: envDir })

      // Should detect packages from pkgx.yaml
      expect(result.pkgs.length).toBe(1)
      expect(result.pkgs[0].project).toBe('gnu.org/wget')
    })

    it('python-focused: should handle Python-specific dependencies', async () => {
      const envDir = copyTestEnv('python-focused')
      const result = await sniff({ string: envDir })

      expect(result.pkgs.length).toBe(3)

      // Should include Python and related services
      const packages = result.pkgs.map(p => p.project)
      expect(packages).toContain('python.org')
      expect(packages).toContain('postgresql.org')
      expect(packages).toContain('redis.io')
    })

    it('dummy: should handle basic test environment', async () => {
      const envDir = copyTestEnv('dummy')
      const result = await sniff({ string: envDir })

      expect(result.pkgs.length).toBe(1)
      expect(result.pkgs[0].project).toBe('nginx.org')
    })

    it('test-isolation: should handle environment isolation testing', async () => {
      const envDir = copyTestEnv('test-isolation')
      const result = await sniff({ string: envDir })

      expect(result.pkgs.length).toBe(2)
      const packages = result.pkgs.map(p => p.project)
      expect(packages).toContain('fake.com')
      expect(packages).toContain('nonexistent.org')
    })
  })

  describe('Environment Variables and Metadata', () => {
    it('should parse environment variables from test environments', async () => {
      const envDir = copyTestEnv('mixed-global-local')
      const result = await sniff({ string: envDir })

      expect(result.env).toBeDefined()
      expect(result.env.NODE_ENV).toBe('development')
      expect(result.env.PROJECT_TYPE).toBe('mixed-global-local')
      expect(result.env.DESCRIPTION).toBe('Mix of global and local packages with override')
    })

    it('should handle complex environment configurations', async () => {
      const envDir = copyTestEnv('fullstack-mixed')
      const result = await sniff({ string: envDir })

      expect(result.env).toBeDefined()
      expect(result.env.NODE_ENV).toBe('development')
      expect(result.env.PYTHON_ENV).toBe('development')
      expect(result.env.DATABASE_URL).toContain('postgresql')
      expect(result.env.REDIS_URL).toContain('redis')
      expect(result.env.API_PORT).toBe('3001')
      expect(result.env.FRONTEND_PORT).toBe('3000')
    })
  })

  describe('Global Flag Precedence Validation', () => {
    it('should validate precedence: individual > top-level > default', async () => {
      // Test with mixed-global-local which has all three scenarios
      const envDir = copyTestEnv('mixed-global-local')
      const result = await sniff({ string: envDir })

      // Individual global: false overrides top-level global: true
      const pythonPkg = result.pkgs.find(p => p.project === 'python.org')
      expect(pythonPkg?.global).toBe(false) // Individual override

      // Top-level global: true applies when no individual flag
      const bunPkg = result.pkgs.find(p => p.project === 'bun.sh')
      expect(bunPkg?.global).toBe(true) // Top-level setting

      // String format uses top-level global: true
      const nodePkg = result.pkgs.find(p => p.project === 'node@22')
      expect(nodePkg?.global).toBe(true) // Top-level setting
    })

    it('should validate all precedence combinations', async () => {
      // Test global-false-override for reverse precedence
      const envDir = copyTestEnv('global-false-override')
      const result = await sniff({ string: envDir })

      // Individual global: true overrides top-level global: false
      const pythonPkg = result.pkgs.find(p => p.project === 'python@3.12')
      expect(pythonPkg?.global).toBe(true) // Individual override

      // Top-level global: false applies when no individual flag
      const nodePkg = result.pkgs.find(p => p.project === 'node@22')
      expect(nodePkg?.global).toBeUndefined() // Top-level false (no global property)

      // Individual global: false explicit (same as top-level)
      const eslintPkg = result.pkgs.find(p => p.project === 'eslint@8.50')
      expect(eslintPkg?.global).toBe(false) // Explicit false
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing test environment gracefully', async () => {
      expect(() => copyTestEnv('nonexistent-env')).toThrow()
    })

    it('should handle empty dependencies gracefully', async () => {
      // Create a test environment with empty dependencies
      const envDir = path.join(tempDir, 'empty-deps')
      fs.mkdirSync(envDir, { recursive: true })
      fs.writeFileSync(path.join(envDir, 'dependencies.yaml'), 'dependencies:\nenv:\n  NODE_ENV: test')

      const result = await sniff({ string: envDir })
      expect(result.pkgs).toHaveLength(0)
      expect(result.env).toBeDefined()
      expect(result.env.NODE_ENV).toBe('test')
    })

    it('should handle malformed YAML gracefully', async () => {
      const envDir = path.join(tempDir, 'malformed')
      fs.mkdirSync(envDir, { recursive: true })
      fs.writeFileSync(path.join(envDir, 'dependencies.yaml'), 'invalid: yaml: content:')

      const result = await sniff({ string: envDir })
      // Should not crash, may return empty or partial results
      expect(result).toBeDefined()
      expect(result.pkgs).toBeDefined()
      expect(result.env).toBeDefined()
    })
  })

  describe('Performance and Consistency', () => {
    it('should parse all test environments within reasonable time', async () => {
      const startTime = Date.now()

      const envNames = [
        'global-all',
        'mixed-global-local',
        'individual-global-flags',
        'team-standard',
        'fullstack-mixed',
        'override-scenarios',
        'global-false-override',
        'no-global-flag',
      ]

      for (const envName of envNames) {
        const envDir = copyTestEnv(envName)
        await sniff({ string: envDir })
      }

      const duration = Date.now() - startTime
      expect(duration).toBeLessThan(5000) // Should complete within 5 seconds
    })

    it('should produce consistent results across multiple runs', async () => {
      const envDir = copyTestEnv('mixed-global-local')

      const result1 = await sniff({ string: envDir })
      const result2 = await sniff({ string: envDir })

      expect(result1.pkgs).toHaveLength(result2.pkgs.length)
      expect(result1.pkgs.map(p => p.project).sort()).toEqual(
        result2.pkgs.map(p => p.project).sort(),
      )

      // Verify global flags are consistent
      for (const pkg1 of result1.pkgs) {
        const pkg2 = result2.pkgs.find(p => p.project === pkg1.project)
        expect(pkg2).toBeDefined()
        if (pkg2) {
          // Compare global flags (handling undefined values)
          expect(pkg1.global === pkg2.global).toBe(true)
        }
      }
    })
  })
})
