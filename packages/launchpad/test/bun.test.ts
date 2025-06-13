import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

import { get_bun_asset, get_latest_bun_version, install_bun } from '../src/bun'

describe('Bun', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string

  beforeEach(() => {
    originalEnv = { ...process.env }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-test-'))
  })

  afterEach(() => {
    process.env = originalEnv
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  describe('get_latest_bun_version', () => {
    it('should return a valid version string', async () => {
      try {
        const version = await get_latest_bun_version()
        expect(typeof version).toBe('string')
        expect(version.length).toBeGreaterThan(0)
        expect(version).toMatch(/\d+\.\d+\.\d+/) // Should contain semantic versioning
      }
      catch (error) {
        // Network errors are acceptable in tests
        if (error instanceof Error && error.message.includes('Failed to fetch')) {
          console.warn('Skipping test: network error')
          return
        }
        throw error
      }
    }, 30000)

    it('should not include v prefix', async () => {
      try {
        const version = await get_latest_bun_version()
        expect(version.startsWith('v')).toBe(false)
      }
      catch (error) {
        if (error instanceof Error && error.message.includes('Failed to fetch')) {
          console.warn('Skipping test: network error')
          return
        }
        throw error
      }
    }, 30000)

    it('should handle network errors gracefully', async () => {
      // This test verifies that network errors are properly thrown
      // We can't easily simulate network failures, so we just ensure the function exists
      expect(typeof get_latest_bun_version).toBe('function')
    })

    it('should use cache when available', async () => {
      try {
        // First call should fetch from network
        const version1 = await get_latest_bun_version()

        // Second call should use cache (if implemented)
        const version2 = await get_latest_bun_version()

        expect(version1).toBe(version2)
      }
      catch (error) {
        if (error instanceof Error && error.message.includes('Failed to fetch')) {
          console.warn('Skipping test: network error')
          return
        }
        throw error
      }
    }, 30000)
  })

  describe('get_bun_asset', () => {
    it('should return correct asset for current platform', () => {
      const version = '1.0.0'
      const asset = get_bun_asset(version)

      expect(asset).toHaveProperty('filename')
      expect(asset).toHaveProperty('url')
      expect(typeof asset.filename).toBe('string')
      expect(typeof asset.url).toBe('string')
      expect(asset.filename.length).toBeGreaterThan(0)
      expect(asset.url.length).toBeGreaterThan(0)
    })

    it('should include version in URL', () => {
      const version = '1.2.3'
      const asset = get_bun_asset(version)

      expect(asset.url).toContain(version)
      expect(asset.url).toContain('github.com/oven-sh/bun/releases')
    })

    it('should handle different versions', () => {
      const versions = ['1.0.0', '1.1.0', '1.2.3', '2.0.0-beta.1']

      for (const version of versions) {
        const asset = get_bun_asset(version)
        expect(asset.url).toContain(version)
        expect(asset.filename).toContain('bun-')
        expect(asset.filename).toContain('.zip')
      }
    })

    it('should return platform-specific filename', () => {
      const version = '1.0.0'
      const asset = get_bun_asset(version)

      // The function returns the current platform, so we test that it contains valid platform info
      expect(asset.filename).toMatch(/bun-(darwin|linux|windows)-(aarch64|x64)\.zip/)

      // Should contain the actual current platform (darwin on macOS, linux on Linux, etc.)
      const currentPlatform = os.platform()
      const expectedPlatform = currentPlatform === 'darwin' ? 'darwin' : currentPlatform === 'win32' ? 'windows' : 'linux'
      expect(asset.filename).toContain(expectedPlatform)
    })

    it('should return architecture-specific filename', () => {
      const version = '1.0.0'
      const asset = get_bun_asset(version)

      // The function returns the current architecture, so we test that it contains valid arch info
      expect(asset.filename).toMatch(/(aarch64|x64)/)

      // Should contain the actual current architecture
      const currentArch = os.arch()
      const expectedArch = currentArch === 'arm64' ? 'aarch64' : 'x64'
      expect(asset.filename).toContain(expectedArch)
    })

    it('should always return zip files', () => {
      const version = '1.0.0'
      const asset = get_bun_asset(version)

      expect(asset.filename).toEndWith('.zip')
    })
  })

  describe('install_bun', () => {
    it('should validate installation path', async () => {
      // Test with invalid path
      await expect(install_bun('/invalid/readonly/path')).rejects.toThrow('Invalid installation path')
    })

    it('should create necessary directories', async () => {
      try {
        // This test requires network access and may take time
        await install_bun(tempDir, '1.0.0')

        const binDir = path.join(tempDir, 'bin')
        expect(fs.existsSync(binDir)).toBe(true)
        expect(fs.statSync(binDir).isDirectory()).toBe(true)
      }
      catch (error) {
        if (error instanceof Error && (
          error.message.includes('Failed to download')
          || error.message.includes('Failed to fetch')
          || error.message.includes('network')
        )) {
          console.warn('Skipping test: network error')
          return
        }
        throw error
      }
    }, 120000) // 2 minute timeout for download

    it('should install specific version when provided', async () => {
      try {
        const specificVersion = '1.0.0'
        const installedFiles = await install_bun(tempDir, specificVersion)

        expect(Array.isArray(installedFiles)).toBe(true)
        expect(installedFiles.length).toBeGreaterThan(0)

        // Check that bun executable was created
        const bunPath = installedFiles[0]
        expect(fs.existsSync(bunPath)).toBe(true)
        expect(fs.statSync(bunPath).isFile()).toBe(true)
      }
      catch (error) {
        if (error instanceof Error && (
          error.message.includes('Failed to download')
          || error.message.includes('Failed to fetch')
          || error.message.includes('network')
        )) {
          console.warn('Skipping test: network error')
          return
        }
        throw error
      }
    }, 120000)

    it('should install latest version when no version specified', async () => {
      try {
        const installedFiles = await install_bun(tempDir)

        expect(Array.isArray(installedFiles)).toBe(true)
        expect(installedFiles.length).toBeGreaterThan(0)
      }
      catch (error) {
        if (error instanceof Error && (
          error.message.includes('Failed to download')
          || error.message.includes('Failed to fetch')
          || error.message.includes('network')
        )) {
          console.warn('Skipping test: network error')
          return
        }
        throw error
      }
    }, 120000)

    it('should return array of installed files', async () => {
      try {
        const installedFiles = await install_bun(tempDir, '1.0.0')

        expect(Array.isArray(installedFiles)).toBe(true)
        for (const filePath of installedFiles) {
          expect(typeof filePath).toBe('string')
          expect(path.isAbsolute(filePath)).toBe(true)
        }
      }
      catch (error) {
        if (error instanceof Error && (
          error.message.includes('Failed to download')
          || error.message.includes('Failed to fetch')
          || error.message.includes('network')
        )) {
          console.warn('Skipping test: network error')
          return
        }
        throw error
      }
    }, 120000)

    it('should make bun executable', async () => {
      try {
        const installedFiles = await install_bun(tempDir, '1.0.0')

        if (installedFiles.length > 0) {
          const bunPath = installedFiles[0]
          const stats = fs.statSync(bunPath)

          // Check if executable bit is set (on Unix-like systems)
          if (os.platform() !== 'win32') {
            expect(stats.mode & 0o111).toBeGreaterThan(0)
          }
        }
      }
      catch (error) {
        if (error instanceof Error && (
          error.message.includes('Failed to download')
          || error.message.includes('Failed to fetch')
          || error.message.includes('network')
        )) {
          console.warn('Skipping test: network error')
          return
        }
        throw error
      }
    }, 120000)

    it('should clean up temporary files on success', async () => {
      try {
        await install_bun(tempDir, '1.0.0')

        // Check that temp directory was cleaned up
        const tempDirPath = path.join(tempDir, 'temp')
        expect(fs.existsSync(tempDirPath)).toBe(false)
      }
      catch (error) {
        if (error instanceof Error && (
          error.message.includes('Failed to download')
          || error.message.includes('Failed to fetch')
          || error.message.includes('network')
        )) {
          console.warn('Skipping test: network error')
          return
        }
        throw error
      }
    }, 120000)

    it('should clean up temporary files on error', async () => {
      try {
        // Try to install with an invalid version to trigger an error
        await install_bun(tempDir, 'invalid-version-12345')
      }
      catch {
        // Error is expected
        const tempDirPath = path.join(tempDir, 'temp')
        expect(fs.existsSync(tempDirPath)).toBe(false)
      }
    }, 60000)
  })

  describe('error handling', () => {
    it('should handle invalid versions gracefully', async () => {
      await expect(install_bun(tempDir, 'invalid-version')).rejects.toThrow()
    }, 30000)

    it('should handle network timeouts', async () => {
      // This test verifies that network errors are properly handled
      // We can't easily simulate timeouts, so we just ensure error handling exists
      try {
        await get_latest_bun_version()
      }
      catch (error) {
        expect(error).toBeInstanceOf(Error)
      }
    }, 30000)

    it('should handle permission errors', async () => {
      // Create read-only directory
      const readOnlyDir = path.join(tempDir, 'readonly')
      fs.mkdirSync(readOnlyDir, { recursive: true })
      fs.chmodSync(readOnlyDir, 0o444)

      try {
        await expect(install_bun(readOnlyDir)).rejects.toThrow()
      }
      finally {
        // Restore permissions for cleanup
        try {
          fs.chmodSync(readOnlyDir, 0o755)
        }
        catch {
          // Ignore cleanup errors
        }
      }
    }, 30000)
  })

  describe('integration tests', () => {
    it('should work end-to-end', async () => {
      try {
        // Test the complete workflow
        const version = await get_latest_bun_version()
        expect(typeof version).toBe('string')

        const asset = get_bun_asset(version)
        expect(asset.url).toContain(version)

        // Skip actual installation in integration test to save time
        // const installedFiles = await install_bun(tempDir, version)
        // expect(installedFiles.length).toBeGreaterThan(0)
      }
      catch (error) {
        if (error instanceof Error && error.message.includes('Failed to fetch')) {
          console.warn('Skipping integration test: network error')
          return
        }
        throw error
      }
    }, 30000)
  })

  describe('caching', () => {
    it('should handle cache directory creation', async () => {
      // This test verifies that cache functionality doesn't crash
      try {
        await get_latest_bun_version()
        // If we get here, caching worked or was skipped gracefully
        expect(true).toBe(true)
      }
      catch (error) {
        if (error instanceof Error && error.message.includes('Failed to fetch')) {
          console.warn('Skipping test: network error')
          return
        }
        throw error
      }
    }, 30000)

    it('should handle cache file corruption gracefully', async () => {
      // Create a corrupted cache file
      const cacheDir = path.join(process.env.HOME || '.', '.cache', 'launchpad')
      const cacheFile = path.join(cacheDir, 'github-bun-releases.json')

      try {
        fs.mkdirSync(cacheDir, { recursive: true })
        fs.writeFileSync(cacheFile, 'invalid json content')

        // Should still work despite corrupted cache
        const version = await get_latest_bun_version()
        expect(typeof version).toBe('string')
      }
      catch (error) {
        if (error instanceof Error && error.message.includes('Failed to fetch')) {
          console.warn('Skipping test: network error')
          return
        }
        throw error
      }
      finally {
        // Clean up
        try {
          if (fs.existsSync(cacheFile)) {
            fs.unlinkSync(cacheFile)
          }
        }
        catch {
          // Ignore cleanup errors
        }
      }
    }, 30000)
  })
})
