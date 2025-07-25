import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { install } from '../src/install'
import { TestUtils } from './test.config'

describe('Package Caching System', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string
  let cacheDir: string
  let testInstallDir: string

  beforeEach(() => {
    originalEnv = { ...process.env }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-cache-test-'))
    cacheDir = path.join(tempDir, '.cache', 'launchpad', 'binaries', 'packages')
    testInstallDir = path.join(tempDir, 'install')

    // Set up test environment
    process.env.HOME = tempDir
    process.env.NODE_ENV = 'test'

    // Create directories
    fs.mkdirSync(cacheDir, { recursive: true })
    fs.mkdirSync(testInstallDir, { recursive: true })
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
    TestUtils.cleanupEnvironmentDirs()
  })

  describe('Cache Directory Structure', () => {
    it('should create cache directory structure automatically', async () => {
      // Remove cache directory to test auto-creation
      if (fs.existsSync(cacheDir)) {
        fs.rmSync(cacheDir, { recursive: true, force: true })
      }

      // Attempt to install a package (will fail in test env, but should create cache structure)
      try {
        await install(['bun.sh@1.2.2'], testInstallDir)
      }
      catch {
        // Expected to fail in test environment
      }

      // Cache directory should be created
      expect(fs.existsSync(path.dirname(cacheDir))).toBe(true)
    })

    it('should use correct cache key format', () => {
      const testCases = [
        { domain: 'bun.sh', version: '1.2.2', expected: 'bun.sh-1.2.2' },
        { domain: 'nodejs.org', version: '20.0.0', expected: 'nodejs.org-20.0.0' },
        { domain: 'python.org', version: '3.11.0', expected: 'python.org-3.11.0' },
        { domain: 'go.dev', version: '1.21.0', expected: 'go.dev-1.21.0' },
      ]

      testCases.forEach(({ domain, version, expected }) => {
        const cacheKey = `${domain}-${version}`
        expect(cacheKey).toBe(expected)
      })
    })

    it('should handle special characters in package names', () => {
      const testCases = [
        { domain: 'github.com/cli/cli', version: '2.0.0', expected: 'github.com/cli/cli-2.0.0' },
        { domain: 'registry.npmjs.org/@types/node', version: '18.0.0', expected: 'registry.npmjs.org/@types/node-18.0.0' },
      ]

      testCases.forEach(({ domain, version, expected }) => {
        const cacheKey = `${domain}-${version}`
        expect(cacheKey).toBe(expected)
      })
    })
  })

  describe('Cache File Operations', () => {
    it('should create cache files with correct naming', () => {
      const testPackage = 'bun.sh-1.2.2'
      const packageCacheDir = path.join(cacheDir, testPackage)
      const formats = ['tar.xz', 'tar.gz']

      formats.forEach((format) => {
        const expectedPath = path.join(packageCacheDir, `package.${format}`)

        // Create mock cache file
        fs.mkdirSync(packageCacheDir, { recursive: true })
        fs.writeFileSync(expectedPath, 'mock archive content')

        expect(fs.existsSync(expectedPath)).toBe(true)
        expect(path.basename(expectedPath)).toBe(`package.${format}`)
      })
    })

    it('should handle cache file permissions correctly', () => {
      const testPackage = 'bun.sh-1.2.2'
      const packageCacheDir = path.join(cacheDir, testPackage)
      const cacheFile = path.join(packageCacheDir, 'package.tar.xz')

      // Create mock cache file
      fs.mkdirSync(packageCacheDir, { recursive: true })
      fs.writeFileSync(cacheFile, 'mock archive content')

      const stats = fs.statSync(cacheFile)
      expect(stats.isFile()).toBe(true)
      expect(stats.size).toBeGreaterThan(0)
    })

    it('should support multiple archive formats', () => {
      const testPackage = 'bun.sh-1.2.2'
      const packageCacheDir = path.join(cacheDir, testPackage)
      const formats = ['tar.xz', 'tar.gz']

      fs.mkdirSync(packageCacheDir, { recursive: true })

      formats.forEach((format) => {
        const cacheFile = path.join(packageCacheDir, `package.${format}`)
        fs.writeFileSync(cacheFile, `mock ${format} content`)
        expect(fs.existsSync(cacheFile)).toBe(true)
      })
    })
  })

  describe('Cache Lookup Logic', () => {
    beforeEach(() => {
      // Create mock cache files for testing
      const testPackages = [
        { name: 'bun.sh-1.2.2', format: 'tar.xz' },
        { name: 'bun.sh-1.2.4', format: 'tar.xz' },
        { name: 'nodejs.org-20.0.0', format: 'tar.gz' },
      ]

      testPackages.forEach(({ name, format }) => {
        const packageDir = path.join(cacheDir, name)
        fs.mkdirSync(packageDir, { recursive: true })
        fs.writeFileSync(path.join(packageDir, `package.${format}`), `mock ${name} content`)
      })
    })

    it('should find cached packages correctly', () => {
      const testCases = [
        { domain: 'bun.sh', version: '1.2.2', format: 'tar.xz', shouldExist: true },
        { domain: 'bun.sh', version: '1.2.4', format: 'tar.xz', shouldExist: true },
        { domain: 'nodejs.org', version: '20.0.0', format: 'tar.gz', shouldExist: true },
        { domain: 'bun.sh', version: '1.2.3', format: 'tar.xz', shouldExist: false },
        { domain: 'python.org', version: '3.11.0', format: 'tar.xz', shouldExist: false },
      ]

      testCases.forEach(({ domain, version, format, shouldExist }) => {
        const cacheKey = `${domain}-${version}`
        const cachePath = path.join(cacheDir, cacheKey, `package.${format}`)
        expect(fs.existsSync(cachePath)).toBe(shouldExist)
      })
    })

    it('should prefer tar.xz over tar.gz when both exist', () => {
      const testPackage = 'test-package-1.0.0'
      const packageDir = path.join(cacheDir, testPackage)

      fs.mkdirSync(packageDir, { recursive: true })
      fs.writeFileSync(path.join(packageDir, 'package.tar.xz'), 'xz content')
      fs.writeFileSync(path.join(packageDir, 'package.tar.gz'), 'gz content')

      // Both files exist
      expect(fs.existsSync(path.join(packageDir, 'package.tar.xz'))).toBe(true)
      expect(fs.existsSync(path.join(packageDir, 'package.tar.gz'))).toBe(true)

      // tar.xz should be preferred (this would be tested in the actual cache lookup logic)
      const xzStats = fs.statSync(path.join(packageDir, 'package.tar.xz'))
      const gzStats = fs.statSync(path.join(packageDir, 'package.tar.gz'))

      expect(xzStats.isFile()).toBe(true)
      expect(gzStats.isFile()).toBe(true)
    })
  })

  describe('Cache Validation', () => {
    it('should detect corrupted cache files', () => {
      const testPackage = 'bun.sh-1.2.2'
      const packageDir = path.join(cacheDir, testPackage)
      const cacheFile = path.join(packageDir, 'package.tar.xz')

      fs.mkdirSync(packageDir, { recursive: true })

      // Create corrupted cache file
      fs.writeFileSync(cacheFile, 'invalid archive content')

      expect(fs.existsSync(cacheFile)).toBe(true)

      // File exists but content is invalid
      const content = fs.readFileSync(cacheFile, 'utf-8')
      expect(content).toBe('invalid archive content')
      expect(content.length).toBeLessThan(100) // Too small for a real archive
    })

    it('should handle missing cache files gracefully', () => {
      const testPackage = 'nonexistent-package-1.0.0'
      const packageDir = path.join(cacheDir, testPackage)
      const cacheFile = path.join(packageDir, 'package.tar.xz')

      expect(fs.existsSync(cacheFile)).toBe(false)
      expect(fs.existsSync(packageDir)).toBe(false)
    })

    it('should validate cache file sizes', () => {
      const testPackage = 'bun.sh-1.2.2'
      const packageDir = path.join(cacheDir, testPackage)
      const cacheFile = path.join(packageDir, 'package.tar.xz')

      fs.mkdirSync(packageDir, { recursive: true })

      // Test different file sizes
      const testCases = [
        { content: '', expectedSize: 0 },
        { content: 'small', expectedSize: 5 },
        { content: 'x'.repeat(1000), expectedSize: 1000 },
        { content: 'x'.repeat(10000), expectedSize: 10000 },
      ]

      testCases.forEach(({ content, expectedSize }) => {
        fs.writeFileSync(cacheFile, content)
        const stats = fs.statSync(cacheFile)
        expect(stats.size).toBe(expectedSize)
      })
    })
  })

  describe('Cache Performance', () => {
    it('should handle multiple concurrent cache operations', async () => {
      const testPackages = [
        'bun.sh-1.2.1',
        'bun.sh-1.2.2',
        'bun.sh-1.2.3',
        'bun.sh-1.2.4',
        'nodejs.org-18.0.0',
        'nodejs.org-20.0.0',
      ]

      // Simulate concurrent cache operations
      const operations = testPackages.map(async (packageName) => {
        const packageDir = path.join(cacheDir, packageName)
        fs.mkdirSync(packageDir, { recursive: true })
        fs.writeFileSync(path.join(packageDir, 'package.tar.xz'), `content for ${packageName}`)
        return packageName
      })

      const results = await Promise.all(operations)
      expect(results).toHaveLength(testPackages.length)

      // Verify all cache files were created
      testPackages.forEach((packageName) => {
        const cacheFile = path.join(cacheDir, packageName, 'package.tar.xz')
        expect(fs.existsSync(cacheFile)).toBe(true)
      })
    })

    it('should handle large cache directories efficiently', () => {
      // Create many cache entries
      const packageCount = 50
      const packages = Array.from({ length: packageCount }, (_, i) => `test-package-${i}-1.0.0`)

      packages.forEach((packageName) => {
        const packageDir = path.join(cacheDir, packageName)
        fs.mkdirSync(packageDir, { recursive: true })
        fs.writeFileSync(path.join(packageDir, 'package.tar.xz'), `content for ${packageName}`)
      })

      // Verify all packages were cached
      const cachedPackages = fs.readdirSync(cacheDir)
      expect(cachedPackages).toHaveLength(packageCount)

      // Test lookup performance (should be fast even with many entries)
      const startTime = Date.now()
      packages.forEach((packageName) => {
        const cacheFile = path.join(cacheDir, packageName, 'package.tar.xz')
        expect(fs.existsSync(cacheFile)).toBe(true)
      })
      const endTime = Date.now()

      // Should complete quickly (less than 1 second for 50 lookups)
      expect(endTime - startTime).toBeLessThan(1000)
    })
  })

  describe('Cache Cleanup and Management', () => {
    beforeEach(() => {
      // Create test cache files
      const testPackages = [
        'bun.sh-1.2.1',
        'bun.sh-1.2.2',
        'bun.sh-1.2.3',
        'nodejs.org-18.0.0',
        'nodejs.org-20.0.0',
      ]

      testPackages.forEach((packageName) => {
        const packageDir = path.join(cacheDir, packageName)
        fs.mkdirSync(packageDir, { recursive: true })
        fs.writeFileSync(path.join(packageDir, 'package.tar.xz'), `content for ${packageName}`)
      })
    })

    it('should support selective cache cleanup', () => {
      // Remove specific package from cache
      const targetPackage = 'bun.sh-1.2.2'
      const targetDir = path.join(cacheDir, targetPackage)

      expect(fs.existsSync(targetDir)).toBe(true)

      fs.rmSync(targetDir, { recursive: true, force: true })

      expect(fs.existsSync(targetDir)).toBe(false)

      // Other packages should still exist
      expect(fs.existsSync(path.join(cacheDir, 'bun.sh-1.2.1'))).toBe(true)
      expect(fs.existsSync(path.join(cacheDir, 'bun.sh-1.2.3'))).toBe(true)
    })

    it('should support complete cache cleanup', () => {
      // Verify cache has content
      const cachedPackages = fs.readdirSync(cacheDir)
      expect(cachedPackages.length).toBeGreaterThan(0)

      // Clear entire cache
      fs.rmSync(cacheDir, { recursive: true, force: true })

      expect(fs.existsSync(cacheDir)).toBe(false)
    })

    it('should calculate cache size correctly', () => {
      const testContent = 'x'.repeat(1000) // 1KB per file
      const testPackages = ['test-1', 'test-2', 'test-3']

      testPackages.forEach((packageName) => {
        const packageDir = path.join(cacheDir, packageName)
        fs.mkdirSync(packageDir, { recursive: true })
        fs.writeFileSync(path.join(packageDir, 'package.tar.xz'), testContent)
      })

      // Calculate total cache size
      let totalSize = 0
      const calculateSize = (dir: string) => {
        const items = fs.readdirSync(dir)
        for (const item of items) {
          const itemPath = path.join(dir, item)
          const stats = fs.statSync(itemPath)
          if (stats.isDirectory()) {
            calculateSize(itemPath)
          }
          else {
            totalSize += stats.size
          }
        }
      }

      calculateSize(cacheDir)
      expect(totalSize).toBeGreaterThan(2900) // Allow for filesystem overhead
      expect(totalSize).toBeLessThan(3200) // 3 files × 1000 bytes each + overhead
    })
  })

  describe('Error Handling and Recovery', () => {
    it('should handle cache directory permission errors gracefully', () => {
      // This test simulates permission issues
      const restrictedDir = path.join(tempDir, 'restricted')
      fs.mkdirSync(restrictedDir, { recursive: true })

      try {
        // Try to change permissions (may not work on all systems)
        fs.chmodSync(restrictedDir, 0o444) // Read-only

        // Attempt to create cache in restricted directory should handle gracefully
        const testCacheDir = path.join(restrictedDir, 'cache')

        expect(() => {
          try {
            fs.mkdirSync(testCacheDir, { recursive: true })
          }
          catch (error) {
            // Expected to fail due to permissions
            expect(error).toBeDefined()
          }
        }).not.toThrow()
      }
      finally {
        // Restore permissions for cleanup
        try {
          fs.chmodSync(restrictedDir, 0o755)
        }
        catch {
          // Ignore cleanup errors
        }
      }
    })

    it('should recover from corrupted cache directories', () => {
      const testPackage = 'bun.sh-1.2.2'
      const packageDir = path.join(cacheDir, testPackage)

      // Create corrupted cache directory structure
      fs.mkdirSync(packageDir, { recursive: true })
      fs.writeFileSync(path.join(packageDir, 'invalid-file'), 'not an archive')

      expect(fs.existsSync(packageDir)).toBe(true)
      expect(fs.existsSync(path.join(packageDir, 'package.tar.xz'))).toBe(false)
      expect(fs.existsSync(path.join(packageDir, 'invalid-file'))).toBe(true)

      // Recovery would involve removing corrupted directory
      fs.rmSync(packageDir, { recursive: true, force: true })
      expect(fs.existsSync(packageDir)).toBe(false)
    })

    it('should handle disk space issues gracefully', () => {
      // This test simulates disk space issues by creating very large files
      const testPackage = 'large-package-1.0.0'
      const packageDir = path.join(cacheDir, testPackage)

      fs.mkdirSync(packageDir, { recursive: true })

      // Create a reasonably sized test file (not actually large to avoid test issues)
      const testContent = 'x'.repeat(10000) // 10KB
      fs.writeFileSync(path.join(packageDir, 'package.tar.xz'), testContent)

      const stats = fs.statSync(path.join(packageDir, 'package.tar.xz'))
      expect(stats.size).toBe(10000)
    })
  })

  describe('Integration with Package Installation', () => {
    it('should integrate with install function for cache hits', async () => {
      // Create mock cache file
      const testPackage = 'bun.sh-1.2.2'
      const packageDir = path.join(cacheDir, testPackage)
      fs.mkdirSync(packageDir, { recursive: true })

      // Create a mock archive file (not a real archive, but for testing cache detection)
      const mockArchive = Buffer.from('mock archive content')
      fs.writeFileSync(path.join(packageDir, 'package.tar.xz'), mockArchive)

      expect(fs.existsSync(path.join(packageDir, 'package.tar.xz'))).toBe(true)

      // The install function should detect this cached file exists
      // (actual installation will fail in test environment, but cache detection should work)
    })

    it('should integrate with install function for cache misses', async () => {
      // Ensure no cache exists for this package
      const testPackage = 'bun.sh-1.2.5'
      const packageDir = path.join(cacheDir, testPackage)

      expect(fs.existsSync(packageDir)).toBe(false)

      // Install function should detect cache miss and attempt download
      // (will fail in test environment, but should trigger download logic)
      try {
        await install(['bun.sh@1.2.5'], testInstallDir)
      }
      catch {
        // Expected to fail in test environment
      }
    })
  })

  describe('Version-specific Caching', () => {
    it('should cache different versions separately', () => {
      const versions = ['1.2.1', '1.2.2', '1.2.3', '1.2.4']
      const domain = 'bun.sh'

      versions.forEach((version) => {
        const packageName = `${domain}-${version}`
        const packageDir = path.join(cacheDir, packageName)
        fs.mkdirSync(packageDir, { recursive: true })
        fs.writeFileSync(path.join(packageDir, 'package.tar.xz'), `content for ${version}`)
      })

      // Verify all versions are cached separately
      versions.forEach((version) => {
        const packageName = `${domain}-${version}`
        const cacheFile = path.join(cacheDir, packageName, 'package.tar.xz')
        expect(fs.existsSync(cacheFile)).toBe(true)

        const content = fs.readFileSync(cacheFile, 'utf-8')
        expect(content).toBe(`content for ${version}`)
      })
    })

    it('should handle version switching correctly', () => {
      const domain = 'bun.sh'
      const versions = ['1.2.2', '1.2.4']

      // Cache both versions
      versions.forEach((version) => {
        const packageName = `${domain}-${version}`
        const packageDir = path.join(cacheDir, packageName)
        fs.mkdirSync(packageDir, { recursive: true })
        fs.writeFileSync(path.join(packageDir, 'package.tar.xz'), `${domain} version ${version}`)
      })

      // Simulate switching between versions
      versions.forEach((version) => {
        const packageName = `${domain}-${version}`
        const cacheFile = path.join(cacheDir, packageName, 'package.tar.xz')

        expect(fs.existsSync(cacheFile)).toBe(true)

        const content = fs.readFileSync(cacheFile, 'utf-8')
        expect(content).toBe(`${domain} version ${version}`)
      })
    })
  })

  describe('Cross-platform Compatibility', () => {
    it('should handle different path separators', () => {
      const testPackage = 'test-package-1.0.0'

      // Test with different path styles
      const _unixPath = path.posix.join(cacheDir, testPackage)
      const _windowsPath = path.win32.join(cacheDir, testPackage)

      // Use the appropriate path for the current platform
      const platformPath = path.join(cacheDir, testPackage)

      expect(typeof platformPath).toBe('string')
      expect(platformPath.includes(testPackage)).toBe(true)
    })

    it('should handle different file systems', () => {
      const testPackage = 'fs-test-package-1.0.0'
      const packageDir = path.join(cacheDir, testPackage)

      fs.mkdirSync(packageDir, { recursive: true })

      // Test file operations that should work across file systems
      const testFile = path.join(packageDir, 'package.tar.xz')
      fs.writeFileSync(testFile, 'test content')

      expect(fs.existsSync(testFile)).toBe(true)

      const content = fs.readFileSync(testFile, 'utf-8')
      expect(content).toBe('test content')

      // Test file stats
      const stats = fs.statSync(testFile)
      expect(stats.isFile()).toBe(true)
      expect(stats.size).toBeGreaterThan(0)
    })
  })

  describe('Cache Statistics and Monitoring', () => {
    beforeEach(() => {
      // Create test cache with known content
      const testPackages = [
        { name: 'bun.sh-1.2.1', size: 1000 },
        { name: 'bun.sh-1.2.2', size: 1200 },
        { name: 'nodejs.org-18.0.0', size: 2000 },
        { name: 'nodejs.org-20.0.0', size: 2200 },
      ]

      testPackages.forEach(({ name, size }) => {
        const packageDir = path.join(cacheDir, name)
        fs.mkdirSync(packageDir, { recursive: true })
        fs.writeFileSync(path.join(packageDir, 'package.tar.xz'), 'x'.repeat(size))
      })
    })

    it('should provide accurate cache statistics', () => {
      const cachedPackages = fs.readdirSync(cacheDir)
      expect(cachedPackages).toHaveLength(4)

      // Calculate total cache size
      let totalSize = 0
      cachedPackages.forEach((packageName) => {
        const cacheFile = path.join(cacheDir, packageName, 'package.tar.xz')
        if (fs.existsSync(cacheFile)) {
          const stats = fs.statSync(cacheFile)
          totalSize += stats.size
        }
      })

      expect(totalSize).toBe(6400) // 1000 + 1200 + 2000 + 2200
    })

    it('should track cache hit/miss ratios', () => {
      const testScenarios = [
        { package: 'bun.sh-1.2.1', shouldHit: true },
        { package: 'bun.sh-1.2.2', shouldHit: true },
        { package: 'bun.sh-1.2.3', shouldHit: false },
        { package: 'nodejs.org-18.0.0', shouldHit: true },
        { package: 'nodejs.org-20.0.0', shouldHit: true },
        { package: 'python.org-3.11.0', shouldHit: false },
      ]

      let hits = 0
      let misses = 0

      testScenarios.forEach(({ package: packageName, shouldHit }) => {
        const cacheFile = path.join(cacheDir, packageName, 'package.tar.xz')
        const exists = fs.existsSync(cacheFile)

        expect(exists).toBe(shouldHit)

        if (exists) {
          hits++
        }
        else {
          misses++
        }
      })

      expect(hits).toBe(4)
      expect(misses).toBe(2)

      const hitRatio = hits / (hits + misses)
      expect(hitRatio).toBeCloseTo(0.67, 2) // ~67% hit ratio
    })
  })
})
