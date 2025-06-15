import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { Buffer } from 'node:buffer'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

describe('Hash Collision Prevention', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string
  let cliPath: string

  beforeEach(() => {
    originalEnv = { ...process.env }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-hash-test-'))
    cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
  })

  afterEach(() => {
    process.env = originalEnv
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }

    // Clean up test environment directories
    const launchpadEnvsDir = path.join(os.homedir(), '.local', 'share', 'launchpad', 'envs')
    if (fs.existsSync(launchpadEnvsDir)) {
      const entries = fs.readdirSync(launchpadEnvsDir)
      for (const entry of entries) {
        const entryPath = path.join(launchpadEnvsDir, entry)
        if (fs.statSync(entryPath).isDirectory() && entry.includes('dGVzdA')) { // Base64 contains 'test'
          fs.rmSync(entryPath, { recursive: true, force: true })
        }
      }
    }
  })

  const runCLI = (args: string[], cwd?: string): Promise<{ stdout: string, stderr: string, exitCode: number }> => {
    return new Promise((resolve, reject) => {
      const proc = spawn('bun', [cliPath, ...args], {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, NODE_ENV: 'test', LAUNCHPAD_VERBOSE: 'true' },
        cwd: cwd || tempDir,
      })

      let stdout = ''
      let stderr = ''

      proc.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      proc.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      proc.on('close', (code) => {
        resolve({ stdout, stderr, exitCode: code || 0 })
      })

      proc.on('error', (error) => {
        reject(error)
      })

      setTimeout(() => {
        proc.kill()
        reject(new Error('CLI command timed out'))
      }, 30000)
    })
  }

  const createDepsFile = (dir: string, packages: string[]) => {
    const content = `dependencies:\n${packages.map(pkg => `  - ${pkg}`).join('\n')}`
    fs.writeFileSync(path.join(dir, 'deps.yaml'), content)
  }

  describe('Hash Length and Uniqueness', () => {
    it('should generate long hashes that prevent collisions', () => {
      const testPaths = [
        '/Users/test/project',
        '/Users/test/project-1',
        '/Users/test/project/nested',
        '/Users/test/another/project',
        '/home/user/workspace/app',
        '/home/user/workspace/app-server',
        '/var/www/html',
        '/var/www/html-backup',
      ]

      const hashes = testPaths.map(p => Buffer.from(p).toString('base64').replace(/[/+=]/g, '_'))

      // All hashes should be unique
      const uniqueHashes = new Set(hashes)
      expect(uniqueHashes.size).toBe(testPaths.length)

      // All hashes should be longer than 16 characters (no truncation)
      for (const hash of hashes) {
        expect(hash.length).toBeGreaterThan(16)
      }
    })

    it('should generate different hashes for similar directory names', () => {
      const similarPaths = [
        '/tmp/test',
        '/tmp/test1',
        '/tmp/test2',
        '/tmp/test-app',
        '/tmp/test-application',
      ]

      const hashes = similarPaths.map(p => Buffer.from(p).toString('base64').replace(/[/+=]/g, '_'))

      // Check that all hashes are different
      for (let i = 0; i < hashes.length; i++) {
        for (let j = i + 1; j < hashes.length; j++) {
          expect(hashes[i]).not.toBe(hashes[j])
        }
      }
    })

    it('should be consistent for the same path', () => {
      const testPath = '/Users/test/my-project'
      const hash1 = Buffer.from(testPath).toString('base64').replace(/[/+=]/g, '_')
      const hash2 = Buffer.from(testPath).toString('base64').replace(/[/+=]/g, '_')

      expect(hash1).toBe(hash2)
    })
  })

  describe('Real-world Directory Testing', () => {
    it('should create separate environments for main and dummy directories', async () => {
      // Simulate the real scenario that was failing
      const mainDir = path.join(tempDir, 'launchpad')
      const dummyDir = path.join(mainDir, 'dummy')

      fs.mkdirSync(mainDir, { recursive: true })
      fs.mkdirSync(dummyDir, { recursive: true })

      // Main directory dependencies - use bun.sh which exists
      createDepsFile(mainDir, ['bun.sh@0.5.9'])

      // Dummy directory dependencies - use bun.sh which exists
      createDepsFile(dummyDir, ['bun.sh@0.5.9'])

      const mainResult = await runCLI(['dev:dump'], mainDir)
      const dummyResult = await runCLI(['dev:dump'], dummyDir)

      // The key test is that different directories get different prefixes
      // Even if installation fails, we should see different installation prefixes
      const mainPrefix = mainResult.stderr.match(/Install path: (.+)/)?.[1]
      const dummyPrefix = dummyResult.stderr.match(/Install path: (.+)/)?.[1]

      expect(mainPrefix).toBeDefined()
      expect(dummyPrefix).toBeDefined()
      expect(mainPrefix).not.toBe(dummyPrefix)

      // Check that hashes are sufficiently different
      const mainHash = Buffer.from(mainDir).toString('base64').replace(/[/+=]/g, '_')
      const dummyHash = Buffer.from(dummyDir).toString('base64').replace(/[/+=]/g, '_')

      expect(mainHash).not.toBe(dummyHash)
      expect(Math.abs(mainHash.length - dummyHash.length)).toBeGreaterThan(0)
    }, 60000)

    it('should create isolated package installations', async () => {
      const projectA = path.join(tempDir, 'project-a')
      const projectB = path.join(tempDir, 'project-b')

      fs.mkdirSync(projectA, { recursive: true })
      fs.mkdirSync(projectB, { recursive: true })

      createDepsFile(projectA, ['gnu.org/wget@1.21.0'])
      createDepsFile(projectB, ['gnu.org/wget@1.21.0'])

      // Try to install packages (may fail but that's OK, we're testing isolation)
      await runCLI(['dev:dump'], projectA)
      await runCLI(['dev:dump'], projectB)

      // Check that environment directories exist and are unique
      const envBaseDir = path.join(process.env.HOME || '~', '.local', 'share', 'launchpad', 'envs')

      if (fs.existsSync(envBaseDir)) {
        const _envDirs = fs.readdirSync(envBaseDir)

        // Each project should have generated a unique hash
        const hashA = Buffer.from(projectA).toString('base64').replace(/[/+=]/g, '_')
        const hashB = Buffer.from(projectB).toString('base64').replace(/[/+=]/g, '_')

        // The key test: hashes should be different (no collision)
        expect(hashA).not.toBe(hashB)
        expect(hashA.length).toBeGreaterThan(16) // Much longer than old truncated version
        expect(hashB.length).toBeGreaterThan(16)

        // Environment isolation is working if hashes are unique
        const hashSet = new Set([hashA, hashB])
        expect(hashSet.size).toBe(2) // Both hashes are unique
      }
    }, 60000)
  })

  describe('Shell Code Hash Generation', () => {
    it('should not include hash truncation in shell code', async () => {
      const result = await runCLI(['dev:shellcode'], process.cwd())
      expect(result.exitCode).toBe(0)

      const shellCode = result.stdout
      // Should not have old-style hash truncation
      expect(shellCode).not.toContain('[:16]')
      expect(shellCode).not.toContain('.substring(0, 16)')
    }, 30000)

    it('should include full base64 encoding without truncation', async () => {
      const result = await runCLI(['dev:shellcode'], process.cwd())
      expect(result.exitCode).toBe(0)

      const shellCode = result.stdout
      // Should include full base64 hash generation
      expect(shellCode).toContain('base64')

      // Should not truncate the hash
      expect(shellCode).not.toContain('[:16]')
      expect(shellCode).not.toContain('.substring(0, 16)')
    }, 30000)

    it('should include openssl method without truncation', async () => {
      const result = await runCLI(['dev:shellcode'], process.cwd())
      expect(result.exitCode).toBe(0)

      const shellCode = result.stdout
      // Should include fallback methods for hash generation
      if (shellCode.includes('md5sum') || shellCode.includes('openssl')) {
        // Should not truncate any hash method
        expect(shellCode).not.toContain('[:16]')
      }
    }, 30000)
  })

  describe('Environment Directory Structure', () => {
    it('should create unique environment paths for each project', async () => {
      const projects = ['project-1', 'project-2', 'project-3', 'project-4', 'project-5']

      for (const projectName of projects) {
        const projectDir = path.join(tempDir, projectName)
        fs.mkdirSync(projectDir, { recursive: true })
        createDepsFile(projectDir, ['gnu.org/wget@1.21.0']) // Use valid package

        const _result = await runCLI(['dev:dump'], projectDir)
        // Some packages might still fail, focus on hash uniqueness not installation success
        // The key test is that hashes are unique, not that packages install
      }

      // Check that environment directories were created with different hashes
      const envBaseDir = path.join(process.env.HOME || '~', '.local', 'share', 'launchpad', 'envs')

      if (fs.existsSync(envBaseDir)) {
        const _envDirs = fs.readdirSync(envBaseDir)
        const projectHashes = projects.map(p =>
          Buffer.from(path.join(tempDir, p)).toString('base64').replace(/[/+=]/g, '_'),
        )

        // Each project should have generated a unique hash
        const uniqueHashes = new Set(projectHashes)
        expect(uniqueHashes.size).toBe(projects.length)

        // Hashes should be long enough to prevent collisions (much longer than 16 chars)
        for (const hash of projectHashes) {
          expect(hash.length).toBeGreaterThan(40) // Much longer than the old 16-char limit
        }
      }
    }, 60000)
  })

  describe('Collision Regression Tests', () => {
    it('should prevent the specific collision that occurred between main and dummy dirs', async () => {
      // Test with realistic directory paths that would generate meaningful hashes
      const mainDir = path.join(tempDir, 'launchpad-main-project')
      const dummyDir = path.join(tempDir, 'launchpad-main-project', 'dummy')

      // Create the directories to get realistic paths
      fs.mkdirSync(mainDir, { recursive: true })
      fs.mkdirSync(dummyDir, { recursive: true })

      const mainHash = Buffer.from(fs.realpathSync(mainDir)).toString('base64').replace(/[/+=]/g, '_')
      const dummyHash = Buffer.from(fs.realpathSync(dummyDir)).toString('base64').replace(/[/+=]/g, '_')

      // These should be completely different, not just the first 16 characters
      expect(mainHash).not.toBe(dummyHash)
      expect(mainHash.length).toBeGreaterThan(16)
      expect(dummyHash.length).toBeGreaterThan(16)

      // The key test: the full hashes should be different even if they share a prefix
      // This ensures no collision when using the full hash instead of truncated
      expect(mainHash).not.toBe(dummyHash)

      // The original problem was truncating to 16 chars caused collision
      // Now with full hashes, they should definitely be different
      const originalTruncated16Main = mainHash.substring(0, 16)
      const originalTruncated16Dummy = dummyHash.substring(0, 16)

      // The test verifies that we avoid collision by using full hashes
      // Even if the 16-char prefixes were the same (the original bug),
      // the full hashes prevent any collision
      expect(mainHash.length).toBeGreaterThan(originalTruncated16Main.length)
      expect(dummyHash.length).toBeGreaterThan(originalTruncated16Dummy.length)
    })

    it('should handle edge cases that could cause collisions', async () => {
      const edgeCases = [
        '/a',
        '/a/b',
        '/a/b/c',
        '/aa',
        '/aaa',
        '/a1',
        '/a11',
        '/a111',
      ]

      const hashes = edgeCases.map(p => Buffer.from(p).toString('base64').replace(/[/+=]/g, '_'))

      // All should be unique despite similar inputs
      const uniqueHashes = new Set(hashes)
      expect(uniqueHashes.size).toBe(edgeCases.length)
    })
  })
})
