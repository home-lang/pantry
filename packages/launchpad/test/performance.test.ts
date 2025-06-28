import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { TEST_CONFIG, TestUtils } from './test.config.ts'

describe('Performance Benchmarks', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string
  let cliPath: string

  beforeEach(() => {
    originalEnv = { ...process.env }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-perf-test-'))
    cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
  })

  afterEach(() => {
    process.env = originalEnv
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
    TestUtils.cleanupEnvironmentDirs()
  })

  const getTestEnv = (extraEnv: Record<string, string> = {}) => {
    return {
      ...process.env,
      PATH: process.env.PATH?.includes('/usr/local/bin')
        ? process.env.PATH
        : `/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${process.env.PATH || ''}`,
      NODE_ENV: 'test',
      ...extraEnv,
    }
  }

  // Helper function to run CLI commands with timing
  const runCLIWithTiming = (args: string[], cwd?: string): Promise<{
    stdout: string
    stderr: string
    exitCode: number
    duration: number
  }> => {
    return new Promise((resolve, reject) => {
      const startTime = Date.now()
      const proc = spawn('bun', [cliPath, ...args], {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: getTestEnv(),
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
        const duration = Date.now() - startTime
        resolve({
          stdout,
          stderr,
          exitCode: code || 0,
          duration,
        })
      })

      proc.on('error', reject)
    })
  }

  describe('Shell Code Generation Performance', () => {
    it('should generate shell code within 2 seconds', async () => {
      const result = await runCLIWithTiming(['dev:shellcode'], process.cwd())

      expect(result.exitCode).toBe(0)
      expect(result.duration).toBeLessThan(2000) // 2 seconds
      expect(result.stdout).toContain('__launchpad_chpwd')

      console.warn(`📊 Shell code generation took ${result.duration}ms`)
    }, TEST_CONFIG.DEFAULT_TIMEOUT)

    it('should handle repeated shell code generation efficiently', async () => {
      const iterations = 5
      const times: number[] = []

      for (let i = 0; i < iterations; i++) {
        const result = await runCLIWithTiming(['dev:shellcode'], process.cwd())
        expect(result.exitCode).toBe(0)
        times.push(result.duration)
      }

      const avgTime = times.reduce((a, b) => a + b, 0) / times.length
      const maxTime = Math.max(...times)

      expect(avgTime).toBeLessThan(1000) // Average should be under 1 second
      expect(maxTime).toBeLessThan(2000) // No single run should exceed 2 seconds

      console.warn(`📊 Shell code generation average: ${avgTime.toFixed(1)}ms, max: ${maxTime}ms`)
    }, TEST_CONFIG.SLOW_TIMEOUT)
  })

  describe('Hash Generation Performance', () => {
    it('should generate hashes efficiently for many paths', async () => {
      const numPaths = 1000
      const paths: string[] = []

      // Generate test paths (these don't need to exist since generateHash handles that)
      for (let i = 0; i < numPaths; i++) {
        paths.push(`/tmp/test/project-${i}/subdir-${i % 10}`)
      }

      const startTime = Date.now()
      const hashes = new Set<string>()

      for (const testPath of paths) {
        const hash = TestUtils.generateHash(testPath)
        hashes.add(hash)
      }

      const duration = Date.now() - startTime

      expect(duration).toBeLessThan(100) // Should be very fast (under 100ms)
      expect(hashes.size).toBe(numPaths) // All hashes should be unique

      console.warn(`📊 Generated ${numPaths} hashes in ${duration}ms (${(duration / numPaths).toFixed(2)}ms per hash)`)
    })

    it('should verify hash uniqueness quickly', async () => {
      // This test ensures our hash uniqueness verification is fast
      const startTime = Date.now()

      // Test with two different paths that should generate different hashes
      TestUtils.verifyHashUniqueness('/different/path/one', '/different/path/two')

      // If we reach here, the paths generated different hashes (good)
      const duration = Date.now() - startTime
      expect(duration).toBeLessThan(10) // Should check uniqueness very quickly

      console.warn(`📊 Hash uniqueness verification took ${duration}ms`)
    })
  })
})
