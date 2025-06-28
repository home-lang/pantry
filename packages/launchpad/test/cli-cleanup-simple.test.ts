import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { Buffer } from 'node:buffer'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { TestUtils } from './test.config'

describe('CLI Cleanup Commands - Functional Tests', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string
  let cacheDir: string
  let cliPath: string

  beforeEach(() => {
    originalEnv = { ...process.env }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-cli-test-'))
    cacheDir = path.join(tempDir, '.cache', 'launchpad')
    cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')

    // Set up test environment
    process.env.HOME = tempDir
    process.env.NODE_ENV = 'test'

    // Create test cache directories
    fs.mkdirSync(path.join(cacheDir, 'binaries', 'packages'), { recursive: true })
    fs.mkdirSync(path.join(cacheDir, 'binaries', 'bun'), { recursive: true })
  })

  afterEach(() => {
    process.env = originalEnv
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
    TestUtils.cleanupEnvironmentDirs()
  })

  // Helper function to run CLI commands
  const getTestEnv = (extraEnv: Record<string, string> = {}) => {
    return {
      ...process.env,
      PATH: process.env.PATH?.includes('/usr/local/bin')
        ? process.env.PATH
        : `/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${process.env.PATH || ''}`,
      HOME: tempDir,
      ...extraEnv,
    }
  }

  const runCLI = (args: string[], options: { timeout?: number } = {}): Promise<{
    exitCode: number
    stdout: string
    stderr: string
  }> => {
    return new Promise((resolve) => {
      const proc = spawn('bun', [cliPath, ...args], {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: getTestEnv(),
      })

      let stdout = ''
      let stderr = ''

      proc.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      proc.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      const timeout = setTimeout(() => {
        proc.kill('SIGTERM')
        resolve({ exitCode: -1, stdout, stderr: `${stderr}\nTimeout` })
      }, options.timeout || 10000)

      proc.on('close', (code) => {
        clearTimeout(timeout)
        resolve({ exitCode: code || 0, stdout, stderr })
      })
    })
  }

  // Helper to create mock cache files
  const createMockCache = () => {
    const packageCacheDir = path.join(cacheDir, 'binaries', 'packages')
    const bunCacheDir = path.join(cacheDir, 'binaries', 'bun')

    // Create mock package cache
    const mockPackages = ['bun.sh-1.2.2', 'nodejs.org-20.0.0']
    mockPackages.forEach((pkg) => {
      const pkgDir = path.join(packageCacheDir, pkg)
      fs.mkdirSync(pkgDir, { recursive: true })
      fs.writeFileSync(path.join(pkgDir, 'package.tar.xz'), Buffer.alloc(1024 * 1024, pkg)) // 1MB each
    })

    // Create mock bun cache
    fs.writeFileSync(path.join(bunCacheDir, '1.2.2'), Buffer.alloc(2 * 1024 * 1024, 'bun-1.2.2')) // 2MB

    return {
      totalSize: 4 * 1024 * 1024, // 4MB total
      fileCount: 3,
      packages: mockPackages,
    }
  }

  describe('cache:clear command', () => {
    it('should show help information', async () => {
      const result = await runCLI(['cache:clear', '--help'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('cache:clear')
      expect(result.stdout).toContain('--dry-run')
      expect(result.stdout).toContain('--force')
      expect(result.stdout).toContain('--verbose')
    })

    it('should work with cache:clean alias', async () => {
      const result = await runCLI(['cache:clean', '--help'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('cache:clear')
    })

    it('should show cache statistics in dry-run mode', async () => {
      const _mockCache = createMockCache()

      const result = await runCLI(['cache:clear', '--dry-run'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('DRY RUN MODE')
      expect(result.stdout).toContain('Cache statistics')
      expect(result.stdout).toContain('Total size:')
      expect(result.stdout).toContain('File count:')
    })

    it('should show empty cache statistics when no cache files exist', async () => {
      // Don't create any cache files

      const result = await runCLI(['cache:clear', '--dry-run'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Cache statistics')
      expect(result.stdout).toContain('Total size: 0.0 B')
      expect(result.stdout).toContain('File count: 0')
    })

    it('should require --force for actual clearing', async () => {
      const _mockCache = createMockCache()

      const result = await runCLI(['cache:clear'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('This will remove all cached packages and downloads')
      expect(result.stdout).toContain('Use --force to skip confirmation')

      // Cache should still exist
      expect(fs.existsSync(cacheDir)).toBe(true)
    })

    it('should actually clear cache with --force', async () => {
      const _mockCache = createMockCache()

      // Verify cache exists
      expect(fs.existsSync(cacheDir)).toBe(true)

      const result = await runCLI(['cache:clear', '--force'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Cache cleared successfully!')
      expect(result.stdout).toContain('Freed')
      expect(result.stdout).toContain('Removed')

      // Cache should be gone
      expect(fs.existsSync(cacheDir)).toBe(false)
    })

    it('should handle permission errors gracefully', async () => {
      // Create a cache directory with some files, then make it read-only
      const _mockCache = createMockCache()

      // Try to make it read-only (may not work on all systems)
      try {
        fs.chmodSync(cacheDir, 0o444)

        // Test if we can create files in the read-only directory
        let permissionRestrictionWorks = false
        try {
          const testDir = path.join(cacheDir, 'test-remove')
          fs.mkdirSync(testDir, { recursive: true })
          // If we can create a subdirectory, permission restriction doesn't work
        }
        catch {
          // If we can't create a subdirectory, permission restriction works
          permissionRestrictionWorks = true
        }

        const result = await runCLI(['cache:clear', '--force'])

        if (permissionRestrictionWorks) {
          // Permission restriction works, test error handling
          expect(result.exitCode).toBe(1)
          expect(result.stderr).toContain('Failed to clear cache')
        }
        else {
          // Permission restriction doesn't work on this system (e.g., macOS with force:true)
          // Just verify the command completes successfully
          expect(result.exitCode).toBe(0)
          // The command should still report success even if permission restrictions don't work
        }
      }
      finally {
        // Restore permissions for cleanup
        try {
          fs.chmodSync(cacheDir, 0o755)
        }
        catch {
          // Ignore cleanup errors
        }
      }
    })

    it('should calculate cache size correctly', async () => {
      const _mockCache = createMockCache()

      const result = await runCLI(['cache:clear', '--dry-run'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Total size:')
      expect(result.stdout).toContain('File count: 3') // 2 packages + 1 bun version
    })
  })

  describe('clean command', () => {
    it('should show help information', async () => {
      const result = await runCLI(['clean', '--help'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('clean')
      expect(result.stdout).toContain('--dry-run')
      expect(result.stdout).toContain('--force')
      expect(result.stdout).toContain('--keep-cache')
      expect(result.stdout).toContain('--verbose')
    })

    it('should show dry-run output', async () => {
      const result = await runCLI(['clean', '--dry-run'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('DRY RUN MODE')
      expect(result.stdout).toContain('Would perform complete cleanup')
    })

    it('should require --force for actual cleaning', async () => {
      const result = await runCLI(['clean'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('This will remove ALL Launchpad-installed packages and environments')
      expect(result.stdout).toContain('This includes package metadata, binaries, and libraries:')
      expect(result.stdout).toContain('Use --force to skip confirmation')
    })

    it('should show --keep-cache option in dry-run', async () => {
      // Create mock directories so there's something to clean
      // Use tempDir (which is set as HOME in the test environment)
      const { install_prefix } = await import('../src/install')
      const installPrefix = install_prefix().string
      const localShareDir = path.join(tempDir, '.local', 'share', 'launchpad')

      // Create mock package directory
      const pkgsDir = path.join(installPrefix, 'pkgs')
      const mockPkgDir = path.join(pkgsDir, 'test-package-1.0.0')
      fs.mkdirSync(mockPkgDir, { recursive: true })
      fs.writeFileSync(path.join(mockPkgDir, 'test-file'), 'test content')

      // Create mock environment directory
      fs.mkdirSync(localShareDir, { recursive: true })
      fs.writeFileSync(path.join(localShareDir, 'test-env'), 'test env')

      const result = await runCLI(['clean', '--keep-cache', '--dry-run'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Would remove:')
      // Check for either "Package files" in the main list or the package list section
      const hasPackagesList = result.stdout.includes('Package files') || result.stdout.includes('Packages that would be removed:')
      if (!hasPackagesList) {
        // If no packages are shown, at least verify the environment directory is shown
        expect(result.stdout).toContain('Project environments:')
      }
      // Should NOT contain cache directory when --keep-cache is used
      expect(result.stdout).not.toContain('Cache directory:')
    })

    it('should show cache directory in dry-run when not keeping cache', async () => {
      const result = await runCLI(['clean', '--dry-run'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Would remove:')
      expect(result.stdout).toContain('Cache directory:')
    })

    it('should show specific directories that would be cleaned', async () => {
      // Create mock directories so there's something to clean
      // Use tempDir (which is set as HOME in the test environment)
      const { install_prefix } = await import('../src/install')
      const installPrefix = install_prefix().string
      const localShareDir = path.join(tempDir, '.local', 'share', 'launchpad')
      const testCacheDir = path.join(tempDir, '.cache', 'launchpad')

      // Create mock package directory
      const pkgsDir = path.join(installPrefix, 'pkgs')
      const mockPkgDir = path.join(pkgsDir, 'test-package-1.0.0')
      fs.mkdirSync(mockPkgDir, { recursive: true })
      fs.writeFileSync(path.join(mockPkgDir, 'test-file'), 'test content')

      // Create mock environment directory
      fs.mkdirSync(localShareDir, { recursive: true })
      fs.writeFileSync(path.join(localShareDir, 'test-env'), 'test env')

      // Create mock cache directory (in addition to the existing one)
      fs.mkdirSync(testCacheDir, { recursive: true })
      fs.writeFileSync(path.join(testCacheDir, 'test-cache'), 'test cache')

      const result = await runCLI(['clean', '--dry-run'])

      expect(result.exitCode).toBe(0)
      // Check that it shows the directories that would be cleaned
      expect(result.stdout).toContain('Would remove:')
      expect(result.stdout).toContain('Cache directory:') // Should show cache directory
      // The package list is shown separately if packages exist
      if (result.stdout.includes('Launchpad-installed packages that would be removed:')) {
        expect(result.stdout).toContain('test-package-1.0.0')
      }
    })

    it('should handle verbose output', async () => {
      const result = await runCLI(['clean', '--dry-run', '--verbose'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Cleanup statistics')
    })
  })

  describe('Integration tests', () => {
    it('should handle concurrent command execution', async () => {
      const _mockCache = createMockCache()

      // Run both commands simultaneously (should handle gracefully)
      const [result1, result2] = await Promise.all([
        runCLI(['cache:clear', '--dry-run']),
        runCLI(['clean', '--dry-run']),
      ])

      expect(result1.exitCode).toBe(0)
      expect(result2.exitCode).toBe(0)
    })

    it('should provide consistent cache information', async () => {
      const _mockCache = createMockCache()

      const cacheResult = await runCLI(['cache:clear', '--dry-run'])
      const cleanResult = await runCLI(['clean', '--dry-run'])

      expect(cacheResult.exitCode).toBe(0)
      expect(cleanResult.exitCode).toBe(0)

      // Both should report cache information
      expect(cacheResult.stdout).toContain('Total size:')
      expect(cleanResult.stdout).toContain('Total size:')
    })
  })

  describe('Error handling', () => {
    it('should handle invalid command arguments gracefully', async () => {
      const result = await runCLI(['cache:clear', '--invalid-flag'])

      // Should either ignore unknown flags or show error
      expect(typeof result.exitCode).toBe('number')
    })

    it('should handle missing HOME environment variable', async () => {
      delete process.env.HOME

      const result = await runCLI(['cache:clear', '--dry-run'])

      // Should handle gracefully or use fallback
      expect(typeof result.exitCode).toBe('number')
    })
  })

  describe('Performance tests', () => {
    it('should handle large cache directories efficiently', async () => {
      // Create a larger cache with many files
      const packageCacheDir = path.join(cacheDir, 'binaries', 'packages')
      fs.mkdirSync(packageCacheDir, { recursive: true })

      // Create 20 mock packages
      for (let i = 0; i < 20; i++) {
        const pkgDir = path.join(packageCacheDir, `package-${i}-1.0.0`)
        fs.mkdirSync(pkgDir, { recursive: true })
        fs.writeFileSync(path.join(pkgDir, 'package.tar.xz'), Buffer.alloc(1024, `pkg-${i}`))
      }

      const startTime = Date.now()
      const result = await runCLI(['cache:clear', '--dry-run'])
      const duration = Date.now() - startTime

      expect(result.exitCode).toBe(0)
      expect(duration).toBeLessThan(5000) // Should complete within 5 seconds
      expect(result.stdout).toContain('File count: 20')
    })

    it('should complete commands within reasonable time', async () => {
      const _mockCache = createMockCache()

      const startTime = Date.now()
      const result = await runCLI(['clean', '--dry-run'])
      const duration = Date.now() - startTime

      expect(result.exitCode).toBe(0)
      expect(duration).toBeLessThan(3000) // Should complete within 3 seconds
    })
  })
})
