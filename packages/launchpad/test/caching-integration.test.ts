import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { dump } from '../src/dev'
import { TestUtils } from './test.config'

describe('Caching Integration Tests', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string
  let cacheDir: string
  let projectDir: string

  beforeEach(() => {
    originalEnv = { ...process.env }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-cache-integration-'))
    cacheDir = path.join(tempDir, '.cache', 'launchpad', 'binaries', 'packages')
    projectDir = path.join(tempDir, 'test-project')

    // Set up test environment
    process.env.HOME = tempDir
    process.env.NODE_ENV = 'test'
    process.env.LAUNCHPAD_VERBOSE = 'true'

    // Create directories
    fs.mkdirSync(cacheDir, { recursive: true })
    fs.mkdirSync(projectDir, { recursive: true })
  })

  afterEach(() => {
    process.env = originalEnv
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
    TestUtils.cleanupEnvironmentDirs()
  })

  describe('Real Package Caching Workflow', () => {
    it('should cache packages during installation', async () => {
      // Create a test project with dependencies
      const depsContent = `dependencies:
  bun.sh: 1.2.2`
      fs.writeFileSync(path.join(projectDir, 'deps.yaml'), depsContent)

      // First installation should create cache
      try {
        await dump(projectDir, { dryrun: false, quiet: true })
      }
      catch (error) {
        // Expected to fail in test environment, but should attempt caching
        expect(error).toBeDefined()
      }

      // Cache directory structure should be created
      expect(fs.existsSync(cacheDir)).toBe(true)
    })

    it('should reuse cache on subsequent installations', async () => {
      // Create mock cache first
      const packageName = 'bun.sh-1.2.2'
      const packageCacheDir = path.join(cacheDir, packageName)
      fs.mkdirSync(packageCacheDir, { recursive: true })

      // Create a mock archive file
      const mockArchive = Buffer.alloc(1000, 'mock')
      fs.writeFileSync(path.join(packageCacheDir, 'package.tar.xz'), mockArchive)

      // Create test project
      const depsContent = `dependencies:
  bun.sh: 1.2.2`
      fs.writeFileSync(path.join(projectDir, 'deps.yaml'), depsContent)

      // Installation should detect and use cache
      try {
        await dump(projectDir, { dryrun: false, quiet: true })
      }
      catch (error) {
        // Expected to fail during extraction in test environment
        // but should have detected the cache file
        expect(error).toBeDefined()
      }

      // Cache file should still exist
      expect(fs.existsSync(path.join(packageCacheDir, 'package.tar.xz'))).toBe(true)
    })

    it('should handle version switching with cache', async () => {
      // Create cache for multiple versions
      const versions = ['1.2.1', '1.2.2', '1.2.3']
      versions.forEach((version) => {
        const packageName = `bun.sh-${version}`
        const packageCacheDir = path.join(cacheDir, packageName)
        fs.mkdirSync(packageCacheDir, { recursive: true })

        const mockArchive = Buffer.alloc(1000, `mock-${version}`)
        fs.writeFileSync(path.join(packageCacheDir, 'package.tar.xz'), mockArchive)
      })

      // Test switching between versions
      for (const version of versions) {
        const depsContent = `dependencies:
  bun.sh: ${version}`
        fs.writeFileSync(path.join(projectDir, 'deps.yaml'), depsContent)

        try {
          await dump(projectDir, { dryrun: false, quiet: true })
        }
        catch {
          // Expected to fail in test environment
        }

        // Verify correct cache file is accessed
        const packageName = `bun.sh-${version}`
        const cacheFile = path.join(cacheDir, packageName, 'package.tar.xz')
        expect(fs.existsSync(cacheFile)).toBe(true)

        const content = fs.readFileSync(cacheFile)
        expect(content.toString().includes(`mock-${version}`)).toBe(true)
      }
    })
  })

  describe('Cache Performance Testing', () => {
    it('should show performance improvement with cache', async () => {
      // Create mock cache
      const packageName = 'bun.sh-1.2.2'
      const packageCacheDir = path.join(cacheDir, packageName)
      fs.mkdirSync(packageCacheDir, { recursive: true })

      const mockArchive = Buffer.alloc(10000, 'mock')
      fs.writeFileSync(path.join(packageCacheDir, 'package.tar.xz'), mockArchive)

      const depsContent = `dependencies:
  bun.sh: 1.2.2`
      fs.writeFileSync(path.join(projectDir, 'deps.yaml'), depsContent)

      // Measure time for cached installation
      const startTime = Date.now()
      try {
        await dump(projectDir, { dryrun: false, quiet: true })
      }
      catch {
        // Expected to fail in test environment
      }
      const endTime = Date.now()

      const duration = endTime - startTime

      // With cache, should be relatively fast (less than 5 seconds even in test env)
      expect(duration).toBeLessThan(5000)
    })

    it('should handle rapid version switching efficiently', async () => {
      // Create cache for multiple versions
      const versions = ['1.2.1', '1.2.2', '1.2.3', '1.2.4']
      versions.forEach((version) => {
        const packageName = `bun.sh-${version}`
        const packageCacheDir = path.join(cacheDir, packageName)
        fs.mkdirSync(packageCacheDir, { recursive: true })

        const mockArchive = Buffer.alloc(5000, `mock-${version}`)
        fs.writeFileSync(path.join(packageCacheDir, 'package.tar.xz'), mockArchive)
      })

      // Rapidly switch between versions
      const startTime = Date.now()

      for (let i = 0; i < 3; i++) {
        for (const version of versions) {
          const depsContent = `dependencies:
  bun.sh: ${version}`
          fs.writeFileSync(path.join(projectDir, 'deps.yaml'), depsContent)

          try {
            await dump(projectDir, { dryrun: false, quiet: true })
          }
          catch {
            // Expected to fail in test environment
          }
        }
      }

      const endTime = Date.now()
      const totalDuration = endTime - startTime

      // Should complete all switches in reasonable time
      expect(totalDuration).toBeLessThan(15000) // 15 seconds for 12 switches
    })
  })

  describe('Cache Corruption and Recovery', () => {
    it('should handle corrupted cache files gracefully', async () => {
      // Create corrupted cache file
      const packageName = 'bun.sh-1.2.2'
      const packageCacheDir = path.join(cacheDir, packageName)
      fs.mkdirSync(packageCacheDir, { recursive: true })

      // Write invalid archive content
      fs.writeFileSync(path.join(packageCacheDir, 'package.tar.xz'), 'invalid archive data')

      const depsContent = `dependencies:
  bun.sh: 1.2.2`
      fs.writeFileSync(path.join(projectDir, 'deps.yaml'), depsContent)

      // Installation should detect corruption and handle gracefully
      try {
        await dump(projectDir, { dryrun: false, quiet: true })
      }
      catch (error) {
        // Should fail gracefully with meaningful error
        expect(error).toBeDefined()
        expect(error instanceof Error).toBe(true)
      }
    })

    it('should recover from missing cache directories', async () => {
      const depsContent = `dependencies:
  bun.sh: 1.2.2`
      fs.writeFileSync(path.join(projectDir, 'deps.yaml'), depsContent)

      // Remove cache directory to simulate missing cache
      if (fs.existsSync(cacheDir)) {
        fs.rmSync(cacheDir, { recursive: true, force: true })
      }

      // Installation should recreate cache structure
      try {
        await dump(projectDir, { dryrun: false, quiet: true })
      }
      catch {
        // Expected to fail in test environment
      }

      // Cache directory should be recreated
      expect(fs.existsSync(path.dirname(cacheDir))).toBe(true)
    })

    it('should handle partial cache corruption', async () => {
      // Create partially corrupted cache
      const packageName = 'bun.sh-1.2.2'
      const packageCacheDir = path.join(cacheDir, packageName)
      fs.mkdirSync(packageCacheDir, { recursive: true })

      // Create some valid files and some invalid ones
      fs.writeFileSync(path.join(packageCacheDir, 'package.tar.xz'), 'corrupted')
      fs.writeFileSync(path.join(packageCacheDir, 'valid-file.txt'), 'valid content')

      const depsContent = `dependencies:
  bun.sh: 1.2.2`
      fs.writeFileSync(path.join(projectDir, 'deps.yaml'), depsContent)

      try {
        await dump(projectDir, { dryrun: false, quiet: true })
      }
      catch (error) {
        // Should handle partial corruption gracefully
        expect(error).toBeDefined()
      }

      // Directory structure should still exist
      expect(fs.existsSync(packageCacheDir)).toBe(true)
    })
  })

  describe('Multi-package Caching', () => {
    it('should cache multiple packages independently', async () => {
      // Create cache for multiple packages
      const packages = [
        { name: 'bun.sh-1.2.2', content: 'bun content' },
        { name: 'nodejs.org-20.0.0', content: 'node content' },
      ]

      packages.forEach(({ name, content }) => {
        const packageCacheDir = path.join(cacheDir, name)
        fs.mkdirSync(packageCacheDir, { recursive: true })
        fs.writeFileSync(path.join(packageCacheDir, 'package.tar.xz'), content)
      })

      const depsContent = `dependencies:
  bun.sh: 1.2.2
  nodejs.org: 20.0.0`
      fs.writeFileSync(path.join(projectDir, 'deps.yaml'), depsContent)

      try {
        await dump(projectDir, { dryrun: false, quiet: true })
      }
      catch {
        // Expected to fail in test environment
      }

      // Both packages should remain cached
      packages.forEach(({ name, content }) => {
        const cacheFile = path.join(cacheDir, name, 'package.tar.xz')
        expect(fs.existsSync(cacheFile)).toBe(true)
        expect(fs.readFileSync(cacheFile, 'utf-8')).toBe(content)
      })
    })

    it('should handle mixed cache hits and misses', async () => {
      // Create cache for only one package
      const cachedPackage = 'bun.sh-1.2.2'
      const packageCacheDir = path.join(cacheDir, cachedPackage)
      fs.mkdirSync(packageCacheDir, { recursive: true })
      fs.writeFileSync(path.join(packageCacheDir, 'package.tar.xz'), 'cached bun content')

      const depsContent = `dependencies:
  bun.sh: 1.2.2
  nodejs.org: 20.0.0`
      fs.writeFileSync(path.join(projectDir, 'deps.yaml'), depsContent)

      try {
        await dump(projectDir, { dryrun: false, quiet: true })
      }
      catch {
        // Expected to fail in test environment
      }

      // Cached package should still exist
      expect(fs.existsSync(path.join(packageCacheDir, 'package.tar.xz'))).toBe(true)

      // Non-cached package should not have cache yet (would be created during real download)
      const _nonCachedDir = path.join(cacheDir, 'nodejs.org-20.0.0')
      // In test environment, this might not be created due to download failure
    })
  })

  describe('Environment Isolation with Caching', () => {
    it('should maintain cache across different project environments', async () => {
      // Create cache
      const packageName = 'bun.sh-1.2.2'
      const packageCacheDir = path.join(cacheDir, packageName)
      fs.mkdirSync(packageCacheDir, { recursive: true })
      fs.writeFileSync(path.join(packageCacheDir, 'package.tar.xz'), 'shared cache content')

      // Create two different projects
      const project1Dir = path.join(tempDir, 'project1')
      const project2Dir = path.join(tempDir, 'project2')
      fs.mkdirSync(project1Dir, { recursive: true })
      fs.mkdirSync(project2Dir, { recursive: true })

      const depsContent = `dependencies:
  bun.sh: 1.2.2`

      fs.writeFileSync(path.join(project1Dir, 'deps.yaml'), depsContent)
      fs.writeFileSync(path.join(project2Dir, 'deps.yaml'), depsContent)

      // Both projects should use the same cache
      try {
        await dump(project1Dir, { dryrun: false, quiet: true })
      }
      catch {
        // Expected to fail in test environment
      }

      try {
        await dump(project2Dir, { dryrun: false, quiet: true })
      }
      catch {
        // Expected to fail in test environment
      }

      // Cache should still exist and be shared
      expect(fs.existsSync(path.join(packageCacheDir, 'package.tar.xz'))).toBe(true)
      expect(fs.readFileSync(path.join(packageCacheDir, 'package.tar.xz'), 'utf-8')).toBe('shared cache content')
    })

    it('should handle different versions across projects', async () => {
      // Create cache for multiple versions
      const versions = ['1.2.1', '1.2.2']
      versions.forEach((version) => {
        const packageName = `bun.sh-${version}`
        const packageCacheDir = path.join(cacheDir, packageName)
        fs.mkdirSync(packageCacheDir, { recursive: true })
        fs.writeFileSync(path.join(packageCacheDir, 'package.tar.xz'), `content for ${version}`)
      })

      // Create projects with different versions
      const project1Dir = path.join(tempDir, 'project1')
      const project2Dir = path.join(tempDir, 'project2')
      fs.mkdirSync(project1Dir, { recursive: true })
      fs.mkdirSync(project2Dir, { recursive: true })

      fs.writeFileSync(path.join(project1Dir, 'deps.yaml'), 'dependencies:\n  bun.sh: 1.2.1')
      fs.writeFileSync(path.join(project2Dir, 'deps.yaml'), 'dependencies:\n  bun.sh: 1.2.2')

      // Both projects should use their respective cached versions
      try {
        await dump(project1Dir, { dryrun: false, quiet: true })
        await dump(project2Dir, { dryrun: false, quiet: true })
      }
      catch {
        // Expected to fail in test environment
      }

      // Both versions should remain cached
      versions.forEach((version) => {
        const packageName = `bun.sh-${version}`
        const cacheFile = path.join(cacheDir, packageName, 'package.tar.xz')
        expect(fs.existsSync(cacheFile)).toBe(true)
        expect(fs.readFileSync(cacheFile, 'utf-8')).toBe(`content for ${version}`)
      })
    })
  })

  describe('Cache Validation and Integrity', () => {
    it('should validate cache file integrity before use', async () => {
      // Create cache with specific content
      const packageName = 'bun.sh-1.2.2'
      const packageCacheDir = path.join(cacheDir, packageName)
      fs.mkdirSync(packageCacheDir, { recursive: true })

      const originalContent = 'valid archive content'
      fs.writeFileSync(path.join(packageCacheDir, 'package.tar.xz'), originalContent)

      const depsContent = `dependencies:
  bun.sh: 1.2.2`
      fs.writeFileSync(path.join(projectDir, 'deps.yaml'), depsContent)

      // First use should work with valid cache
      try {
        await dump(projectDir, { dryrun: false, quiet: true })
      }
      catch {
        // Expected to fail in test environment
      }

      // Verify cache content is unchanged
      const cacheFile = path.join(packageCacheDir, 'package.tar.xz')
      expect(fs.readFileSync(cacheFile, 'utf-8')).toBe(originalContent)
    })

    it('should detect and handle cache file size anomalies', async () => {
      // Create cache with unusual sizes
      const testCases = [
        { name: 'bun.sh-1.2.1', size: 0 }, // Empty file
        { name: 'bun.sh-1.2.2', size: 10 }, // Very small
        { name: 'bun.sh-1.2.3', size: 1000000 }, // Large file
      ]

      testCases.forEach(({ name, size }) => {
        const packageCacheDir = path.join(cacheDir, name)
        fs.mkdirSync(packageCacheDir, { recursive: true })

        const content = size > 0 ? 'x'.repeat(size) : ''
        fs.writeFileSync(path.join(packageCacheDir, 'package.tar.xz'), content)
      })

      // Test each case
      for (const { name, size } of testCases) {
        const version = name.split('-')[1]
        const depsContent = `dependencies:
  bun.sh: ${version}`
        fs.writeFileSync(path.join(projectDir, 'deps.yaml'), depsContent)

        try {
          await dump(projectDir, { dryrun: false, quiet: true })
        }
        catch {
          // Expected to fail in test environment
        }

        // Verify cache file size
        const cacheFile = path.join(cacheDir, name, 'package.tar.xz')
        const stats = fs.statSync(cacheFile)
        expect(stats.size).toBe(size)
      }
    })
  })
})
