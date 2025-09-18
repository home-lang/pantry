import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

describe('Library Path Management', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string

  beforeEach(() => {
    originalEnv = { ...process.env }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-libpath-test-'))
  })

  afterEach(() => {
    // Restore environment
    process.env = originalEnv

    // Clean up temp directory
    try {
      fs.rmSync(tempDir, { recursive: true, force: true })
    } catch {
      // Ignore cleanup errors
    }
  })

  describe('Library Path Scanning', () => {
    it('should scan library paths in environment directory', async () => {
      const { scanLibraryPaths } = await import('../src/dev/path-scanner')
      
      // Create mock environment with library directories
      const envDir = path.join(tempDir, 'env')
      fs.mkdirSync(envDir, { recursive: true })
      
      // Create standard lib directories
      const libDir = path.join(envDir, 'lib')
      const lib64Dir = path.join(envDir, 'lib64')
      fs.mkdirSync(libDir, { recursive: true })
      fs.mkdirSync(lib64Dir, { recursive: true })
      
      // Create mock library files
      fs.writeFileSync(path.join(libDir, 'libtest.dylib'), 'mock library content that is longer than 100 bytes to pass validation check')
      fs.writeFileSync(path.join(lib64Dir, 'libtest64.so'), 'mock library content that is longer than 100 bytes to pass validation check')
      
      // Create package-specific library directories
      const nodePackageDir = path.join(envDir, 'nodejs.org', 'v20.0.0', 'lib')
      fs.mkdirSync(nodePackageDir, { recursive: true })
      fs.writeFileSync(path.join(nodePackageDir, 'libnode.dylib'), 'mock node library content that is longer than 100 bytes to pass validation check')
      
      const paths = await scanLibraryPaths(envDir)
      
      expect(paths).toContain(libDir)
      expect(paths).toContain(lib64Dir)
      expect(paths).toContain(nodePackageDir)
      expect(paths.length).toBeGreaterThan(0)
    })

    it('should handle empty environment directory gracefully', async () => {
      const { scanLibraryPaths } = await import('../src/dev/path-scanner')
      
      // Test with non-existent directory
      const nonExistentDir = path.join(tempDir, 'non-existent')
      const paths = await scanLibraryPaths(nonExistentDir)
      
      expect(paths).toEqual([])
    })

    it('should validate library files properly', async () => {
      const { scanLibraryPaths } = await import('../src/dev/path-scanner')
      
      // Create environment with invalid library files
      const envDir = path.join(tempDir, 'env-invalid')
      const packageDir = path.join(envDir, 'test.org', 'v1.0.0', 'lib')
      fs.mkdirSync(packageDir, { recursive: true })
      
      // Create a file that's too small (should be ignored)
      fs.writeFileSync(path.join(packageDir, 'libsmall.dylib'), 'tiny')
      
      // Create a valid library file
      fs.writeFileSync(path.join(packageDir, 'libvalid.dylib'), 'this is a valid library file with enough content to pass the size check')
      
      const paths = await scanLibraryPaths(envDir)
      
      // Should include the directory because it has at least one valid library
      expect(paths).toContain(packageDir)
    })

    it('should skip known non-package directories', async () => {
      const { scanLibraryPaths } = await import('../src/dev/path-scanner')
      
      // Create environment with directories that should be skipped
      const envDir = path.join(tempDir, 'env-skip')
      fs.mkdirSync(envDir, { recursive: true })
      
      // Create directories that should be skipped
      const skipDirs = ['bin', 'sbin', 'lib', 'lib64', 'share', 'include', 'etc', 'pkgs', '.tmp', '.cache']
      for (const skipDir of skipDirs) {
        const dir = path.join(envDir, skipDir, 'v1.0.0', 'lib')
        fs.mkdirSync(dir, { recursive: true })
        fs.writeFileSync(path.join(dir, 'libtest.dylib'), 'mock library content that is longer than 100 bytes')
      }
      
      // Create a valid package directory
      const validDir = path.join(envDir, 'valid.org', 'v1.0.0', 'lib')
      fs.mkdirSync(validDir, { recursive: true })
      fs.writeFileSync(path.join(validDir, 'libvalid.dylib'), 'mock library content that is longer than 100 bytes')
      
      const paths = await scanLibraryPaths(envDir)
      
      // Should only include the valid package directory, not the skipped ones
      expect(paths).toContain(validDir)
      expect(paths.length).toBe(1)
    })

    it('should handle PHP packages specially', async () => {
      const { scanLibraryPaths } = await import('../src/dev/path-scanner')
      
      // Create PHP package directory
      const envDir = path.join(tempDir, 'env-php')
      const phpVersionDir = path.join(envDir, 'php.net', 'v8.4.12')
      const phpLibDir = path.join(phpVersionDir, 'lib')
      const phpBinDir = path.join(phpVersionDir, 'bin')
      
      fs.mkdirSync(phpLibDir, { recursive: true })
      fs.mkdirSync(phpBinDir, { recursive: true })
      
      // Create PHP binary (this makes it a valid PHP package even without large lib files)
      fs.writeFileSync(path.join(phpBinDir, 'php'), '#!/bin/sh\necho "PHP 8.4.12"')
      fs.chmodSync(path.join(phpBinDir, 'php'), 0o755)
      
      // Create small lib files (normally would be skipped, but PHP is special)
      fs.writeFileSync(path.join(phpLibDir, 'libphp.so'), 'small')
      
      const paths = await scanLibraryPaths(envDir)
      
      // Should include PHP lib directory because it has a php binary
      expect(paths).toContain(phpLibDir)
    })
  })

  describe('Global Path Scanning', () => {
    it('should scan global binary paths', async () => {
      const { scanGlobalPaths } = await import('../src/dev/path-scanner')
      
      // Create mock global directory
      const globalDir = path.join(tempDir, 'global')
      fs.mkdirSync(globalDir, { recursive: true })
      
      // Create standard binary directories
      const binDir = path.join(globalDir, 'bin')
      const sbinDir = path.join(globalDir, 'sbin')
      fs.mkdirSync(binDir, { recursive: true })
      fs.mkdirSync(sbinDir, { recursive: true })
      
      // Create package-specific binary directories
      const nodePackageBinDir = path.join(globalDir, 'nodejs.org', 'v20.0.0', 'bin')
      fs.mkdirSync(nodePackageBinDir, { recursive: true })
      
      const paths = await scanGlobalPaths(globalDir)
      
      expect(paths).toContain(binDir)
      expect(paths).toContain(sbinDir)
      expect(paths).toContain(nodePackageBinDir)
      expect(paths.length).toBeGreaterThan(0)
    })

    it('should use latest version for global packages', async () => {
      const { scanGlobalPaths } = await import('../src/dev/path-scanner')
      
      // Create global directory with multiple versions
      const globalDir = path.join(tempDir, 'global-versions')
      const packageDir = path.join(globalDir, 'test.org')
      fs.mkdirSync(packageDir, { recursive: true })
      
      // Create multiple version directories
      const versions = ['v1.0.0', 'v1.2.0', 'v1.10.0', 'v2.0.0']
      for (const version of versions) {
        const versionBinDir = path.join(packageDir, version, 'bin')
        fs.mkdirSync(versionBinDir, { recursive: true })
      }
      
      const paths = await scanGlobalPaths(globalDir)
      
      // Should only include the latest version (v2.0.0)
      const latestVersionBinDir = path.join(packageDir, 'v2.0.0', 'bin')
      expect(paths).toContain(latestVersionBinDir)
      
      // Should not include older versions
      const olderVersionBinDir = path.join(packageDir, 'v1.0.0', 'bin')
      expect(paths).not.toContain(olderVersionBinDir)
    })

    it('should handle empty global directory gracefully', async () => {
      const { scanGlobalPaths } = await import('../src/dev/path-scanner')
      
      // Test with non-existent directory
      const nonExistentDir = path.join(tempDir, 'non-existent-global')
      const paths = await scanGlobalPaths(nonExistentDir)
      
      expect(paths).toEqual([])
    })
  })

  describe('Environment Readiness Check', () => {
    it('should check environment readiness correctly', async () => {
      const { checkEnvironmentReady } = await import('../src/dev/path-scanner')
      
      // Create environment with bin directory and libraries
      const envDir = path.join(tempDir, 'env-ready')
      const binDir = path.join(envDir, 'bin')
      const libDir = path.join(envDir, 'lib')
      
      fs.mkdirSync(binDir, { recursive: true })
      fs.mkdirSync(libDir, { recursive: true })
      fs.writeFileSync(path.join(libDir, 'libtest.dylib'), 'mock library content that is longer than 100 bytes')
      
      const result = await checkEnvironmentReady(envDir)
      
      expect(result.ready).toBe(true)
      expect(result.binExists).toBe(true)
      expect(result.hasLibraries).toBe(true)
    })

    it('should handle environment without bin directory', async () => {
      const { checkEnvironmentReady } = await import('../src/dev/path-scanner')
      
      // Create environment without bin directory
      const envDir = path.join(tempDir, 'env-no-bin')
      fs.mkdirSync(envDir, { recursive: true })
      
      const result = await checkEnvironmentReady(envDir)
      
      expect(result.ready).toBe(false)
      expect(result.binExists).toBe(false)
      expect(result.hasLibraries).toBe(false)
    })
  })
})
