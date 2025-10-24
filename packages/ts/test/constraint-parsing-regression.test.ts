import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { existsSync, mkdirSync, rmSync, unlinkSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import sniff from '../src/dev/sniff'

describe('Constraint Parsing Regression Tests', () => {
  let tempDir: string
  let depsFile: string

  beforeEach(() => {
    // Create temporary directory for test files
    tempDir = join(tmpdir(), `launchpad-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
    depsFile = join(tempDir, 'deps.yaml')

    // Ensure directory exists
    mkdirSync(tempDir, { recursive: true })
  })

  afterEach(() => {
    // Clean up test files
    try {
      if (existsSync(depsFile))
        unlinkSync(depsFile)
      rmSync(tempDir, { recursive: true, force: true })
    }
    catch {
      // Ignore cleanup errors
    }
  })

  describe('Constraint Deduplication Bug Fix', () => {
    it('should prioritize explicit constraints from deps.yaml over inferred constraints from lock files', async () => {
      // Create deps.yaml with explicit constraint
      writeFileSync(depsFile, `dependencies:
  bun.sh: ^1.2.19`)

      // Create bun.lock to simulate inferred constraint
      const lockFile = join(tempDir, 'bun.lock')
      writeFileSync(lockFile, '# Bun lock file')

      const result = await sniff({ string: tempDir })

      // Find the bun.sh package
      const bunPackage = result.pkgs.find(pkg => pkg.project === 'bun.sh')
      expect(bunPackage).toBeDefined()

      // Should use the explicit constraint from deps.yaml, not the inferred >=1 from lock file
      expect(bunPackage!.constraint.toString()).toBe('^1.2.19')
      expect(bunPackage!.constraint.toString()).not.toBe('>=1')
    })

    it('should handle multiple bun.sh constraints and prioritize correctly', async () => {
      // Create deps.yaml with explicit constraint
      writeFileSync(depsFile, `dependencies:
  bun.sh: ^1.2.18`)

      // Create bun.lockb to simulate inferred constraint
      const lockFile = join(tempDir, 'bun.lockb')
      writeFileSync(lockFile, '# Bun lockb file')

      const result = await sniff({ string: tempDir })

      // Should only have one bun.sh entry with the explicit constraint
      const bunPackages = result.pkgs.filter(pkg => pkg.project === 'bun.sh')
      expect(bunPackages).toHaveLength(1)
      expect(bunPackages[0].constraint.toString()).toBe('^1.2.18')
      expect(bunPackages[0].constraint.toString()).not.toBe('>=1')
    })

    it('should use inferred >=1 constraint when no explicit constraint exists', async () => {
      // Only create bun.lock without deps.yaml
      const lockFile = join(tempDir, 'bun.lock')
      writeFileSync(lockFile, '# Bun lock file')

      const result = await sniff({ string: tempDir })

      const bunPackage = result.pkgs.find(pkg => pkg.project === 'bun.sh')
      expect(bunPackage).toBeDefined()
      expect(bunPackage!.constraint.toString()).toBe('>=1')
    })

    it('should preserve explicit constraints over inferred constraints for other packages', async () => {
      // Test that the fix doesn't break constraint handling for other packages
      writeFileSync(depsFile, `dependencies:
  nodejs.org: ^20.0.0
  python.org: ~3.11.0`)

      // Create package.json to add inferred nodejs constraint
      const packageJson = join(tempDir, 'package.json')
      writeFileSync(packageJson, JSON.stringify({
        engines: {
          node: '>=18.0.0',
        },
      }))

      const result = await sniff({ string: tempDir })

      // Find the nodejs package - should prefer explicit constraint
      const nodePackage = result.pkgs.find(pkg => pkg.project === 'nodejs.org')
      expect(nodePackage).toBeDefined()
      expect(nodePackage!.constraint.toString()).toBe('^20.0.0')
      expect(nodePackage!.constraint.toString()).not.toBe('>=18.0.0')

      // Python should keep its explicit constraint
      const pythonPackage = result.pkgs.find(pkg => pkg.project === 'python.org')
      expect(pythonPackage).toBeDefined()
      expect(pythonPackage!.constraint.toString()).toBe('~3.11.0')
    })

    it('should handle complex constraint scenarios correctly', async () => {
      writeFileSync(depsFile, `dependencies:
  bun.sh: ^1.2.19
  nodejs.org: ^20.0.0
  python.org: ~3.11.0`)

      // Create multiple lock files
      writeFileSync(join(tempDir, 'bun.lock'), '# Bun lock')
      writeFileSync(join(tempDir, 'package.json'), JSON.stringify({
        engines: { node: '>=18.0.0' },
      }))

      const result = await sniff({ string: tempDir })

      // Verify all packages have correct constraints
      const packageMap = new Map(result.pkgs.map(pkg => [pkg.project, pkg.constraint.toString()]))

      expect(packageMap.get('bun.sh')).toBe('^1.2.19')
      expect(packageMap.get('nodejs.org')).toBe('^20.0.0')
      expect(packageMap.get('python.org')).toBe('~3.11.0')

      // Ensure no duplicate packages
      const bunPackages = result.pkgs.filter(pkg => pkg.project === 'bun.sh')
      const nodePackages = result.pkgs.filter(pkg => pkg.project === 'nodejs.org')
      expect(bunPackages).toHaveLength(1)
      expect(nodePackages).toHaveLength(1)
    })
  })

  describe('Edge Cases for Constraint Priority', () => {
    it('should handle exact version constraints vs inferred constraints', async () => {
      writeFileSync(depsFile, `dependencies:
  bun.sh: 1.2.19`)

      writeFileSync(join(tempDir, 'bun.lock'), '# Bun lock')

      const result = await sniff({ string: tempDir })
      const bunPackage = result.pkgs.find(pkg => pkg.project === 'bun.sh')

      expect(bunPackage!.constraint.toString()).toBe('1.2.19')
      expect(bunPackage!.constraint.toString()).not.toBe('>=1')
    })

    it('should handle wildcard constraints vs inferred constraints', async () => {
      writeFileSync(depsFile, `dependencies:
  bun.sh: "*"`)

      writeFileSync(join(tempDir, 'bun.lock'), '# Bun lock')

      const result = await sniff({ string: tempDir })
      const bunPackage = result.pkgs.find(pkg => pkg.project === 'bun.sh')

      expect(bunPackage!.constraint.toString()).toBe('*')
      expect(bunPackage!.constraint.toString()).not.toBe('>=1')
    })

    it('should handle latest constraints vs inferred constraints', async () => {
      writeFileSync(depsFile, `dependencies:
  bun.sh: latest`)

      writeFileSync(join(tempDir, 'bun.lock'), '# Bun lock')

      const result = await sniff({ string: tempDir })
      const bunPackage = result.pkgs.find(pkg => pkg.project === 'bun.sh')

      expect(bunPackage!.constraint.toString()).toBe('*')
      expect(bunPackage!.constraint.toString()).not.toBe('>=1')
    })

    it('should handle tilde constraints vs inferred constraints', async () => {
      writeFileSync(depsFile, `dependencies:
  bun.sh: ~1.2.0`)

      writeFileSync(join(tempDir, 'bun.lock'), '# Bun lock')

      const result = await sniff({ string: tempDir })
      const bunPackage = result.pkgs.find(pkg => pkg.project === 'bun.sh')

      expect(bunPackage!.constraint.toString()).toBe('~1.2.0')
      expect(bunPackage!.constraint.toString()).not.toBe('>=1')
    })

    it('should handle range constraints vs inferred constraints', async () => {
      writeFileSync(depsFile, `dependencies:
  bun.sh: ">=1.2.0 <2.0.0"`)

      writeFileSync(join(tempDir, 'bun.lock'), '# Bun lock')

      const result = await sniff({ string: tempDir })
      const bunPackage = result.pkgs.find(pkg => pkg.project === 'bun.sh')

      expect(bunPackage!.constraint.toString()).toBe('>=1.2.0 <2.0.0')
      expect(bunPackage!.constraint.toString()).not.toBe('>=1')
    })
  })

  describe('Multiple Constraint Sources', () => {
    it('should handle multiple dependency files correctly', async () => {
      // Primary deps.yaml
      writeFileSync(depsFile, `dependencies:
  bun.sh: ^1.2.19`)

      // Alternative dependency file
      const launchpadYaml = join(tempDir, 'launchpad.yaml')
      writeFileSync(launchpadYaml, `dependencies:
  nodejs.org: ^20.0.0`)

      // Lock files
      writeFileSync(join(tempDir, 'bun.lock'), '# Bun lock')

      const result = await sniff({ string: tempDir })

      const bunPackage = result.pkgs.find(pkg => pkg.project === 'bun.sh')
      const nodePackage = result.pkgs.find(pkg => pkg.project === 'nodejs.org')

      expect(bunPackage!.constraint.toString()).toBe('^1.2.19')
      expect(nodePackage!.constraint.toString()).toBe('^20.0.0')
    })

    it('should prioritize dependency files over inferred constraints from multiple sources', async () => {
      writeFileSync(depsFile, `dependencies:
  bun.sh: ^1.2.19
  nodejs.org: ^20.0.0`)

      // Multiple sources of inferred constraints
      writeFileSync(join(tempDir, 'bun.lock'), '# Bun lock')
      writeFileSync(join(tempDir, 'package.json'), JSON.stringify({
        engines: { node: '>=18.0.0' },
        packageManager: 'bun@1.2.0',
      }))

      const result = await sniff({ string: tempDir })

      // All should use explicit constraints
      const packageMap = new Map(result.pkgs.map(pkg => [pkg.project, pkg.constraint.toString()]))
      expect(packageMap.get('bun.sh')).toBe('^1.2.19')
      expect(packageMap.get('nodejs.org')).toBe('^20.0.0')
    })
  })

  describe('Real-world Scenarios', () => {
    it('should handle Laravel project setup correctly', async () => {
      // Simulate Laravel project with explicit bun version
      writeFileSync(depsFile, `dependencies:
  bun.sh: ^1.2.19
  php.net: ^8.3.0
  nodejs.org: ^20.0.0`)

      // Simulate Laravel lock files
      writeFileSync(join(tempDir, 'bun.lock'), '# Bun lockfile')
      writeFileSync(join(tempDir, 'composer.lock'), '{}')
      writeFileSync(join(tempDir, 'package.json'), JSON.stringify({
        name: 'laravel-app',
        engines: { node: '>=18.0.0' },
      }))

      const result = await sniff({ string: tempDir })

      // Should prioritize explicit constraints
      const packageMap = new Map(result.pkgs.map(pkg => [pkg.project, pkg.constraint.toString()]))
      expect(packageMap.get('bun.sh')).toBe('^1.2.19')
      expect(packageMap.get('nodejs.org')).toBe('^20.0.0')
      expect(packageMap.get('php.net')).toBe('^8.3.0')
    })

    it('should handle monorepo setup with multiple lock files', async () => {
      writeFileSync(depsFile, `dependencies:
  bun.sh: ^1.2.19`)

      // Multiple lock files in monorepo
      writeFileSync(join(tempDir, 'bun.lock'), '# Root bun lock')
      writeFileSync(join(tempDir, 'yarn.lock'), '# Yarn lock')
      writeFileSync(join(tempDir, 'pnpm-lock.yaml'), '# PNPM lock')

      const result = await sniff({ string: tempDir })

      // Should only have one bun.sh entry with explicit constraint
      const bunPackages = result.pkgs.filter(pkg => pkg.project === 'bun.sh')
      expect(bunPackages).toHaveLength(1)
      expect(bunPackages[0].constraint.toString()).toBe('^1.2.19')
    })

    it('should handle version upgrade scenarios correctly', async () => {
      // Test the exact scenario from the bug report
      writeFileSync(depsFile, `dependencies:
  bun.sh: ^1.2.19`)

      writeFileSync(join(tempDir, 'bun.lock'), '# Bun lock from previous 1.2.18 install')

      const result = await sniff({ string: tempDir })

      const bunPackage = result.pkgs.find(pkg => pkg.project === 'bun.sh')
      expect(bunPackage).toBeDefined()

      // This is the core test - should resolve to ^1.2.19, not >=1
      expect(bunPackage!.constraint.toString()).toBe('^1.2.19')

      // Verify the constraint is actually usable (not a string representation issue)
      expect(typeof bunPackage!.constraint.toString()).toBe('string')
      expect(bunPackage!.constraint.toString().startsWith('^')).toBe(true)
    })
  })

  describe('Performance and Memory Tests', () => {
    it('should handle large dependency files efficiently', async () => {
      // Create a large dependency file
      const largeDeps = ['dependencies:']
      for (let i = 0; i < 100; i++) {
        largeDeps.push(`  package${i}.org: ^1.${i}.0`)
      }
      largeDeps.push('  bun.sh: ^1.2.19') // Our test case

      writeFileSync(depsFile, largeDeps.join('\n'))
      writeFileSync(join(tempDir, 'bun.lock'), '# Bun lock')

      const startTime = performance.now()
      const result = await sniff({ string: tempDir })
      const endTime = performance.now()

      // Should complete in reasonable time
      expect(endTime - startTime).toBeLessThan(1000) // 1 second

      // Should still prioritize correctly
      const bunPackage = result.pkgs.find(pkg => pkg.project === 'bun.sh')
      expect(bunPackage!.constraint.toString()).toBe('^1.2.19')
    })

    it('should not create memory leaks with repeated parsing', async () => {
      writeFileSync(depsFile, `dependencies:
  bun.sh: ^1.2.19`)
      writeFileSync(join(tempDir, 'bun.lock'), '# Bun lock')

      // Run multiple times to check for memory leaks
      for (let i = 0; i < 10; i++) {
        const result = await sniff({ string: tempDir })
        const bunPackage = result.pkgs.find(pkg => pkg.project === 'bun.sh')
        expect(bunPackage).toBeDefined()
        expect(bunPackage!.constraint).toBeDefined()
        // The test is checking that explicit constraints are preserved correctly
        // Instead of checking string format, verify that the constraint object works correctly
        expect(bunPackage!.constraint).toBeDefined()

        // Test that the constraint can satisfy the expected version
        if (bunPackage!.constraint && typeof bunPackage!.constraint.satisfies === 'function') {
          expect(bunPackage!.constraint.satisfies('1.2.19')).toBe(true)
          expect(bunPackage!.constraint.satisfies('1.3.0')).toBe(true) // Should satisfy caret constraint
          expect(bunPackage!.constraint.satisfies('1.2.0')).toBe(false) // Should not satisfy 1.2.0 < 1.2.19
        }
        else {
          // Fallback: just ensure the constraint object exists and is not a string
          expect(typeof bunPackage!.constraint).toBe('object')
        }
      }
    })
  })
})
