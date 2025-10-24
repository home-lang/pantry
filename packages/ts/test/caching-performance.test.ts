import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { TestUtils } from './test.config'

describe('Caching Performance Benchmarks', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string
  let cacheDir: string
  let projectDir: string

  beforeEach(() => {
    originalEnv = { ...process.env }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-cache-perf-'))
    cacheDir = path.join(tempDir, '.cache', 'launchpad', 'binaries', 'packages')
    projectDir = path.join(tempDir, 'test-project')

    // Set up test environment
    process.env.HOME = tempDir
    process.env.NODE_ENV = 'test'
    process.env.LAUNCHPAD_VERBOSE = 'false' // Disable verbose for cleaner benchmarks

    // Create directories
    fs.mkdirSync(cacheDir, { recursive: true })
    fs.mkdirSync(projectDir, { recursive: true })
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

  describe('Cache Lookup Performance', () => {
    beforeEach(() => {
      // Create a large number of cached packages for performance testing
      const packageCount = 100
      for (let i = 0; i < packageCount; i++) {
        const packageName = `test-package-${i}-1.0.0`
        const packageCacheDir = path.join(cacheDir, packageName)
        fs.mkdirSync(packageCacheDir, { recursive: true })

        // Create realistic-sized mock archives
        const mockArchive = Buffer.alloc(1000 + (i * 10), `mock-${i}`)
        fs.writeFileSync(path.join(packageCacheDir, 'package.tar.xz'), mockArchive)
      }
    })

    it('should perform cache lookups efficiently with many cached packages', () => {
      const startTime = Date.now()

      // Perform many cache lookups
      for (let i = 0; i < 100; i++) {
        const packageName = `test-package-${i}-1.0.0`
        const cacheFile = path.join(cacheDir, packageName, 'package.tar.xz')
        expect(fs.existsSync(cacheFile)).toBe(true)
      }

      const endTime = Date.now()
      const duration = endTime - startTime

      // Should complete 100 lookups in less than 100ms
      expect(duration).toBeLessThan(100)
    })

    it('should handle cache directory scanning efficiently', () => {
      const startTime = Date.now()

      // Scan cache directory multiple times
      for (let i = 0; i < 10; i++) {
        const cachedPackages = fs.readdirSync(cacheDir)
        expect(cachedPackages.length).toBe(100)
      }

      const endTime = Date.now()
      const duration = endTime - startTime

      // Should complete 10 directory scans in less than 50ms
      expect(duration).toBeLessThan(50)
    })

    it('should perform cache file size calculations efficiently', () => {
      const startTime = Date.now()

      let totalSize = 0
      const cachedPackages = fs.readdirSync(cacheDir)

      cachedPackages.forEach((packageName) => {
        const cacheFile = path.join(cacheDir, packageName, 'package.tar.xz')
        if (fs.existsSync(cacheFile)) {
          const stats = fs.statSync(cacheFile)
          totalSize += stats.size
        }
      })

      const endTime = Date.now()
      const duration = endTime - startTime

      expect(totalSize).toBeGreaterThan(0)
      // Should calculate sizes for 100 files in less than 100ms
      expect(duration).toBeLessThan(100)
    })
  })

  describe('Version Switching Performance', () => {
    beforeEach(() => {
      // Create cache for multiple versions of the same package
      const versions = ['1.2.1', '1.2.2', '1.2.3', '1.2.4', '1.2.5']
      versions.forEach((version) => {
        const packageName = `bun.sh-${version}`
        const packageCacheDir = path.join(cacheDir, packageName)
        fs.mkdirSync(packageCacheDir, { recursive: true })

        // Create realistic-sized mock archives (12MB like real Bun)
        const mockArchive = Buffer.alloc(12 * 1024 * 1024, `bun-${version}`)
        fs.writeFileSync(path.join(packageCacheDir, 'package.tar.xz'), mockArchive)
      })
    })

    it('should perform cache lookups for different versions quickly', () => {
      const versions = ['1.2.1', '1.2.2', '1.2.3', '1.2.4', '1.2.5']
      const lookupTimes: number[] = []

      for (const version of versions) {
        const startTime = Date.now()

        // Simulate cache lookup operations
        const packageName = `bun.sh-${version}`
        const packageCacheDir = path.join(cacheDir, packageName)
        const cacheFile = path.join(packageCacheDir, 'package.tar.xz')

        // Perform cache operations
        const cacheExists = fs.existsSync(cacheFile)
        expect(cacheExists).toBe(true)

        if (cacheExists) {
          const stats = fs.statSync(cacheFile)
          expect(stats.size).toBeGreaterThan(0)
        }

        const endTime = Date.now()
        lookupTimes.push(endTime - startTime)
      }

      // Each lookup should be very fast (less than 10ms)
      lookupTimes.forEach((time) => {
        expect(time).toBeLessThan(10)
      })

      // Average lookup time should be minimal
      const averageTime = lookupTimes.reduce((a, b) => a + b, 0) / lookupTimes.length
      expect(averageTime).toBeLessThan(5)
    })

    it('should handle rapid cache file access efficiently', () => {
      const versions = ['1.2.2', '1.2.4']
      const totalAccesses = 100

      const startTime = Date.now()

      for (let i = 0; i < totalAccesses; i++) {
        const version = versions[i % 2]
        const packageName = `bun.sh-${version}`
        const cacheFile = path.join(cacheDir, packageName, 'package.tar.xz')

        // Simulate rapid cache access
        const cacheExists = fs.existsSync(cacheFile)
        expect(cacheExists).toBe(true)

        // Simulate reading file metadata
        if (cacheExists) {
          const stats = fs.statSync(cacheFile)
          expect(stats.size).toBeGreaterThan(0)
        }
      }

      const endTime = Date.now()
      const totalDuration = endTime - startTime

      // 100 cache accesses should complete very quickly
      expect(totalDuration).toBeLessThan(100) // 100ms

      const averagePerAccess = totalDuration / totalAccesses
      expect(averagePerAccess).toBeLessThan(1) // 1ms per access
    })
  })

  describe('Cache File Operations Performance', () => {
    it('should create cache files efficiently', () => {
      const packageCount = 50
      const startTime = Date.now()

      for (let i = 0; i < packageCount; i++) {
        const packageName = `perf-test-${i}-1.0.0`
        const packageCacheDir = path.join(cacheDir, packageName)
        fs.mkdirSync(packageCacheDir, { recursive: true })

        // Create 1MB mock archive
        const mockArchive = Buffer.alloc(1024 * 1024, `data-${i}`)
        fs.writeFileSync(path.join(packageCacheDir, 'package.tar.xz'), mockArchive)
      }

      const endTime = Date.now()
      const duration = endTime - startTime

      // Should create 50 cache files (50MB total) in reasonable time
      expect(duration).toBeLessThan(2000) // 2 seconds

      // Verify all files were created
      for (let i = 0; i < packageCount; i++) {
        const packageName = `perf-test-${i}-1.0.0`
        const cacheFile = path.join(cacheDir, packageName, 'package.tar.xz')
        expect(fs.existsSync(cacheFile)).toBe(true)
      }
    })

    it('should copy cache files efficiently', () => {
      // Create source cache files
      const packageCount = 20
      const sourceFiles: string[] = []

      for (let i = 0; i < packageCount; i++) {
        const packageName = `source-${i}-1.0.0`
        const packageCacheDir = path.join(cacheDir, packageName)
        fs.mkdirSync(packageCacheDir, { recursive: true })

        const sourceFile = path.join(packageCacheDir, 'package.tar.xz')
        const mockArchive = Buffer.alloc(500 * 1024, `source-${i}`) // 500KB each
        fs.writeFileSync(sourceFile, mockArchive)
        sourceFiles.push(sourceFile)
      }

      // Test copying performance
      const tempCopyDir = path.join(tempDir, 'copy-test')
      fs.mkdirSync(tempCopyDir, { recursive: true })

      const startTime = Date.now()

      sourceFiles.forEach((sourceFile, i) => {
        const destFile = path.join(tempCopyDir, `copy-${i}.tar.xz`)
        fs.copyFileSync(sourceFile, destFile)
      })

      const endTime = Date.now()
      const duration = endTime - startTime

      // Should copy 20 files (10MB total) quickly
      expect(duration).toBeLessThan(1000) // 1 second

      // Verify all copies exist and have correct size
      sourceFiles.forEach((sourceFile, i) => {
        const destFile = path.join(tempCopyDir, `copy-${i}.tar.xz`)
        expect(fs.existsSync(destFile)).toBe(true)

        const sourceStats = fs.statSync(sourceFile)
        const destStats = fs.statSync(destFile)
        expect(destStats.size).toBe(sourceStats.size)
      })
    })

    it('should handle concurrent cache operations efficiently', async () => {
      const concurrentOps = 10
      const startTime = Date.now()

      // Create concurrent cache operations
      const operations = Array.from({ length: concurrentOps }, async (_, i) => {
        const packageName = `concurrent-${i}-1.0.0`
        const packageCacheDir = path.join(cacheDir, packageName)

        // Simulate cache creation
        fs.mkdirSync(packageCacheDir, { recursive: true })
        const mockArchive = Buffer.alloc(100 * 1024, `concurrent-${i}`)
        fs.writeFileSync(path.join(packageCacheDir, 'package.tar.xz'), mockArchive)

        // Simulate cache lookup
        const cacheFile = path.join(packageCacheDir, 'package.tar.xz')
        expect(fs.existsSync(cacheFile)).toBe(true)

        return packageName
      })

      const results = await Promise.all(operations)
      const endTime = Date.now()
      const duration = endTime - startTime

      expect(results).toHaveLength(concurrentOps)
      // Concurrent operations should complete quickly
      expect(duration).toBeLessThan(500) // 500ms
    })
  })

  describe('Memory Usage Performance', () => {
    it('should handle large cache directories without excessive memory usage', () => {
      // Create many small cache files
      const packageCount = 200
      const initialMemory = process.memoryUsage().heapUsed

      for (let i = 0; i < packageCount; i++) {
        const packageName = `memory-test-${i}-1.0.0`
        const packageCacheDir = path.join(cacheDir, packageName)
        fs.mkdirSync(packageCacheDir, { recursive: true })

        // Small files to test directory handling, not file size
        const mockArchive = Buffer.alloc(1024, `mem-${i}`)
        fs.writeFileSync(path.join(packageCacheDir, 'package.tar.xz'), mockArchive)
      }

      // Perform cache operations
      const cachedPackages = fs.readdirSync(cacheDir)
      expect(cachedPackages).toHaveLength(packageCount)

      // Check memory usage hasn't grown excessively
      const finalMemory = process.memoryUsage().heapUsed
      const memoryIncrease = finalMemory - initialMemory

      // Memory increase should be reasonable (less than 50MB for 200 small files)
      expect(memoryIncrease).toBeLessThan(50 * 1024 * 1024)
    })

    it('should efficiently handle cache statistics calculation', () => {
      // Create cache with known sizes
      const testCases = [
        { name: 'small-1.0.0', size: 1024 },
        { name: 'medium-1.0.0', size: 1024 * 1024 },
        { name: 'large-1.0.0', size: 10 * 1024 * 1024 },
      ]

      testCases.forEach(({ name, size }) => {
        const packageCacheDir = path.join(cacheDir, name)
        fs.mkdirSync(packageCacheDir, { recursive: true })

        const mockArchive = Buffer.alloc(size, 'x')
        fs.writeFileSync(path.join(packageCacheDir, 'package.tar.xz'), mockArchive)
      })

      const startTime = Date.now()

      // Calculate cache statistics
      let totalSize = 0
      let fileCount = 0
      const cachedPackages = fs.readdirSync(cacheDir)

      cachedPackages.forEach((packageName) => {
        const cacheFile = path.join(cacheDir, packageName, 'package.tar.xz')
        if (fs.existsSync(cacheFile)) {
          const stats = fs.statSync(cacheFile)
          totalSize += stats.size
          fileCount++
        }
      })

      const endTime = Date.now()
      const duration = endTime - startTime

      expect(fileCount).toBe(3)
      expect(totalSize).toBe(1024 + (1024 * 1024) + (10 * 1024 * 1024))

      // Statistics calculation should be fast
      expect(duration).toBeLessThan(50) // 50ms
    })
  })

  describe('Cache Cleanup Performance', () => {
    beforeEach(() => {
      // Create cache files for cleanup testing
      const packageCount = 30
      for (let i = 0; i < packageCount; i++) {
        const packageName = `cleanup-test-${i}-1.0.0`
        const packageCacheDir = path.join(cacheDir, packageName)
        fs.mkdirSync(packageCacheDir, { recursive: true })

        const mockArchive = Buffer.alloc(100 * 1024, `cleanup-${i}`)
        fs.writeFileSync(path.join(packageCacheDir, 'package.tar.xz'), mockArchive)
      }
    })

    it('should perform selective cache cleanup efficiently', () => {
      // Verify initial state
      const initialPackages = fs.readdirSync(cacheDir)
      expect(initialPackages).toHaveLength(30)

      const startTime = Date.now()

      // Remove every other package (selective cleanup)
      for (let i = 0; i < 30; i += 2) {
        const packageName = `cleanup-test-${i}-1.0.0`
        const packageCacheDir = path.join(cacheDir, packageName)
        fs.rmSync(packageCacheDir, { recursive: true, force: true })
      }

      const endTime = Date.now()
      const duration = endTime - startTime

      // Should remove 15 packages quickly
      expect(duration).toBeLessThan(500) // 500ms

      // Verify correct packages were removed
      const remainingPackages = fs.readdirSync(cacheDir)
      expect(remainingPackages).toHaveLength(15)

      // Verify remaining packages are the odd-numbered ones
      for (let i = 1; i < 30; i += 2) {
        const packageName = `cleanup-test-${i}-1.0.0`
        expect(remainingPackages).toContain(packageName)
      }
    })

    it('should perform complete cache cleanup efficiently', () => {
      // Verify initial state
      const initialPackages = fs.readdirSync(cacheDir)
      expect(initialPackages).toHaveLength(30)

      const startTime = Date.now()

      // Complete cleanup
      fs.rmSync(cacheDir, { recursive: true, force: true })

      const endTime = Date.now()
      const duration = endTime - startTime

      // Should remove entire cache quickly
      expect(duration).toBeLessThan(200) // 200ms

      // Verify cache is gone
      expect(fs.existsSync(cacheDir)).toBe(false)
    })
  })

  describe('Real-world Performance Scenarios', () => {
    it('should handle typical development workflow cache lookups efficiently', () => {
      // Simulate typical development workflow cache lookups:
      // 1. Initial setup with multiple packages
      // 2. Version switching
      // 3. Adding new packages
      // 4. Switching back to previous versions

      const workflow = [
        { packages: ['bun.sh-1.2.2'], description: 'Initial setup' },
        { packages: ['bun.sh-1.2.4'], description: 'Version upgrade' },
        { packages: ['bun.sh-1.2.2', 'nodejs.org-20.0.0'], description: 'Add Node.js' },
        { packages: ['bun.sh-1.2.4', 'nodejs.org-20.0.0'], description: 'Back to newer Bun' },
        { packages: ['bun.sh-1.2.2', 'nodejs.org-18.0.0'], description: 'Downgrade Node.js' },
      ]

      // Pre-populate cache to simulate realistic scenario
      const cacheEntries = [
        'bun.sh-1.2.2',
        'bun.sh-1.2.4',
        'nodejs.org-18.0.0',
        'nodejs.org-20.0.0',
      ]

      cacheEntries.forEach((entry) => {
        const packageCacheDir = path.join(cacheDir, entry)
        fs.mkdirSync(packageCacheDir, { recursive: true })

        const mockArchive = Buffer.alloc(5 * 1024 * 1024, entry) // 5MB each
        fs.writeFileSync(path.join(packageCacheDir, 'package.tar.xz'), mockArchive)
      })

      const workflowTimes: number[] = []

      for (const step of workflow) {
        const startTime = Date.now()

        // Simulate cache lookups for each package in the step
        for (const packageName of step.packages) {
          const cacheFile = path.join(cacheDir, packageName, 'package.tar.xz')
          const cacheExists = fs.existsSync(cacheFile)
          expect(cacheExists).toBe(true)

          if (cacheExists) {
            const stats = fs.statSync(cacheFile)
            expect(stats.size).toBeGreaterThan(0)
          }
        }

        const endTime = Date.now()
        const stepTime = endTime - startTime
        workflowTimes.push(stepTime)

        // Each cache lookup step should be very fast
        expect(stepTime).toBeLessThan(10) // 10ms per step
      }

      // Total workflow cache lookups should complete very quickly
      const totalTime = workflowTimes.reduce((a, b) => a + b, 0)
      expect(totalTime).toBeLessThan(50) // 50ms total

      // Average step time should be minimal
      const averageTime = totalTime / workflowTimes.length
      expect(averageTime).toBeLessThan(10) // 10ms average
    })

    it('should scale well with increasing cache size', () => {
      // Test performance as cache grows
      const cacheSizes = [10, 50, 100, 200]
      const lookupTimes: number[] = []

      cacheSizes.forEach((size) => {
        // Clear and rebuild cache to specific size
        if (fs.existsSync(cacheDir)) {
          fs.rmSync(cacheDir, { recursive: true, force: true })
        }
        fs.mkdirSync(cacheDir, { recursive: true })

        // Create cache of specific size
        for (let i = 0; i < size; i++) {
          const packageName = `scale-test-${i}-1.0.0`
          const packageCacheDir = path.join(cacheDir, packageName)
          fs.mkdirSync(packageCacheDir, { recursive: true })

          const mockArchive = Buffer.alloc(10 * 1024, `scale-${i}`)
          fs.writeFileSync(path.join(packageCacheDir, 'package.tar.xz'), mockArchive)
        }

        // Measure lookup performance
        const startTime = Date.now()

        // Perform lookups for all cached packages
        for (let i = 0; i < size; i++) {
          const packageName = `scale-test-${i}-1.0.0`
          const cacheFile = path.join(cacheDir, packageName, 'package.tar.xz')
          expect(fs.existsSync(cacheFile)).toBe(true)
        }

        const endTime = Date.now()
        const lookupTime = endTime - startTime
        lookupTimes.push(lookupTime)
      })

      // Performance should scale reasonably (not exponentially)
      // Each doubling of cache size should not more than double lookup time
      for (let i = 1; i < lookupTimes.length; i++) {
        const prevTime = lookupTimes[i - 1]
        const currentTime = lookupTimes[i]
        const prevSize = cacheSizes[i - 1]
        const currentSize = cacheSizes[i]

        const sizeRatio = currentSize / prevSize
        const timeRatio = currentTime / prevTime

        // Time ratio should not be much worse than size ratio
        // Handle case where previous time is 0 (very fast operations)
        if (prevTime > 0) {
          expect(timeRatio).toBeLessThan(sizeRatio * 2)
        }
      }

      // Even with 200 cached packages, lookups should be fast
      expect(lookupTimes[lookupTimes.length - 1]).toBeLessThan(200) // 200ms
    })
  })
})
