import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { Buffer } from 'node:buffer'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { TestUtils } from './test.config'

describe('Environment Management Commands', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string
  let cliPath: string
  let envBaseDir: string

  beforeEach(() => {
    originalEnv = { ...process.env }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-env-mgmt-'))
    cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
    envBaseDir = path.join(tempDir, '.local', 'share', 'launchpad')

    // Set up test environment
    process.env.HOME = tempDir
    process.env.NODE_ENV = 'test'

    // Create environments base directory
    fs.mkdirSync(envBaseDir, { recursive: true })
  })

  afterEach(() => {
    process.env = originalEnv
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
    TestUtils.cleanupEnvironmentDirs()
  })

  // Helper function to run CLI commands
  async function runCLI(args: string[], cwd?: string): Promise<{ exitCode: number, stdout: string, stderr: string }> {
    return new Promise((resolve) => {
      // Ensure we have a proper PATH that includes system directories
      const testEnv = {
        ...process.env,
        NODE_ENV: 'test',
        PATH: process.env.PATH?.includes('/usr/local/bin')
          ? process.env.PATH
          : `/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${process.env.PATH || ''}`,
      }

      const proc = spawn('bun', ['run', cliPath, ...args], {
        cwd: cwd || process.cwd(),
        stdio: ['ignore', 'pipe', 'pipe'],
        env: testEnv,
      })

      let stdout = ''
      let stderr = ''

      proc.stdout?.on('data', (data) => {
        stdout += data.toString()
      })

      proc.stderr?.on('data', (data) => {
        stderr += data.toString()
      })

      proc.on('close', (code) => {
        resolve({ exitCode: code || 0, stdout, stderr })
      })
    })
  }

  // Helper function to create mock environments
  function createMockEnvironment(hash: string, options: {
    packages?: string[]
    binaries?: string[]
    size?: number
    ageInDays?: number
  } = {}) {
    const envPath = path.join(envBaseDir, hash)
    const binDir = path.join(envPath, 'bin')
    const packagesDir = path.join(envPath, 'pkgs')

    fs.mkdirSync(binDir, { recursive: true })
    fs.mkdirSync(packagesDir, { recursive: true })

    // Create mock packages
    ;(options.packages || []).forEach((pkg: string) => {
      const pkgDir = path.join(packagesDir, pkg)
      fs.mkdirSync(pkgDir, { recursive: true })
      fs.writeFileSync(path.join(pkgDir, 'metadata.json'), JSON.stringify({ name: pkg }))
    })

    // Create mock binaries
    ;(options.binaries || []).forEach((bin: string) => {
      const binPath = path.join(binDir, bin)
      fs.writeFileSync(binPath, `#!/bin/bash\necho "Mock ${bin}"\n`)
      fs.chmodSync(binPath, 0o755)
    })

    // Add some content for size calculation
    if (options.size) {
      const contentFile = path.join(envPath, 'content.dat')
      const buffer = Buffer.alloc(options.size, 'A')
      fs.writeFileSync(contentFile, buffer)
    }

    // Set age by modifying timestamps
    if (options.ageInDays) {
      const ageMs = options.ageInDays * 24 * 60 * 60 * 1000
      const pastDate = new Date(Date.now() - ageMs)
      fs.utimesSync(envPath, pastDate, pastDate)
    }

    return envPath
  }

  describe('env:list command', () => {
    it('should show no environments when none exist', async () => {
      const result = await runCLI(['env:list'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('📭 No development environments found')
    })

    it('should list environments in table format by default', async () => {
      // Create mock environments
      createMockEnvironment('test-project_1a2b3c4d', {
        packages: ['nodejs.org@22.0.0'],
        binaries: ['node', 'npm'],
      })
      createMockEnvironment('another-app_5e6f7g8h', {
        packages: ['python.org@3.12.0'],
        binaries: ['python', 'pip'],
      })

      const result = await runCLI(['env:list'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('📦 Development Environments:')
      expect(result.stdout).toContain('test-project')
      expect(result.stdout).toContain('another-app')
      expect(result.stdout).toContain('Total: 2 environment(s)')
    })

    it('should show verbose information including hashes', async () => {
      createMockEnvironment('verbose-test_9a8b7c6d', {
        packages: ['git.scm@2.42.0'],
        binaries: ['git'],
      })

      const result = await runCLI(['env:list', '--verbose'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('verbose-test_9a8b7c6d')
      expect(result.stdout).toContain('Hash')
    })

    it('should output JSON format', async () => {
      createMockEnvironment('json-test_1234abcd', {
        packages: ['curl.se@8.5.0'],
        binaries: ['curl'],
      })

      const result = await runCLI(['env:list', '--format', 'json'])

      expect(result.exitCode).toBe(0)

      // Should be valid JSON
      expect(() => JSON.parse(result.stdout)).not.toThrow()

      const data = JSON.parse(result.stdout)
      expect(Array.isArray(data)).toBe(true)
      expect(data.length).toBe(1)
      expect(data[0]).toHaveProperty('hash', 'json-test_1234abcd')
      expect(data[0]).toHaveProperty('projectName', 'json-test')
      expect(data[0]).toHaveProperty('packages', 1)
      expect(data[0]).toHaveProperty('binaries', 1)
    })

    it('should output simple format', async () => {
      createMockEnvironment('simple-test_abcd1234', {
        packages: ['wget.gnu@1.21.0'],
        binaries: ['wget'],
      })

      const result = await runCLI(['env:list', '--format', 'simple'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout.trim()).toBe('simple-test (simple-test_abcd1234)')
    })

    it('should work with env:ls alias', async () => {
      createMockEnvironment('alias-test_fedcba98', {
        packages: ['vim.org@9.0.0'],
        binaries: ['vim'],
      })

      const result = await runCLI(['env:ls'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('alias-test')
    })
  })

  describe('env:inspect command', () => {
    it('should show error for non-existent environment', async () => {
      const result = await runCLI(['env:inspect', 'non-existent_12345678'])

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('❌ Environment not found: non-existent_12345678')
    })

    it('should inspect environment with basic information', async () => {
      createMockEnvironment('inspect-test_87654321', {
        packages: ['node.js@20.0.0', 'python.org@3.11.0'],
        binaries: ['node', 'npm', 'python', 'pip'],
        size: 1024 * 1024, // 1MB
      })

      const result = await runCLI(['env:inspect', 'inspect-test_87654321'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('🔍 Inspecting environment: inspect-test_87654321')
      expect(result.stdout).toContain('Project Name: inspect-test')
      expect(result.stdout).toContain('📋 Basic Information:')
      expect(result.stdout).toContain('📦 Installed Packages:')
      expect(result.stdout).toContain('🔧 BIN Binaries:')
      expect(result.stdout).toContain('🏥 Health Check:')
      expect(result.stdout).toContain('node.js@20.0.0')
      expect(result.stdout).toContain('python.org@3.11.0')
    })

    it('should show verbose directory structure', async () => {
      const envPath = createMockEnvironment('verbose-inspect_abcdef12', {
        packages: ['test-package@1.0.0'],
        binaries: ['test-bin'],
      })

      // Create additional directories for verbose output
      fs.mkdirSync(path.join(envPath, 'lib'), { recursive: true })
      fs.mkdirSync(path.join(envPath, 'share'), { recursive: true })
      fs.writeFileSync(path.join(envPath, 'lib', 'test.so'), 'mock library')
      fs.writeFileSync(path.join(envPath, 'share', 'test.txt'), 'mock share file')

      const result = await runCLI(['env:inspect', 'verbose-inspect_abcdef12', '--verbose'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('📁 Directory Structure:')
      expect(result.stdout).toContain('lib/: 1 item(s)')
      expect(result.stdout).toContain('share/: 1 item(s)')
    })

    it('should show binary stub contents when requested', async () => {
      createMockEnvironment('stub-test_12345abc', {
        packages: ['test-package@1.0.0'],
        binaries: ['test-stub'],
      })

      const result = await runCLI(['env:inspect', 'stub-test_12345abc', '--show-stubs'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('📄 Binary Stub Contents:')
      expect(result.stdout).toContain('test-stub:')
      expect(result.stdout).toContain('#!/bin/bash')
    })

    it('should detect unhealthy environments', async () => {
      // Create environment with no binaries (unhealthy)
      createMockEnvironment('unhealthy-test_deadbeef', {
        packages: ['some-package@1.0.0'],
        binaries: [], // No binaries = unhealthy
      })

      const result = await runCLI(['env:inspect', 'unhealthy-test_deadbeef'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('❌ Binaries present')
      expect(result.stdout).toContain('⚠️  Issues detected')
    })
  })

  describe('env:clean command', () => {
    it('should show no environments to clean when all are recent', async () => {
      // Create recent environment (0 days old)
      createMockEnvironment('recent-env_11111111', {
        packages: ['test@1.0.0'],
        binaries: ['test'],
        ageInDays: 0,
      })

      const result = await runCLI(['env:clean'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('📭 No environments need cleaning')
    })

    it('should identify old environments for cleanup', async () => {
      // Create old environment (45 days old, default threshold is 30)
      createMockEnvironment('old-env_22222222', {
        packages: ['old-package@1.0.0'],
        binaries: ['old-bin'],
        ageInDays: 45,
      })

      const result = await runCLI(['env:clean', '--dry-run'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('🔍 DRY RUN MODE')
      expect(result.stdout).toContain('Would clean 1 environment(s)')
      expect(result.stdout).toContain('old-env_22222222')
      expect(result.stdout).toContain('45 days old')
    })

    it('should identify empty environments for cleanup', async () => {
      // Create empty environment (no packages or binaries)
      createMockEnvironment('empty-env_33333333', {
        packages: [],
        binaries: [],
        ageInDays: 5, // Recent but empty
      })

      const result = await runCLI(['env:clean', '--dry-run'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Would clean 1 environment(s)')
      expect(result.stdout).toContain('empty-env_33333333')
      expect(result.stdout).toContain('empty')
    })

    it('should respect custom older-than threshold', async () => {
      // Create environment 15 days old
      createMockEnvironment('medium-age_44444444', {
        packages: ['test@1.0.0'],
        binaries: ['test'],
        ageInDays: 15,
      })

      // With default 30 day threshold, should not clean
      const result1 = await runCLI(['env:clean', '--dry-run'])
      expect(result1.stdout).toContain('📭 No environments need cleaning')

      // With 7 day threshold, should clean
      const result2 = await runCLI(['env:clean', '--older-than', '7', '--dry-run'])
      expect(result2.stdout).toContain('Would clean 1 environment(s)')
      expect(result2.stdout).toContain('medium-age_44444444')
    })

    it('should require --force for actual cleanup', async () => {
      createMockEnvironment('force-test_55555555', {
        packages: [],
        binaries: [],
        ageInDays: 50,
      })

      const result = await runCLI(['env:clean'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('⚠️  This will permanently delete the environments listed above!')
      expect(result.stdout).toContain('Use --force to skip this confirmation')
    })

    it('should actually clean environments with --force', async () => {
      const envPath = createMockEnvironment('cleanup-me_66666666', {
        packages: [],
        binaries: [],
        ageInDays: 50,
      })

      // Verify environment exists
      expect(fs.existsSync(envPath)).toBe(true)

      const result = await runCLI(['env:clean', '--force'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('✅ Environment cleanup completed!')
      expect(result.stdout).toContain('Removed: 1/1 environment(s)')

      // Verify environment was removed
      expect(fs.existsSync(envPath)).toBe(false)
    })

    it('should show verbose cleanup details', async () => {
      createMockEnvironment('verbose-cleanup_77777777', {
        packages: [],
        binaries: [],
        ageInDays: 50,
      })

      const result = await runCLI(['env:clean', '--dry-run', '--verbose'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Path:')
      expect(result.stdout).toContain('Last modified:')
    })
  })

  describe('env:remove command', () => {
    it('should show error for non-existent environment', async () => {
      const result = await runCLI(['env:remove', 'does-not-exist_12345678'])

      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('❌ Environment not found: does-not-exist_12345678')
    })

    it('should require --force for actual removal', async () => {
      createMockEnvironment('remove-test_88888888', {
        packages: ['test@1.0.0'],
        binaries: ['test'],
      })

      const result = await runCLI(['env:remove', 'remove-test_88888888'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('🗑️  Removing environment: remove-test_88888888')
      expect(result.stdout).toContain('⚠️  This will permanently delete this environment!')
      expect(result.stdout).toContain('Use --force to skip this confirmation')
    })

    it('should actually remove environment with --force', async () => {
      const envPath = createMockEnvironment('force-remove_99999999', {
        packages: ['test@1.0.0'],
        binaries: ['test'],
        size: 2048, // 2KB
      })

      // Verify environment exists
      expect(fs.existsSync(envPath)).toBe(true)

      const result = await runCLI(['env:remove', 'force-remove_99999999', '--force'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('✅ Environment removed successfully!')
      expect(result.stdout).toContain('Freed:')

      // Verify environment was removed
      expect(fs.existsSync(envPath)).toBe(false)
    })

    it('should show verbose removal details', async () => {
      createMockEnvironment('verbose-remove_aaaaaaaa', {
        packages: ['test1@1.0.0', 'test2@2.0.0'],
        binaries: ['test1', 'test2', 'test3'],
      })

      const result = await runCLI(['env:remove', 'verbose-remove_aaaaaaaa', '--verbose'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('Packages: 2')
      expect(result.stdout).toContain('Binaries: 3')
    })

    it('should handle removal errors gracefully', async () => {
      const envPath = createMockEnvironment('error-test_bbbbbbbb', {
        packages: ['test@1.0.0'],
        binaries: ['test'],
      })

      // Make directory read-only to cause removal error
      try {
        fs.chmodSync(envPath, 0o444)

        const result = await runCLI(['env:remove', 'error-test_bbbbbbbb', '--force'])

        expect(result.exitCode).toBe(1)
        expect(result.stderr).toContain('❌ Failed to remove environment:')
      }
      finally {
        // Restore permissions for cleanup
        try {
          fs.chmodSync(envPath, 0o755)
        }
        catch {
          // Ignore cleanup errors
        }
      }
    })

    describe('--all option', () => {
      it('should require either hash or --all option', async () => {
        const result = await runCLI(['env:remove'])

        expect(result.exitCode).toBe(1)
        expect(result.stderr).toContain('Either provide a hash or use --all to remove all environments')
        expect(result.stdout).toContain('Usage:')
        expect(result.stdout).toContain('launchpad env:remove <hash>')
        expect(result.stdout).toContain('launchpad env:remove --all')
      })

      it('should show message when no environments exist with --all', async () => {
        const result = await runCLI(['env:remove', '--all', '--force'])

        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('📭 No development environments found')
      })

      it('should require --force for --all removal', async () => {
        createMockEnvironment('all-test-1_12345678', {
          packages: ['test1@1.0.0'],
          binaries: ['test1'],
        })
        createMockEnvironment('all-test-2_87654321', {
          packages: ['test2@2.0.0'],
          binaries: ['test2'],
        })

        const result = await runCLI(['env:remove', '--all'])

        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('🗑️  Removing all 2 development environments')
        expect(result.stdout).toContain('⚠️  This will permanently delete ALL development environments!')
        expect(result.stdout).toContain('Use --force to skip this confirmation')
      })

      it('should remove all environments with --all --force', async () => {
        const env1Path = createMockEnvironment('all-remove-1_aaaaaaaa', {
          packages: ['pkg1@1.0.0'],
          binaries: ['bin1'],
          size: 1024, // 1KB
        })
        const env2Path = createMockEnvironment('all-remove-2_bbbbbbbb', {
          packages: ['pkg2@2.0.0', 'pkg3@3.0.0'],
          binaries: ['bin2', 'bin3'],
          size: 2048, // 2KB
        })
        const env3Path = createMockEnvironment('all-remove-3_cccccccc', {
          packages: [],
          binaries: [],
          size: 512, // 0.5KB
        })

        // Verify all environments exist
        expect(fs.existsSync(env1Path)).toBe(true)
        expect(fs.existsSync(env2Path)).toBe(true)
        expect(fs.existsSync(env3Path)).toBe(true)

        const result = await runCLI(['env:remove', '--all', '--force'])

        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('🗑️  Removing all 3 development environments')
        expect(result.stdout).toContain('✅ All environments removal completed!')
        expect(result.stdout).toContain('Removed: 3/3 environment(s)')
        expect(result.stdout).toContain('Freed:')

        // Verify all environments were removed
        expect(fs.existsSync(env1Path)).toBe(false)
        expect(fs.existsSync(env2Path)).toBe(false)
        expect(fs.existsSync(env3Path)).toBe(false)
      })

      it('should show verbose details with --all --verbose', async () => {
        createMockEnvironment('verbose-all-1_11111111', {
          packages: ['verbose-pkg1@1.0.0'],
          binaries: ['verbose-bin1'],
          size: 1024,
        })
        createMockEnvironment('verbose-all-2_22222222', {
          packages: ['verbose-pkg2@2.0.0'],
          binaries: ['verbose-bin2', 'verbose-bin3'],
          size: 2048,
        })

        const result = await runCLI(['env:remove', '--all', '--verbose'])

        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('Environments to remove:')
        expect(result.stdout).toContain('verbose-all-1_11111111 (verbose-all-1)')
        expect(result.stdout).toContain('verbose-all-2_22222222 (verbose-all-2)')
        expect(result.stdout).toContain('Path:')
        expect(result.stdout).toContain('Packages:')
        expect(result.stdout).toContain('Binaries:')
      })

      it('should handle partial failures gracefully with --all', async () => {
        const goodEnvPath = createMockEnvironment('good-env_12345678', {
          packages: ['good@1.0.0'],
          binaries: ['good'],
          size: 1024,
        })
        const badEnvPath = createMockEnvironment('bad-env_87654321', {
          packages: ['bad@1.0.0'],
          binaries: ['bad'],
          size: 1024,
        })

        // Make one environment read-only to cause removal error
        try {
          fs.chmodSync(badEnvPath, 0o444)

          const result = await runCLI(['env:remove', '--all', '--force'])

          expect(result.exitCode).toBe(0)
          expect(result.stdout).toContain('✅ All environments removal completed!')
          expect(result.stdout).toContain('Removed: 1/2 environment(s)')
          expect(result.stdout).toContain('Failed: 1 environment(s)')

          // Verify good environment was removed, bad one still exists
          expect(fs.existsSync(goodEnvPath)).toBe(false)
          expect(fs.existsSync(badEnvPath)).toBe(true)
        }
        finally {
          // Restore permissions for cleanup
          try {
            fs.chmodSync(badEnvPath, 0o755)
          }
          catch {
            // Ignore cleanup errors
          }
        }
      })

      it('should show verbose progress during --all removal', async () => {
        createMockEnvironment('progress-1_aaaaaaaa', {
          packages: ['progress-pkg1@1.0.0'],
          binaries: ['progress-bin1'],
        })
        createMockEnvironment('progress-2_bbbbbbbb', {
          packages: ['progress-pkg2@2.0.0'],
          binaries: ['progress-bin2'],
        })

        const result = await runCLI(['env:remove', '--all', '--force', '--verbose'])

        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('Removing progress-1_aaaaaaaa (progress-1)...')
        expect(result.stdout).toContain('Removing progress-2_bbbbbbbb (progress-2)...')
        expect(result.stdout).toContain('✅ Removed progress-1_aaaaaaaa')
        expect(result.stdout).toContain('✅ Removed progress-2_bbbbbbbb')
      })

      it('should calculate total size correctly for --all removal', async () => {
        createMockEnvironment('size-test-1_11111111', {
          packages: ['size-pkg1@1.0.0'],
          binaries: ['size-bin1'],
          size: 1024 * 1024, // 1MB
        })
        createMockEnvironment('size-test-2_22222222', {
          packages: ['size-pkg2@2.0.0'],
          binaries: ['size-bin2'],
          size: 2 * 1024 * 1024, // 2MB
        })

        const result = await runCLI(['env:remove', '--all', '--force'])

        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('🗑️  Removing all 2 development environments')
        expect(result.stdout).toContain('Total size:')
        expect(result.stdout).toContain('✅ All environments removal completed!')
        expect(result.stdout).toContain('Freed:')
      })
    })
  })

  describe('Integration tests', () => {
    it('should handle multiple environments across all commands', async () => {
      // Create a mix of environments
      createMockEnvironment('healthy-recent_11111111', {
        packages: ['node@22'],
        binaries: ['node', 'npm'],
        ageInDays: 5,
      })

      createMockEnvironment('healthy-old_22222222', {
        packages: ['python@3.12'],
        binaries: ['python', 'pip'],
        ageInDays: 45,
      })

      createMockEnvironment('empty-env_33333333', {
        packages: [],
        binaries: [],
        ageInDays: 10,
      })

      // Test listing shows all environments
      const listResult = await runCLI(['env:list'])
      expect(listResult.exitCode).toBe(0)
      expect(listResult.stdout).toContain('Total: 3 environment(s)')

      // Test cleaning identifies problematic environments
      const cleanResult = await runCLI(['env:clean', '--dry-run'])
      expect(cleanResult.exitCode).toBe(0)
      expect(cleanResult.stdout).toContain('Would clean 2 environment(s)') // old + empty

      // Test inspect works for healthy environment
      const inspectResult = await runCLI(['env:inspect', 'healthy-recent_11111111'])
      expect(inspectResult.exitCode).toBe(0)
      expect(inspectResult.stdout).toContain('✅ Healthy')
    })

    it('should show proper error messages when environments directory does not exist', async () => {
      // Remove the environments directory entirely
      fs.rmSync(envBaseDir, { recursive: true, force: true })

      const result = await runCLI(['env:list'])
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('📭 No development environments found')
    })

    it('should handle concurrent operations safely', async () => {
      createMockEnvironment('concurrent-test_12345678', {
        packages: ['test@1.0.0'],
        binaries: ['test'],
      })

      // Run multiple operations simultaneously
      const [listResult, inspectResult] = await Promise.all([
        runCLI(['env:list']),
        runCLI(['env:inspect', 'concurrent-test_12345678']),
      ])

      expect(listResult.exitCode).toBe(0)
      expect(inspectResult.exitCode).toBe(0)
    })
  })
})
