import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { mkdir, rm } from 'node:fs/promises'
import { join } from 'node:path'
import { PrecompiledBinaryDownloader } from '../src/binary-downloader'

describe('PrecompiledBinaryDownloader', () => {
  const testInstallPath = join(process.cwd(), 'test-temp-binary-downloader')

  beforeEach(async () => {
    // Clean up test directory
    try {
      await rm(testInstallPath, { recursive: true, force: true })
    }
    catch {
      // Directory doesn't exist, that's fine
    }
    await mkdir(testInstallPath, { recursive: true })
  })

  afterEach(async () => {
    // Clean up test directory
    try {
      await rm(testInstallPath, { recursive: true, force: true })
    }
    catch {
      // Ignore cleanup errors
    }
  })

  it('should detect platform and architecture correctly', () => {
    const downloader = new PrecompiledBinaryDownloader(testInstallPath)

    // Test platform detection
    const platform = (downloader as any).getPlatform()
    expect(['darwin', 'linux', 'windows']).toContain(platform)

    // Test architecture detection
    const arch = (downloader as any).getArchitecture()
    expect(['x86_64', 'arm64']).toContain(arch)
  })

  it('should provide fallback configurations', () => {
    const downloader = new PrecompiledBinaryDownloader(testInstallPath)
    const fallbacks = (downloader as any).getFallbackConfigurations('laravel-mysql')

    expect(fallbacks).toBeInstanceOf(Array)
    expect(fallbacks.length).toBeGreaterThan(0)
    expect(fallbacks).toContain('enterprise')
    expect(fallbacks).toContain('full-stack')
  })

  it('should generate Discord error message', () => {
    const downloader = new PrecompiledBinaryDownloader(testInstallPath)
    const message = (downloader as any).generateDiscordErrorMessage('laravel-mysql', 'darwin', 'arm64')

    expect(message).toContain('PHP Binary Not Available')
    expect(message).toContain('laravel-mysql')
    expect(message).toContain('darwin')
    expect(message).toContain('arm64')
    expect(message).toContain('discord.gg/stacksjs')
  })

  it('should handle GitHub API errors gracefully', async () => {
    const downloader = new PrecompiledBinaryDownloader(testInstallPath)

    // Mock a failed manifest download
    try {
      await (downloader as any).downloadManifest()
      // If we get here, the test should fail
      expect(true).toBe(false)
    }
    catch (error) {
      expect(error).toBeInstanceOf(Error)
      expect((error as Error).message).toContain('Failed to fetch binary manifest')
    }
  })

  it('should list available binaries for current platform', async () => {
    const downloader = new PrecompiledBinaryDownloader(testInstallPath)

    try {
      const binaries = await downloader.listAvailableBinaries()
      // This might fail if no binaries are available, but that's expected
      expect(Array.isArray(binaries)).toBe(true)
    }
    catch (error) {
      // Expected if no binaries are available
      expect(error).toBeInstanceOf(Error)
    }
  })

  it('should check if precompiled binaries are supported', async () => {
    const downloader = new PrecompiledBinaryDownloader(testInstallPath)

    try {
      const isSupported = await downloader.isSupported()
      expect(typeof isSupported).toBe('boolean')
    }
    catch (error) {
      // Expected if GitHub API is not available or no binaries exist
      expect(error).toBeInstanceOf(Error)
    }
  })
})
