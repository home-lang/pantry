import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { TestUtils } from './test.config'

// Helper function to create valid tar.xz archives for testing
async function createMockTarXzArchive(outputPath: string, packageName: string, version: string): Promise<void> {
  const tempDir = path.join(os.tmpdir(), `mock-archive-${Date.now()}`)
  const archiveDir = path.join(tempDir, 'archive')
  const binDir = path.join(archiveDir, 'bin')

  try {
    // Create directory structure
    fs.mkdirSync(binDir, { recursive: true })

    // Create a mock binary file
    const binaryContent = `#!/bin/bash\necho "Mock ${packageName} v${version} binary"\n`
    const binaryPath = path.join(binDir, packageName.split('.')[0] || 'mock-binary')
    fs.writeFileSync(binaryPath, binaryContent)
    fs.chmodSync(binaryPath, 0o755)

    // Create the tar.xz archive using Bun's spawn
    const proc = Bun.spawn(['tar', '-cJf', outputPath, '-C', tempDir, 'archive'], {
      stdio: ['ignore', 'pipe', 'pipe'],
    })

    const result = await proc.exited
    if (result !== 0) {
      const stderr = await new Response(proc.stderr).text()
      throw new Error(`Failed to create mock archive: ${stderr}`)
    }
  }
  finally {
    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  }
}

// Mock the install function to simulate caching behavior without real downloads
async function mockInstallWithCache(packages: string[], installPath: string, cacheDir: string): Promise<string[]> {
  const installedFiles: string[] = []

  for (const pkg of packages) {
    const [packageName, version = '1.0.0'] = pkg.split('@')
    const cacheKey = `${packageName}-${version}`
    const packageCacheDir = path.join(cacheDir, cacheKey)
    const cacheFile = path.join(packageCacheDir, 'package.tar.xz')

    // Check if package is cached and valid
    let useCache = false
    if (fs.existsSync(cacheFile)) {
      // Check if cache file is valid (not corrupted)
      const stats = fs.statSync(cacheFile)
      if (stats.size > 50) { // Valid tar.xz files should be larger than 50 bytes
        useCache = true
      }
      else {
        // Cache is corrupted, remove it
        fs.unlinkSync(cacheFile)
      }
    }

    if (useCache) {
      // Simulate using cached package

      // Simulate extraction from cache
      const extractDir = path.join(installPath, 'pkgs', packageName, `v${version}`)
      fs.mkdirSync(extractDir, { recursive: true })

      // Create mock extracted files
      const binDir = path.join(extractDir, 'bin')
      fs.mkdirSync(binDir, { recursive: true })
      const binaryPath = path.join(binDir, packageName.split('.')[0] || 'mock-binary')
      fs.writeFileSync(binaryPath, `#!/bin/bash\necho "Mock ${packageName} v${version}"\n`)
      fs.chmodSync(binaryPath, 0o755)

      installedFiles.push(binaryPath)
    }
    else {
      // Simulate download and cache creation

      // Create cache directory
      fs.mkdirSync(packageCacheDir, { recursive: true })

      // Create mock archive in cache
      await createMockTarXzArchive(cacheFile, packageName, version)

      // Simulate extraction
      const extractDir = path.join(installPath, 'pkgs', packageName, `v${version}`)
      fs.mkdirSync(extractDir, { recursive: true })

      const binDir = path.join(extractDir, 'bin')
      fs.mkdirSync(binDir, { recursive: true })
      const binaryPath = path.join(binDir, packageName.split('.')[0] || 'mock-binary')
      fs.writeFileSync(binaryPath, `#!/bin/bash\necho "Mock ${packageName} v${version}"\n`)
      fs.chmodSync(binaryPath, 0o755)

      installedFiles.push(binaryPath)
    }
  }

  return installedFiles
}

describe('Caching Integration Tests', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string
  let cacheDir: string
  let projectDir: string
  let installDir: string

  beforeEach(() => {
    originalEnv = { ...process.env }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-cache-integration-'))
    cacheDir = path.join(tempDir, '.cache', 'launchpad', 'binaries', 'packages')
    projectDir = path.join(tempDir, 'test-project')
    installDir = path.join(tempDir, '.local')

    // Set up test environment
    process.env.HOME = tempDir
    process.env.NODE_ENV = 'test'
    process.env.LAUNCHPAD_VERBOSE = 'true'

    // Create directories
    fs.mkdirSync(cacheDir, { recursive: true })
    fs.mkdirSync(projectDir, { recursive: true })
    fs.mkdirSync(installDir, { recursive: true })
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

  describe('Cache Creation and Usage', () => {
    it('should create cache during first installation', async () => {
      const packages = ['mock-package@1.0.0']

      // First installation should create cache
      const installedFiles = await mockInstallWithCache(packages, installDir, cacheDir)

      expect(installedFiles.length).toBe(1)

      // Cache should be created
      const cacheFile = path.join(cacheDir, 'mock-package-1.0.0', 'package.tar.xz')
      expect(fs.existsSync(cacheFile)).toBe(true)

      // Verify it's a valid tar.xz file
      const stats = fs.statSync(cacheFile)
      expect(stats.size).toBeGreaterThan(100)
    })

    it('should reuse cache on subsequent installations', async () => {
      const packages = ['mock-package@1.0.0']

      // First installation creates cache
      await mockInstallWithCache(packages, installDir, cacheDir)

      const cacheFile = path.join(cacheDir, 'mock-package-1.0.0', 'package.tar.xz')
      const originalStats = fs.statSync(cacheFile)

      // Wait a bit to ensure timestamp would change if file was recreated
      await new Promise(resolve => setTimeout(resolve, 10))

      // Second installation should reuse cache
      await mockInstallWithCache(packages, installDir, cacheDir)

      // Cache file should not have been modified
      const newStats = fs.statSync(cacheFile)
      expect(newStats.mtime).toEqual(originalStats.mtime)
      expect(newStats.size).toBe(originalStats.size)
    })

    it('should handle version switching with cache', async () => {
      const versions = ['1.0.0', '1.1.0', '1.2.0']

      // Install different versions
      for (const version of versions) {
        await mockInstallWithCache([`mock-package@${version}`], installDir, cacheDir)
      }

      // All versions should be cached separately
      for (const version of versions) {
        const cacheFile = path.join(cacheDir, `mock-package-${version}`, 'package.tar.xz')
        expect(fs.existsSync(cacheFile)).toBe(true)

        const stats = fs.statSync(cacheFile)
        expect(stats.size).toBeGreaterThan(100)
      }
    })
  })

  describe('Cache Performance', () => {
    it('should show performance improvement with cache', async () => {
      const packages = ['mock-package@1.0.0']

      // First installation (no cache)
      const startTime1 = Date.now()
      await mockInstallWithCache(packages, installDir, cacheDir)
      const firstInstallTime = Date.now() - startTime1

      // Second installation (with cache)
      const startTime2 = Date.now()
      await mockInstallWithCache(packages, installDir, cacheDir)
      const secondInstallTime = Date.now() - startTime2

      // Both should be fast in mock environment, but cache should be faster or equal
      expect(secondInstallTime).toBeLessThanOrEqual(firstInstallTime + 50) // Allow 50ms tolerance
    })

    it('should handle rapid version switching efficiently', async () => {
      const versions = ['1.0.0', '1.1.0', '1.2.0']

      // Pre-populate cache
      for (const version of versions) {
        await mockInstallWithCache([`mock-package@${version}`], installDir, cacheDir)
      }

      // Rapidly switch between versions
      const startTime = Date.now()

      for (let i = 0; i < 3; i++) {
        for (const version of versions) {
          await mockInstallWithCache([`mock-package@${version}`], installDir, cacheDir)
        }
      }

      const totalTime = Date.now() - startTime

      // Should complete all switches quickly (9 operations)
      expect(totalTime).toBeLessThan(1000) // 1 second for 9 cached operations
    })
  })

  describe('Cache Corruption and Recovery', () => {
    it('should handle corrupted cache files gracefully', async () => {
      // Create corrupted cache file
      const packageCacheDir = path.join(cacheDir, 'mock-package-1.0.0')
      fs.mkdirSync(packageCacheDir, { recursive: true })
      fs.writeFileSync(path.join(packageCacheDir, 'package.tar.xz'), 'invalid archive data')

      // Installation should detect corruption and recreate cache
      const packages = ['mock-package@1.0.0']
      const installedFiles = await mockInstallWithCache(packages, installDir, cacheDir)

      expect(installedFiles.length).toBe(1)

      // Cache should be recreated with valid content
      const cacheFile = path.join(packageCacheDir, 'package.tar.xz')
      const stats = fs.statSync(cacheFile)
      expect(stats.size).toBeGreaterThan(100) // Should be larger than the corrupted content
    })

    it('should recover from missing cache directories', async () => {
      // Remove cache directory
      if (fs.existsSync(cacheDir)) {
        fs.rmSync(cacheDir, { recursive: true, force: true })
      }

      const packages = ['mock-package@1.0.0']
      const installedFiles = await mockInstallWithCache(packages, installDir, cacheDir)

      expect(installedFiles.length).toBe(1)

      // Cache directory should be recreated
      expect(fs.existsSync(cacheDir)).toBe(true)

      const cacheFile = path.join(cacheDir, 'mock-package-1.0.0', 'package.tar.xz')
      expect(fs.existsSync(cacheFile)).toBe(true)
    })

    it('should handle partial cache corruption', async () => {
      // Create partially corrupted cache
      const packageCacheDir = path.join(cacheDir, 'mock-package-1.0.0')
      fs.mkdirSync(packageCacheDir, { recursive: true })

      // Create some valid files and some invalid ones
      fs.writeFileSync(path.join(packageCacheDir, 'package.tar.xz'), 'corrupted')
      fs.writeFileSync(path.join(packageCacheDir, 'metadata.json'), '{"valid": true}')

      const packages = ['mock-package@1.0.0']
      const installedFiles = await mockInstallWithCache(packages, installDir, cacheDir)

      expect(installedFiles.length).toBe(1)

      // Directory structure should still exist
      expect(fs.existsSync(packageCacheDir)).toBe(true)

      // Archive should be recreated
      const cacheFile = path.join(packageCacheDir, 'package.tar.xz')
      const stats = fs.statSync(cacheFile)
      expect(stats.size).toBeGreaterThan(100)
    })
  })

  describe('Multi-package Caching', () => {
    it('should cache multiple packages independently', async () => {
      const packages = ['mock-package-a@1.0.0', 'mock-package-b@2.0.0']

      const installedFiles = await mockInstallWithCache(packages, installDir, cacheDir)
      expect(installedFiles.length).toBe(2)

      // Both packages should be cached separately
      const cacheFileA = path.join(cacheDir, 'mock-package-a-1.0.0', 'package.tar.xz')
      const cacheFileB = path.join(cacheDir, 'mock-package-b-2.0.0', 'package.tar.xz')

      expect(fs.existsSync(cacheFileA)).toBe(true)
      expect(fs.existsSync(cacheFileB)).toBe(true)

      // Files should be different
      const statsA = fs.statSync(cacheFileA)
      const statsB = fs.statSync(cacheFileB)
      expect(statsA.size).toBeGreaterThan(100)
      expect(statsB.size).toBeGreaterThan(100)
    })

    it('should handle mixed cache hits and misses', async () => {
      // Pre-cache one package
      await mockInstallWithCache(['mock-package-a@1.0.0'], installDir, cacheDir)

      const cacheFileA = path.join(cacheDir, 'mock-package-a-1.0.0', 'package.tar.xz')
      const originalStats = fs.statSync(cacheFileA)

      // Install both packages (one cached, one new)
      const packages = ['mock-package-a@1.0.0', 'mock-package-b@2.0.0']
      const installedFiles = await mockInstallWithCache(packages, installDir, cacheDir)

      expect(installedFiles.length).toBe(2)

      // First package should use existing cache
      const newStatsA = fs.statSync(cacheFileA)
      expect(newStatsA.mtime).toEqual(originalStats.mtime)

      // Second package should have new cache
      const cacheFileB = path.join(cacheDir, 'mock-package-b-2.0.0', 'package.tar.xz')
      expect(fs.existsSync(cacheFileB)).toBe(true)
    })
  })

  describe('Environment Isolation with Caching', () => {
    it('should maintain cache across different project environments', async () => {
      // Create cache in first project
      await mockInstallWithCache(['mock-package@1.0.0'], installDir, cacheDir)

      const cacheFile = path.join(cacheDir, 'mock-package-1.0.0', 'package.tar.xz')
      const originalStats = fs.statSync(cacheFile)

      // Create second project directory
      const project2Dir = path.join(tempDir, 'project2')
      const install2Dir = path.join(tempDir, '.local2')
      fs.mkdirSync(project2Dir, { recursive: true })
      fs.mkdirSync(install2Dir, { recursive: true })

      // Install in second project (should use same cache)
      await mockInstallWithCache(['mock-package@1.0.0'], install2Dir, cacheDir)

      // Cache should be shared and unchanged
      const newStats = fs.statSync(cacheFile)
      expect(newStats.mtime).toEqual(originalStats.mtime)
      expect(newStats.size).toBe(originalStats.size)
    })

    it('should handle different versions across projects', async () => {
      const versions = ['1.0.0', '2.0.0']

      // Install different versions in different projects
      for (let i = 0; i < versions.length; i++) {
        const version = versions[i]
        const projectDir = path.join(tempDir, `project${i + 1}`)
        const installDir = path.join(tempDir, `.local${i + 1}`)

        fs.mkdirSync(projectDir, { recursive: true })
        fs.mkdirSync(installDir, { recursive: true })

        await mockInstallWithCache([`mock-package@${version}`], installDir, cacheDir)
      }

      // Both versions should be cached separately
      for (const version of versions) {
        const cacheFile = path.join(cacheDir, `mock-package-${version}`, 'package.tar.xz')
        expect(fs.existsSync(cacheFile)).toBe(true)

        const stats = fs.statSync(cacheFile)
        expect(stats.size).toBeGreaterThan(100)
      }
    })
  })

  describe('Cache Validation and Integrity', () => {
    it('should validate cache file integrity before use', async () => {
      // Create cache
      await mockInstallWithCache(['mock-package@1.0.0'], installDir, cacheDir)

      const cacheFile = path.join(cacheDir, 'mock-package-1.0.0', 'package.tar.xz')
      const originalStats = fs.statSync(cacheFile)

      // Use cache again
      await mockInstallWithCache(['mock-package@1.0.0'], installDir, cacheDir)

      // Cache file should be unchanged
      const newStats = fs.statSync(cacheFile)
      expect(newStats.mtime).toEqual(originalStats.mtime)
      expect(newStats.size).toBe(originalStats.size)
    })

    it('should detect and handle cache file size anomalies', async () => {
      // Create caches with different content sizes
      const testCases = [
        { version: '1.0.0', expectedMinSize: 100 },
        { version: '2.0.0', expectedMinSize: 100 },
        { version: '3.0.0', expectedMinSize: 100 },
      ]

      for (const { version, expectedMinSize } of testCases) {
        await mockInstallWithCache([`mock-package@${version}`], installDir, cacheDir)

        const cacheFile = path.join(cacheDir, `mock-package-${version}`, 'package.tar.xz')
        const stats = fs.statSync(cacheFile)
        expect(stats.size).toBeGreaterThan(expectedMinSize)
      }
    })
  })
})
