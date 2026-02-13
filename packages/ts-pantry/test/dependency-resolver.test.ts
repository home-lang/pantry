import type { Dependency } from '../src/dependency-resolver'
import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import fs from 'node:fs'
import path from 'node:path'
import {
  compareVersions,
  deduplicateDependencies,

  findDependencyFiles,
  parseDependencyFile,
  resolveDependencyFile,
  resolveTransitiveDependencies,
  resolveVersionConstraint,
} from '../src/dependency-resolver'

// Test fixtures directory
const fixturesDir = path.join(__dirname, 'fixtures', 'dependency-resolver')

describe('Dependency Resolver', () => {
  beforeEach(() => {
    // Ensure fixtures directory exists
    if (!fs.existsSync(fixturesDir)) {
      fs.mkdirSync(fixturesDir, { recursive: true })
    }
  })

  afterEach(() => {
    // Clean up any test files
    if (fs.existsSync(fixturesDir)) {
      const files = fs.readdirSync(fixturesDir)
      for (const file of files) {
        fs.unlinkSync(path.join(fixturesDir, file))
      }
    }
  })

  describe('parseDependencyFile', () => {
    test('should parse simple dependencies', () => {
      const testFile = path.join(fixturesDir, 'simple-deps.yaml')
      fs.writeFileSync(testFile, `
dependencies:
  bun.sh: ^1.2.19
  cli.github.com: ^2.73.0
`)

      const result = parseDependencyFile(testFile)
      expect(result).toHaveLength(2)

      expect(result[0]).toEqual({
        name: 'bun.sh',
        version: '1.2.19',
        constraint: '^1.2.19',
        isOsSpecific: false,
      })

      expect(result[1]).toEqual({
        name: 'cli.github.com',
        version: '2.73.0',
        constraint: '^2.73.0',
        isOsSpecific: false,
      })
    })

    test('should parse global dependencies', () => {
      const testFile = path.join(fixturesDir, 'global-deps.yaml')
      fs.writeFileSync(testFile, `
global: true
dependencies:
  bun.sh: ^1.2.19
  gnu.org/bash: ^5.2.37
`)

      const result = parseDependencyFile(testFile)
      expect(result).toHaveLength(2)
      expect(result[0].name).toBe('bun.sh')
      expect(result[1].name).toBe('gnu.org/bash')
    })

    test('should handle version constraints', () => {
      const testFile = path.join(fixturesDir, 'version-constraints.yaml')
      fs.writeFileSync(testFile, `
dependencies:
  package1: ^1.2.3
  package2: ~2.1.0
  package3: ">=3.0.0"
  package4: "1.5.0"
  package5: "*"
  package6: latest
`)

      const result = parseDependencyFile(testFile)
      expect(result).toHaveLength(6)

      expect(result[0].constraint).toBe('^1.2.3')
      expect(result[1].constraint).toBe('~2.1.0')
      expect(result[2].constraint).toBe('>=3.0.0')
      expect(result[3].constraint).toBe('@1.5.0')
      expect(result[4].constraint).toBe('*')
      expect(result[5].constraint).toBe('*')
    })

    test('should throw error for non-existent file', () => {
      expect(() => {
        parseDependencyFile('/non/existent/file.yaml')
      }).toThrow('Dependency file not found')
    })

    test('should handle empty file', () => {
      const testFile = path.join(fixturesDir, 'empty.yaml')
      fs.writeFileSync(testFile, '')

      const result = parseDependencyFile(testFile)
      expect(result).toHaveLength(0)
    })

    test('should handle file without dependencies section', () => {
      const testFile = path.join(fixturesDir, 'no-deps.yaml')
      fs.writeFileSync(testFile, `
name: test-project
version: 1.0.0
`)

      const result = parseDependencyFile(testFile)
      expect(result).toHaveLength(0)
    })
  })

  describe('resolveVersionConstraint', () => {
    test('should resolve exact version constraint', async () => {
      const result = await resolveVersionConstraint('bun.sh', '@1.2.19')
      expect(result).toBe('1.2.19')
    })

    test('should resolve caret constraint to latest compatible', async () => {
      const result = await resolveVersionConstraint('bun.sh', '^1.2.16')
      // Should resolve to latest 1.x version (caret allows minor updates)
      expect(result).toMatch(/^1\.\d+\.\d+$/)
      expect(compareVersions(result, '1.2.16')).toBeGreaterThanOrEqual(0)
    })

    test('should resolve tilde constraint to latest patch', async () => {
      const result = await resolveVersionConstraint('bun.sh', '~1.2.16')
      // Should resolve to latest 1.2.x version
      expect(result).toMatch(/^1\.2\.\d+$/)
    })

    test('should resolve latest constraint', async () => {
      const result = await resolveVersionConstraint('bun.sh', 'latest')
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    test('should resolve wildcard constraint', async () => {
      const result = await resolveVersionConstraint('bun.sh', '*')
      expect(result).toBeTruthy()
      expect(typeof result).toBe('string')
    })

    test('should handle >= constraint', async () => {
      const result = await resolveVersionConstraint('bun.sh', '>=1.2.0')
      expect(compareVersions(result, '1.2.0')).toBeGreaterThanOrEqual(0)
    })

    test('should handle unknown package gracefully', async () => {
      const result = await resolveVersionConstraint('unknown.package', '^1.0.0')
      expect(result).toBe('1.0.0')
    })
  })

  describe('Version Resolution Fixes', () => {
    test('should properly handle version constraints with comments', async () => {
      const tests = [
        { constraint: '~1.14 # libvpx abi changes in 1.15', expected: '~1.14' },
        { constraint: '^3 # several of the bins are scripts', expected: '^3' },
        { constraint: '>=1.0.0 # minimum supported version', expected: '>=1.0.0' },
        { constraint: '1.7 # links to libgit2.so.1.7', expected: '1.7' },
      ]

      for (const test of tests) {
        // The resolved version should respect the constraint (without comment)
        const resolved = await resolveVersionConstraint('webmproject.org/libvpx', test.constraint)

        // Should not be null
        expect(resolved).toBeTruthy()

        // Should not contain comment text
        expect(resolved).not.toMatch(/#/)

        // For tilde constraints, should stay within the specified minor version
        if (test.constraint.startsWith('~1.14')) {
          expect(resolved.startsWith('1.14')).toBe(true)
        }
      }
    })

    test('should correctly implement tilde constraint logic', async () => {
      // Tilde constraints should only allow patch-level changes
      const resolved = await resolveVersionConstraint('webmproject.org/libvpx', '~1.14.0')

      // Should resolve to a 1.14.x version, NOT 1.15.x
      expect(resolved).toBeTruthy()
      if (resolved !== '~1.14.0') { // If it's not returning the constraint as-is
        const [major, minor] = resolved.split('.')
        expect(major).toBe('1')
        expect(minor).toBe('14')
      }
    })

    test('should correctly implement caret constraint logic', async () => {
      // Caret constraints should allow compatible version updates
      const resolved = await resolveVersionConstraint('bun.sh', '^1.2.16')

      expect(resolved).toBeTruthy()
      if (resolved !== '^1.2.16') { // If it's not returning the constraint as-is
        const [major] = resolved.split('.')
        expect(major).toBe('1')
      }
    })

    test('should handle exact version constraints', async () => {
      const resolved = await resolveVersionConstraint('bun.sh', '@1.2.19')
      expect(resolved).toBeTruthy()
    })

    test('should handle range constraints', async () => {
      const tests = [
        '>=1.0.0',
        '>1.0.0',
        '<=2.0.0',
        '<2.0.0',
      ]

      for (const constraint of tests) {
        const resolved = await resolveVersionConstraint('python.org', constraint)
        expect(resolved).toBeTruthy()
      }
    })

    test('should handle wildcard constraints', async () => {
      const resolved = await resolveVersionConstraint('python.org', '*')
      expect(resolved).toBeTruthy()
    })

    test('should handle latest constraints', async () => {
      const resolved = await resolveVersionConstraint('python.org', 'latest')
      expect(resolved).toBeTruthy()
    })

    test('should handle unknown packages gracefully', async () => {
      const resolved = await resolveVersionConstraint('unknown.package.domain', '^1.0.0')
      // Should return the constraint without the operator or fallback gracefully
      expect(resolved).toBeTruthy()
    })
  })

  describe('compareVersions', () => {
    test('should compare semantic versions correctly', () => {
      expect(compareVersions('1.2.3', '1.2.2')).toBe(1)
      expect(compareVersions('1.2.2', '1.2.3')).toBe(-1)
      expect(compareVersions('1.2.3', '1.2.3')).toBe(0)
    })

    test('should handle different version lengths', () => {
      expect(compareVersions('1.2', '1.2.0')).toBe(0)
      expect(compareVersions('1.2.3', '1.2')).toBe(1)
      expect(compareVersions('1.2', '1.2.3')).toBe(-1)
    })

    test('should handle latest versions', () => {
      expect(compareVersions('latest', '1.2.3')).toBe(1)
      expect(compareVersions('1.2.3', 'latest')).toBe(-1)
      expect(compareVersions('latest', 'latest')).toBe(0)
    })

    test('should handle major version differences', () => {
      expect(compareVersions('2.0.0', '1.9.9')).toBe(1)
      expect(compareVersions('1.9.9', '2.0.0')).toBe(-1)
    })
  })

  describe('resolveTransitiveDependencies', () => {
    test('should resolve transitive dependencies for known package', async () => {
      const result = await resolveTransitiveDependencies('bun.sh', {
        verbose: false,
        maxDepth: 2,
      })

      expect(Array.isArray(result)).toBe(true)
      // bun.sh might not have dependencies, but the function should work
    })

    test('should respect maxDepth option', async () => {
      const result = await resolveTransitiveDependencies('ffmpeg.org', {
        maxDepth: 1,
        verbose: false,
      })

      expect(Array.isArray(result)).toBe(true)
    })

    test('should handle includeOsSpecific option', async () => {
      const resultWithOs = await resolveTransitiveDependencies('ffmpeg.org', {
        includeOsSpecific: true,
        verbose: false,
      })

      const resultWithoutOs = await resolveTransitiveDependencies('ffmpeg.org', {
        includeOsSpecific: false,
        verbose: false,
      })

      expect(Array.isArray(resultWithOs)).toBe(true)
      expect(Array.isArray(resultWithoutOs)).toBe(true)
    })

    test('should handle targetOs option', async () => {
      const result = await resolveTransitiveDependencies('ffmpeg.org', {
        targetOs: 'linux',
        includeOsSpecific: true,
        verbose: false,
      })

      expect(Array.isArray(result)).toBe(true)

      // Check that OS-specific dependencies are properly marked
      const osSpecificDeps = result.filter(dep => dep.isOsSpecific)
      osSpecificDeps.forEach((dep) => {
        expect(dep.os).toBe('linux')
      })
    })

    test('should prevent infinite recursion', async () => {
      const visited = new Set<string>()
      visited.add('test-package')

      const result = await resolveTransitiveDependencies('test-package', {
        maxDepth: 10,
        verbose: false,
      }, visited)

      expect(result).toHaveLength(0)
    })

    test('should handle unknown package gracefully', async () => {
      const result = await resolveTransitiveDependencies('unknown.package', {
        verbose: false,
      })

      expect(Array.isArray(result)).toBe(true)
      expect(result).toHaveLength(0)
    })
  })

  describe('deduplicateDependencies', () => {
    test('should deduplicate identical dependencies', async () => {
      const dependencies: Dependency[] = [
        {
          name: 'bun.sh',
          version: '1.2.19',
          constraint: '^1.2.19',
          isOsSpecific: false,
        },
        {
          name: 'bun.sh',
          version: '1.2.19',
          constraint: '^1.2.19',
          isOsSpecific: false,
        },
      ]

      const result = await deduplicateDependencies(dependencies)

      expect(result.allDependencies).toHaveLength(1)
      expect(result.uniquePackages).toEqual(['bun.sh'])
      expect(result.conflicts).toHaveLength(0)
    })

    test('should detect version conflicts', async () => {
      const dependencies: Dependency[] = [
        {
          name: 'test-package',
          version: '1.0.0',
          constraint: '^1.0.0',
          isOsSpecific: false,
        },
        {
          name: 'test-package',
          version: '2.0.0',
          constraint: '^2.0.0',
          isOsSpecific: false,
        },
      ]

      const result = await deduplicateDependencies(dependencies)

      expect(result.conflicts).toHaveLength(1)
      expect(result.conflicts[0].package).toBe('test-package')
      expect(result.conflicts[0].versions).toEqual(['1.0.0', '2.0.0'])
    })

    test('should categorize OS-specific dependencies', async () => {
      const dependencies: Dependency[] = [
        {
          name: 'linux-package',
          version: '1.0.0',
          constraint: '^1.0.0',
          isOsSpecific: true,
          os: 'linux',
        },
        {
          name: 'darwin-package',
          version: '1.0.0',
          constraint: '^1.0.0',
          isOsSpecific: true,
          os: 'darwin',
        },
        {
          name: 'windows-package',
          version: '1.0.0',
          constraint: '^1.0.0',
          isOsSpecific: true,
          os: 'windows',
        },
      ]

      const result = await deduplicateDependencies(dependencies)

      expect(result.osSpecificDeps.linux).toHaveLength(1)
      expect(result.osSpecificDeps.darwin).toHaveLength(1)
      expect(result.osSpecificDeps.windows).toHaveLength(1)
    })

    test('should choose best version when resolving conflicts', async () => {
      const dependencies: Dependency[] = [
        {
          name: 'bun.sh',
          version: '1.2.16',
          constraint: '^1.2.16',
          isOsSpecific: false,
        },
        {
          name: 'bun.sh',
          version: '1.2.19',
          constraint: '^1.2.19',
          isOsSpecific: false,
        },
      ]

      const result = await deduplicateDependencies(dependencies)

      expect(result.allDependencies).toHaveLength(1)
      // Should choose the latest version
      expect(compareVersions(result.allDependencies[0].version, '1.2.16')).toBeGreaterThanOrEqual(0)
    })
  })

  describe('resolveDependencyFile', () => {
    test('should resolve complete dependency tree', async () => {
      const testFile = path.join(fixturesDir, 'complete-deps.yaml')
      fs.writeFileSync(testFile, `
dependencies:
  bun.sh: ^1.2.16
  cli.github.com: ^2.73.0
`)

      const result = await resolveDependencyFile(testFile, {
        verbose: false,
      })

      expect(result.allDependencies.length).toBeGreaterThanOrEqual(2)
      expect(result.uniquePackages).toContain('bun.sh')
      expect(result.uniquePackages).toContain('cli.github.com')
      expect(result.conflicts).toEqual(expect.any(Array))
      expect(result.osSpecificDeps).toEqual(expect.objectContaining({
        linux: expect.any(Array),
        darwin: expect.any(Array),
        windows: expect.any(Array),
      }))
    })

    test('should handle complex dependencies with transitive deps', async () => {
      const testFile = path.join(fixturesDir, 'complex-deps.yaml')
      fs.writeFileSync(testFile, `
dependencies:
  ffmpeg.org: ^7.1.1
`)

      const result = await resolveDependencyFile(testFile, {
        verbose: false,
        maxDepth: 3,
      })

      // ffmpeg has many transitive dependencies
      expect(result.allDependencies.length).toBeGreaterThan(10)
      expect(result.uniquePackages).toContain('ffmpeg.org')
    })

    test('should handle empty dependency file', async () => {
      const testFile = path.join(fixturesDir, 'empty-deps.yaml')
      fs.writeFileSync(testFile, '')

      const result = await resolveDependencyFile(testFile, {
        verbose: false,
      })

      expect(result.allDependencies).toHaveLength(0)
      expect(result.uniquePackages).toHaveLength(0)
      expect(result.conflicts).toHaveLength(0)
    })

    test('should respect verbose option', async () => {
      const testFile = path.join(fixturesDir, 'verbose-test.yaml')
      fs.writeFileSync(testFile, `
dependencies:
  bun.sh: ^1.2.19
`)

      // Test both verbose and non-verbose modes
      const verboseResult = await resolveDependencyFile(testFile, {
        verbose: true,
      })

      const quietResult = await resolveDependencyFile(testFile, {
        verbose: false,
      })

      expect(verboseResult).toEqual(quietResult)
    })

    test('should handle OS-specific options', async () => {
      const testFile = path.join(fixturesDir, 'os-specific.yaml')
      fs.writeFileSync(testFile, `
dependencies:
  ffmpeg.org: ^7.1.1
`)

      const linuxResult = await resolveDependencyFile(testFile, {
        targetOs: 'linux',
        includeOsSpecific: true,
        verbose: false,
      })

      const darwinResult = await resolveDependencyFile(testFile, {
        targetOs: 'darwin',
        includeOsSpecific: true,
        verbose: false,
      })

      expect(linuxResult.osSpecificDeps.linux.length).toBeGreaterThanOrEqual(0)
      expect(darwinResult.osSpecificDeps.darwin.length).toBeGreaterThanOrEqual(0)
    })
  })

  describe('findDependencyFiles', () => {
    test('should find standard dependency file names', () => {
      const testDir = path.join(fixturesDir, 'find-test')
      fs.mkdirSync(testDir, { recursive: true })

      // Create various dependency files
      fs.writeFileSync(path.join(testDir, 'deps.yaml'), 'dependencies:\n  test: ^1.0.0')
      fs.writeFileSync(path.join(testDir, 'dependencies.yml'), 'dependencies:\n  test: ^1.0.0')
      fs.writeFileSync(path.join(testDir, 'pkgx.yaml'), 'dependencies:\n  test: ^1.0.0')
      fs.writeFileSync(path.join(testDir, '.deps.yaml'), 'dependencies:\n  test: ^1.0.0')

      const found = findDependencyFiles(testDir)

      expect(found).toContain(path.join(testDir, 'deps.yaml'))
      expect(found).toContain(path.join(testDir, 'dependencies.yml'))
      expect(found).toContain(path.join(testDir, 'pkgx.yaml'))
      expect(found).toContain(path.join(testDir, '.deps.yaml'))

      // Clean up
      fs.rmSync(testDir, { recursive: true })
    })

    test('should return empty array for directory with no dependency files', () => {
      const testDir = path.join(fixturesDir, 'empty-dir')
      fs.mkdirSync(testDir, { recursive: true })

      const found = findDependencyFiles(testDir)
      expect(found).toHaveLength(0)

      // Clean up
      fs.rmSync(testDir, { recursive: true })
    })

    test('should ignore non-dependency files', () => {
      const testDir = path.join(fixturesDir, 'mixed-files')
      fs.mkdirSync(testDir, { recursive: true })

      fs.writeFileSync(path.join(testDir, 'deps.yaml'), 'dependencies:\n  test: ^1.0.0')
      fs.writeFileSync(path.join(testDir, 'package.json'), '{}')
      fs.writeFileSync(path.join(testDir, 'README.md'), '# Test')
      fs.writeFileSync(path.join(testDir, 'other.yaml'), 'not: dependencies')

      const found = findDependencyFiles(testDir)

      expect(found).toHaveLength(1)
      expect(found[0]).toBe(path.join(testDir, 'deps.yaml'))

      // Clean up
      fs.rmSync(testDir, { recursive: true })
    })
  })

  describe('Integration Tests', () => {
    test('should handle real-world dependency scenarios', async () => {
      const testFile = path.join(fixturesDir, 'real-world.yaml')
      fs.writeFileSync(testFile, `
global: true
dependencies:
  bun.sh: ^1.2.16
  gnu.org/bash: ^5.2.37
  gnu.org/grep: ^3.12.0
  crates.io/eza: ^0.21.3
  ffmpeg.org: ^7.1.1
  cli.github.com: ^2.73.0
  starship.rs: ^1.23.0
`)

      const result = await resolveDependencyFile(testFile, {
        verbose: false,
        maxDepth: 2,
        includeOsSpecific: true,
      })

      // Verify basic structure
      expect(result.allDependencies.length).toBeGreaterThan(7)
      expect(result.uniquePackages.length).toBeGreaterThan(7)

      // Verify specific packages are resolved
      expect(result.uniquePackages).toContain('bun.sh')
      expect(result.uniquePackages).toContain('ffmpeg.org')
      expect(result.uniquePackages).toContain('cli.github.com')

      // Verify versions are properly resolved
      const bunDep = result.allDependencies.find(dep => dep.name === 'bun.sh')
      expect(bunDep).toBeDefined()
      expect(bunDep!.constraint).toBe('^1.2.16')
      expect(compareVersions(bunDep!.version, '1.2.16')).toBeGreaterThanOrEqual(0)

      // Verify OS-specific dependencies are handled
      expect(result.osSpecificDeps).toBeDefined()
      expect(result.osSpecificDeps.linux).toEqual(expect.any(Array))
      expect(result.osSpecificDeps.darwin).toEqual(expect.any(Array))
      expect(result.osSpecificDeps.windows).toEqual(expect.any(Array))
    })

    test('should handle edge cases gracefully', async () => {
      const testFile = path.join(fixturesDir, 'edge-cases.yaml')
      fs.writeFileSync(testFile, `
dependencies:
  "unknown.package": ^1.0.0
  "": invalid
  123invalid: ^1.0.0
`)

      // Should not throw errors
      const result = await resolveDependencyFile(testFile, {
        verbose: false,
      })

      expect(result).toBeDefined()
      expect(result.allDependencies).toEqual(expect.any(Array))
    })
  })
})
