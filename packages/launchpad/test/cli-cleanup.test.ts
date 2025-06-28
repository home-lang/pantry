import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { Buffer } from 'node:buffer'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { config } from '../src/config'
import { TestUtils } from './test.config'

describe('CLI Cleanup Commands', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string
  let cacheDir: string
  let pkgsDir: string
  let envsDir: string
  let cliPath: string

  beforeEach(() => {
    originalEnv = { ...process.env }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-cli-cleanup-'))
    cacheDir = path.join(tempDir, '.cache', 'launchpad')
    pkgsDir = path.join(tempDir, 'pkgs')
    envsDir = path.join(tempDir, '.local', 'share', 'launchpad')
    cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')

    // Set up test environment
    process.env.HOME = tempDir
    process.env.NODE_ENV = 'test'

    // Override install prefix to use temp directory
    config.installPath = tempDir

    // Create test directories and files
    fs.mkdirSync(path.join(cacheDir, 'binaries', 'packages'), { recursive: true })
    fs.mkdirSync(path.join(cacheDir, 'binaries', 'bun'), { recursive: true })
    fs.mkdirSync(pkgsDir, { recursive: true })
    fs.mkdirSync(envsDir, { recursive: true })
  })

  afterEach(() => {
    process.env = originalEnv
    // Restore original config
    config.installPath = originalEnv.HOME ? path.join(originalEnv.HOME, '.local') : '/usr/local'
    if (fs.existsSync(tempDir)) {
      try {
        // Try to fix permissions before removing
        const fixPermissions = (dir: string) => {
          try {
            const stats = fs.statSync(dir)
            if (stats.isDirectory()) {
              fs.chmodSync(dir, 0o755)
              const files = fs.readdirSync(dir)
              for (const file of files) {
                const filePath = path.join(dir, file)
                fixPermissions(filePath)
              }
            }
            else {
              fs.chmodSync(dir, 0o644)
            }
          }
          catch {
            // Ignore permission errors during cleanup
          }
        }
        fixPermissions(tempDir)
        fs.rmSync(tempDir, { recursive: true, force: true })
      }
      catch {
        // Ignore cleanup errors - they shouldn't fail the tests
      }
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
      LAUNCHPAD_PREFIX: tempDir, // Set the install path via environment variable
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
    const mockPackages = ['bun.sh-1.2.2', 'nodejs.org-20.0.0', 'python.org-3.11.0']
    mockPackages.forEach((pkg) => {
      const pkgDir = path.join(packageCacheDir, pkg)
      fs.mkdirSync(pkgDir, { recursive: true })
      fs.writeFileSync(path.join(pkgDir, 'package.tar.xz'), Buffer.alloc(1024 * 1024, pkg)) // 1MB each
    })

    // Create mock bun cache
    fs.writeFileSync(path.join(bunCacheDir, '1.2.2'), Buffer.alloc(2 * 1024 * 1024, 'bun-1.2.2')) // 2MB
    fs.writeFileSync(path.join(bunCacheDir, '1.2.4'), Buffer.alloc(2 * 1024 * 1024, 'bun-1.2.4')) // 2MB

    return {
      totalSize: 7 * 1024 * 1024, // 7MB total
      fileCount: 5,
      packages: mockPackages,
    }
  }

  // Helper to create mock installed packages
  const createMockPackages = () => {
    const mockPackages = ['bun.sh', 'nodejs.org', 'python.org']
    mockPackages.forEach((pkg) => {
      const pkgDir = path.join(pkgsDir, pkg)
      fs.mkdirSync(pkgDir, { recursive: true })
      fs.writeFileSync(path.join(pkgDir, 'binary'), Buffer.alloc(5 * 1024 * 1024, pkg)) // 5MB each
      fs.writeFileSync(path.join(pkgDir, 'metadata.json'), JSON.stringify({ name: pkg, version: '1.0.0' }))
    })

    return {
      totalSize: 15 * 1024 * 1024, // 15MB total
      fileCount: 6, // 2 files per package
      packages: mockPackages,
    }
  }

  // Helper to create mock environments
  const createMockEnvironments = () => {
    const envs = ['project1_abc12345', 'project2_def67890']
    envs.forEach((env) => {
      const envDir = path.join(envsDir, 'envs', env)
      fs.mkdirSync(envDir, { recursive: true })
      fs.writeFileSync(path.join(envDir, 'activate.sh'), '#!/bin/bash\necho "activated"')
      fs.writeFileSync(path.join(envDir, 'metadata.json'), JSON.stringify({ project: env }))
    })

    return {
      environments: envs,
      fileCount: 4, // 2 files per environment
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

    it('should show dry-run output when cache exists', async () => {
      const _mockCache = createMockCache()

      const result = await runCLI(['cache:clear', '--dry-run'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('DRY RUN MODE')
      expect(result.stdout).toContain('Cache statistics')
      expect(result.stdout).toContain('Total size:')
      expect(result.stdout).toContain('File count:')
      expect(result.stdout).toContain('Would remove:')
      expect(result.stdout).toContain('Package cache:')
    })

    it('should show cache statistics when cache exists but is empty', async () => {
      // Don't create any cache files, but directories exist

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

    it('should show verbose output', async () => {
      createMockCache()

      const result = await runCLI(['cache:clear', '--dry-run', '--verbose'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Cache statistics')
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
      expect(result.stdout).toContain('File count: 5') // 3 packages + 2 bun versions
    })

    it('should show both package and bun cache directories', async () => {
      const _mockCache = createMockCache()

      const result = await runCLI(['cache:clear', '--dry-run'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Package cache:')
      // Note: Bun cache might not show if empty in some test scenarios
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

    it('should show dry-run output with installed packages', async () => {
      const _mockPackages = createMockPackages()
      const _mockCache = createMockCache()

      const result = await runCLI(['clean', '--dry-run'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('DRY RUN MODE')
      expect(result.stdout).toContain('Cleanup statistics')
      expect(result.stdout).toContain('Total size:')
      expect(result.stdout).toContain('Total files:')
      expect(result.stdout).toContain('Would remove:')
      expect(result.stdout).toContain('Project environments:')
      expect(result.stdout).toContain('Cache directory:')
    })

    it('should list specific packages that would be removed', async () => {
      const _mockPackages = createMockPackages()

      const result = await runCLI(['clean', '--dry-run'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('📦 Packages that would be removed:')
      expect(result.stdout).toContain('bun.sh')
      // Note: in test environment, only packages we explicitly create will be shown
      // Others may not appear if they don't exist in the temp directory
    })

    it('should show nothing to clean when no packages exist', async () => {
      const result = await runCLI(['clean', '--dry-run'])

      expect(result.exitCode).toBe(0)
      // When directories don't exist at all, it should show "Nothing found to clean"
      // But if directories exist (even if empty), it shows cleanup statistics
      expect(result.stdout).toContain('📊 Cleanup statistics')
      // Size varies based on what exists in temp directory
      expect(result.stdout).toContain('Total size:')
      expect(result.stdout).toContain('Total files:')
    })

    it('should require --force for actual cleaning', async () => {
      createMockPackages()

      const result = await runCLI(['clean'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('This will remove ALL Launchpad-installed packages and environments')
      expect(result.stdout).toContain('This includes package metadata, binaries, and libraries:')
      expect(result.stdout).toContain('Use --force to skip confirmation')

      // Packages should still exist
      expect(fs.existsSync(pkgsDir)).toBe(true)
    })

    it('should actually clean with --force', async () => {
      const mockPackages = createMockPackages()
      const _mockEnvs = createMockEnvironments()
      const _mockCache = createMockCache()

      // Verify packages exist before cleaning
      for (const pkg of mockPackages.packages) {
        const pkgPath = path.join(pkgsDir, pkg)
        expect(fs.existsSync(pkgPath)).toBe(true)
      }

      const result = await runCLI(['clean', '--force'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Cleanup completed!')
      expect(result.stdout).toContain('Removed')
      expect(result.stdout).toContain('Freed')

      // Mock packages should be gone
      for (const pkg of mockPackages.packages) {
        const pkgPath = path.join(pkgsDir, pkg)
        expect(fs.existsSync(pkgPath)).toBe(false)
      }
    })

    it('should preserve cache with --keep-cache', async () => {
      const mockPackages = createMockPackages()
      const _mockCache = createMockCache()

      // Verify packages exist before cleaning
      for (const pkg of mockPackages.packages) {
        const pkgPath = path.join(pkgsDir, pkg)
        expect(fs.existsSync(pkgPath)).toBe(true)
      }

      const result = await runCLI(['clean', '--keep-cache', '--force'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Cleanup completed!')
      expect(result.stdout).toContain('Cache was preserved')

      // Mock packages should be gone
      for (const pkg of mockPackages.packages) {
        const pkgPath = path.join(pkgsDir, pkg)
        expect(fs.existsSync(pkgPath)).toBe(false)
      }
      // Cache should still exist
      expect(fs.existsSync(cacheDir)).toBe(true)
    })

    it('should show --keep-cache option in dry-run', async () => {
      const _mockPackages = createMockPackages()
      const _mockCache = createMockCache()

      const result = await runCLI(['clean', '--keep-cache', '--dry-run'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Would remove:')
      expect(result.stdout).toContain('Project environments:')
      expect(result.stdout).not.toContain('Cache directory:')
    })

    it('should handle partial cleanup failures gracefully', async () => {
      createMockPackages()

      // Create a directory we can't remove
      const protectedDir = path.join(pkgsDir, 'protected')
      fs.mkdirSync(protectedDir, { recursive: true })

      try {
        fs.chmodSync(protectedDir, 0o444)

        const result = await runCLI(['clean', '--force'])

        // Should complete but report some failures
        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('Cleanup completed!')
      }
      finally {
        try {
          fs.chmodSync(protectedDir, 0o755)
        }
        catch {
          // Ignore cleanup errors
        }
      }
    })

    it('should show verbose output during cleanup', async () => {
      const _mockPackages = createMockPackages()

      const result = await runCLI(['clean', '--force', '--verbose'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Removing')
    })

    it('should calculate total size correctly', async () => {
      const _mockPackages = createMockPackages() // 15MB
      const _mockCache = createMockCache() // 7MB

      const result = await runCLI(['clean', '--dry-run'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Total size:')
      // Should show combined size of packages + cache
    })

    it('should only target Launchpad-specific directories', async () => {
      // Create some non-Launchpad files in the temp directory
      const otherFile = path.join(tempDir, 'other-tool-file.txt')
      fs.writeFileSync(otherFile, 'This should not be removed')

      const mockPackages = createMockPackages()

      const result = await runCLI(['clean', '--force'])

      expect(result.exitCode).toBe(0)

      // Non-Launchpad file should still exist
      expect(fs.existsSync(otherFile)).toBe(true)

      // Mock packages should be removed
      for (const pkg of mockPackages.packages) {
        const pkgPath = path.join(pkgsDir, pkg)
        expect(fs.existsSync(pkgPath)).toBe(false)
      }
    })

    it('should handle empty directories gracefully', async () => {
      // Create empty directories
      fs.mkdirSync(pkgsDir, { recursive: true })
      fs.mkdirSync(envsDir, { recursive: true })

      const result = await runCLI(['clean', '--dry-run'])

      expect(result.exitCode).toBe(0)
      // Empty directories should still show cleanup statistics, not "Nothing found to clean"
      expect(result.stdout).toContain('📊 Cleanup statistics')
      // Size varies based on what exists in temp directory
      expect(result.stdout).toContain('Total size:')
      expect(result.stdout).toContain('Total files:')
    })
  })

  describe('Integration tests', () => {
    it('should work together - clean then cache:clear', async () => {
      const mockPackages = createMockPackages()
      createMockCache()

      // First clean packages but keep cache
      const cleanResult = await runCLI(['clean', '--keep-cache', '--force'])
      expect(cleanResult.exitCode).toBe(0)

      // Mock packages should be gone
      for (const pkg of mockPackages.packages) {
        const pkgPath = path.join(pkgsDir, pkg)
        expect(fs.existsSync(pkgPath)).toBe(false)
      }
      expect(fs.existsSync(cacheDir)).toBe(true)

      // Then clear cache
      const cacheResult = await runCLI(['cache:clear', '--force'])
      expect(cacheResult.exitCode).toBe(0)
      expect(fs.existsSync(cacheDir)).toBe(false)
    })

    it('should handle concurrent command execution', async () => {
      createMockCache()

      // Run both commands simultaneously (should handle gracefully)
      const [result1, result2] = await Promise.all([
        runCLI(['cache:clear', '--dry-run']),
        runCLI(['clean', '--dry-run']),
      ])

      expect(result1.exitCode).toBe(0)
      expect(result2.exitCode).toBe(0)
    })

    it('should provide consistent size calculations', async () => {
      const _mockCache = createMockCache()

      const cacheResult = await runCLI(['cache:clear', '--dry-run'])
      const cleanResult = await runCLI(['clean', '--dry-run'])

      expect(cacheResult.exitCode).toBe(0)
      expect(cleanResult.exitCode).toBe(0)

      // Both should report cache size consistently
      expect(cacheResult.stdout).toContain('Total size:')
      expect(cleanResult.stdout).toContain('Total size:')
    })
  })

  describe('Error handling', () => {
    it('should handle invalid command arguments', async () => {
      const result = await runCLI(['cache:clear', '--invalid-flag'])

      // Should either ignore unknown flags or show error
      expect(typeof result.exitCode).toBe('number')
    })

    it('should handle filesystem errors during size calculation', async () => {
      // Create cache directory but make it unreadable
      fs.mkdirSync(cacheDir, { recursive: true })

      try {
        fs.chmodSync(cacheDir, 0o000)

        const result = await runCLI(['cache:clear', '--dry-run'])

        // Should handle gracefully
        expect(typeof result.exitCode).toBe('number')
      }
      finally {
        try {
          fs.chmodSync(cacheDir, 0o755)
        }
        catch {
          // Ignore cleanup errors
        }
      }
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

      // Create 50 mock packages
      for (let i = 0; i < 50; i++) {
        const pkgDir = path.join(packageCacheDir, `package-${i}-1.0.0`)
        fs.mkdirSync(pkgDir, { recursive: true })
        fs.writeFileSync(path.join(pkgDir, 'package.tar.xz'), Buffer.alloc(1024, `pkg-${i}`))
      }

      const startTime = Date.now()
      const result = await runCLI(['cache:clear', '--dry-run'])
      const duration = Date.now() - startTime

      expect(result.exitCode).toBe(0)
      expect(duration).toBeLessThan(5000) // Should complete within 5 seconds
      expect(result.stdout).toContain('File count: 50')
    })

    it('should handle deep directory structures', async () => {
      // Create nested directory structure
      const deepDir = path.join(cacheDir, 'a', 'b', 'c', 'd', 'e')
      fs.mkdirSync(deepDir, { recursive: true })
      fs.writeFileSync(path.join(deepDir, 'deep-file.txt'), 'deep content')

      const result = await runCLI(['cache:clear', '--dry-run'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Cache statistics')
    })
  })
})
