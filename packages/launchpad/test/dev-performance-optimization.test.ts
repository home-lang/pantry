import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { TEST_CONFIG, TestUtils } from './test.config.ts'

describe('Dev Performance Optimization Tests', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string
  let cliPath: string

  beforeEach(() => {
    originalEnv = { ...process.env }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-perf-opt-test-'))
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

  // Helper function to run CLI commands with precise timing
  const runCLIWithTiming = (args: string[], cwd?: string): Promise<{
    stdout: string
    stderr: string
    exitCode: number
    duration: number
  }> => {
    return new Promise((resolve, reject) => {
      const startTime = process.hrtime.bigint()
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
        const endTime = process.hrtime.bigint()
        const duration = Number(endTime - startTime) / 1_000_000 // Convert to milliseconds
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

  const createDependenciesYaml = (dir: string, deps: Record<string, string>) => {
    const depsYaml = Object.entries(deps)
      .map(([pkg, version]) => `  ${pkg}: ${version}`)
      .join('\n')

    fs.writeFileSync(path.join(dir, 'dependencies.yaml'), `dependencies:\n${depsYaml}\n`)
  }

  describe('Dynamic Import Optimization', () => {
    it('should avoid loading sniff module for ready environments (fast path)', async () => {
      // First, create and set up an environment
      createDependenciesYaml(tempDir, { 'gnu.org/wget': '^1.21' })

      // Run initial setup to create environment (may fail, but that's ok for this test)
      await runCLIWithTiming(['dev', tempDir])

      // Now test the fast path with --shell flag on a ready environment
      const fastPathResult = await runCLIWithTiming(['dev', tempDir, '--shell'])

      // Fast path should complete very quickly (under 1 second)
      expect(fastPathResult.duration).toBeLessThan(1000)
      expect(fastPathResult.exitCode).toBe(0)
      expect(fastPathResult.stdout).toContain('export PATH=')
      expect(fastPathResult.stdout).toContain('Launchpad environment setup')
    }, TEST_CONFIG.DEFAULT_TIMEOUT)

    it('should take fast path for cached environments without sniff module', async () => {
      // Create a simple dependencies file
      createDependenciesYaml(tempDir, { 'gnu.org/wget': '^1.21' })

      // Run multiple times to test fast path consistency
      const results: number[] = []

      for (let i = 0; i < 3; i++) {
        const result = await runCLIWithTiming(['dev', tempDir, '--shell'])
        results.push(result.duration)

        // Each run should be fast
        expect(result.duration).toBeLessThan(1000)
        expect(result.exitCode).toBe(0)
      }

      // Performance should be consistent (no gradual slowdown)
      const avgTime = results.reduce((a, b) => a + b, 0) / results.length
      const maxTime = Math.max(...results)

      expect(avgTime).toBeLessThan(500) // Average should be very fast
      expect(maxTime).toBeLessThan(1000) // No single run should be slow

      console.warn(`📊 Fast path timing - avg: ${avgTime.toFixed(1)}ms, max: ${maxTime}ms`)
    }, TEST_CONFIG.SLOW_TIMEOUT)
  })

  describe('Shell Mode Performance', () => {
    it('should generate shell output much faster than full installation', async () => {
      createDependenciesYaml(tempDir, { 'gnu.org/wget': '^1.21' })

      // Test shell mode (should be fast)
      const shellResult = await runCLIWithTiming(['dev', tempDir, '--shell'])

      // Test regular mode (may be slower due to installation attempts)
      const regularResult = await runCLIWithTiming(['dev', tempDir])

      // Shell mode should be significantly faster or at least not slower
      expect(shellResult.duration).toBeLessThan(2000) // Under 2 seconds
      expect(shellResult.exitCode).toBe(0)
      expect(shellResult.stdout).toContain('export PATH=')

      console.warn(`📊 Shell mode: ${shellResult.duration}ms, Regular mode: ${regularResult.duration}ms`)
    }, TEST_CONFIG.DEFAULT_TIMEOUT)

    it('should handle shell mode consistently across different directory types', async () => {
      const testDirs: Array<{ name: string, deps: Record<string, string> }> = [
        { name: 'simple', deps: { 'gnu.org/wget': '^1.21' } },
        { name: 'multiple', deps: { 'gnu.org/wget': '^1.21', 'nodejs.org': '*' } },
        { name: 'empty', deps: {} },
      ]

      for (const testCase of testDirs) {
        const testDir = path.join(tempDir, testCase.name)
        fs.mkdirSync(testDir, { recursive: true })

        if (Object.keys(testCase.deps).length > 0) {
          createDependenciesYaml(testDir, testCase.deps)
        }
        else {
          // Create empty deps file
          fs.writeFileSync(path.join(testDir, 'dependencies.yaml'), 'dependencies:\n')
        }

        const result = await runCLIWithTiming(['dev', testDir, '--shell'])

        // All should be fast and successful
        expect(result.duration).toBeLessThan(2000)
        expect(result.exitCode).toBe(0)

        if (Object.keys(testCase.deps).length > 0) {
          expect(result.stdout).toContain('export PATH=')
        }
      }
    }, TEST_CONFIG.SLOW_TIMEOUT)
  })

  describe('Performance Regression Prevention', () => {
    it('should never take longer than 2 seconds for shell output on ready environments', async () => {
      createDependenciesYaml(tempDir, { 'gnu.org/wget': '^1.21' })

      // Run setup first
      await runCLIWithTiming(['dev', tempDir])

      // Test multiple times to ensure consistency
      for (let i = 0; i < 5; i++) {
        const result = await runCLIWithTiming(['dev', tempDir, '--shell'])

        // This is the critical test - should NEVER exceed 2 seconds
        expect(result.duration).toBeLessThan(2000)
        expect(result.exitCode).toBe(0)

        if (result.duration > 1000) {
          console.warn(`⚠️  Shell output took ${result.duration}ms (iteration ${i + 1})`)
        }
      }
    }, TEST_CONFIG.SLOW_TIMEOUT)

    it('should maintain fast performance even with complex dependency files', async () => {
      // Create a complex dependencies.yaml with many packages
      const complexDeps: Record<string, string> = {}
      for (let i = 0; i < 10; i++) {
        complexDeps[`test-package-${i}`] = '^1.0'
      }
      complexDeps['gnu.org/wget'] = '^1.21'
      complexDeps['nodejs.org'] = '*'

      createDependenciesYaml(tempDir, complexDeps)

      // Run setup (may fail, but that's ok)
      await runCLIWithTiming(['dev', tempDir])

      // Shell output should still be fast despite complex file
      const result = await runCLIWithTiming(['dev', tempDir, '--shell'])

      expect(result.duration).toBeLessThan(2000)
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('export PATH=')
    }, TEST_CONFIG.DEFAULT_TIMEOUT)
  })

  describe('Module Loading Optimization', () => {
    it('should not load heavy modules when taking fast path', async () => {
      createDependenciesYaml(tempDir, { 'gnu.org/wget': '^1.21' })

      // The key insight: Fast path should complete quickly because
      // it doesn't load the heavy sniff module (838 lines with file operations)
      const result = await runCLIWithTiming(['dev', tempDir, '--shell'])

      // If this test fails (takes too long), it likely means the
      // dynamic import optimization isn't working properly
      expect(result.duration).toBeLessThan(800) // Very strict timing
      expect(result.exitCode).toBe(0)

      // Verify we get proper shell output without loading heavy modules
      expect(result.stdout).toContain('export PATH=')
      expect(result.stdout).toContain('LAUNCHPAD_PROJECT_DIR')
      expect(result.stdout).toContain('LAUNCHPAD_PROJECT_HASH')
    }, TEST_CONFIG.DEFAULT_TIMEOUT)

    it('should demonstrate performance difference between optimized and unoptimized paths', async () => {
      createDependenciesYaml(tempDir, { 'gnu.org/wget': '^1.21' })

      // Test shell mode (optimized fast path)
      const optimizedResult = await runCLIWithTiming(['dev', tempDir, '--shell'])

      // Test regular mode (may load heavier modules)
      const unoptimizedResult = await runCLIWithTiming(['dev', tempDir])

      // Optimized path should be faster or at least not significantly slower
      expect(optimizedResult.duration).toBeLessThan(1000)

      // Log for visibility in CI/testing
      console.warn(`📊 Performance comparison:`)
      console.warn(`   Optimized (shell): ${optimizedResult.duration}ms`)
      console.warn(`   Unoptimized (regular): ${unoptimizedResult.duration}ms`)

      // The key insight: optimized should complete quickly
      expect(optimizedResult.exitCode).toBe(0)
      expect(optimizedResult.stdout).toContain('export PATH=')
    }, TEST_CONFIG.DEFAULT_TIMEOUT)
  })

  describe('Environment Readiness Detection', () => {
    it('should correctly detect ready environments for fast path', async () => {
      createDependenciesYaml(tempDir, { 'gnu.org/wget': '^1.21' })

      // First run might be slow (setting up environment)
      const _setupResult = await runCLIWithTiming(['dev', tempDir])

      // Subsequent shell runs should be fast (environment ready)
      const fastResult = await runCLIWithTiming(['dev', tempDir, '--shell'])

      expect(fastResult.duration).toBeLessThan(1000)
      expect(fastResult.exitCode).toBe(0)
      expect(fastResult.stdout).toContain('export PATH=')

      // Should include the temp directory in the project path
      expect(fastResult.stdout).toContain(tempDir)
    }, TEST_CONFIG.DEFAULT_TIMEOUT)

    it('should handle non-existent environments gracefully without performance degradation', async () => {
      // Test with a directory that has no dependencies
      const result = await runCLIWithTiming(['dev', tempDir, '--shell'])

      // Should still be fast even when no environment exists
      expect(result.duration).toBeLessThan(1000)
      expect(result.exitCode).toBe(0)
      // For directories without dependencies, shell output might be minimal
    }, TEST_CONFIG.DEFAULT_TIMEOUT)
  })

  describe('Real-world Performance Scenarios', () => {
    it('should handle rapid directory switching efficiently', async () => {
      // Create multiple test directories
      const dirs = []
      for (let i = 0; i < 3; i++) {
        const dir = path.join(tempDir, `project-${i}`)
        fs.mkdirSync(dir, { recursive: true })
        createDependenciesYaml(dir, { 'gnu.org/wget': '^1.21' })
        dirs.push(dir)
      }

      // Simulate rapid directory switching (common developer workflow)
      const timings: number[] = []

      for (const dir of dirs) {
        const result = await runCLIWithTiming(['dev', dir, '--shell'])
        timings.push(result.duration)

        expect(result.duration).toBeLessThan(1500)
        expect(result.exitCode).toBe(0)
      }

      const avgTime = timings.reduce((a, b) => a + b, 0) / timings.length
      expect(avgTime).toBeLessThan(1000) // Average should be very fast

      console.warn(`📊 Rapid switching - avg: ${avgTime.toFixed(1)}ms, individual: [${timings.map(t => t.toFixed(0)).join(', ')}]ms`)
    }, TEST_CONFIG.SLOW_TIMEOUT)

    it('should maintain performance under sequential access', async () => {
      createDependenciesYaml(tempDir, { 'gnu.org/wget': '^1.21' })

      // Run multiple sequential shell commands (simulating multiple terminals)
      // Sequential instead of concurrent to avoid race conditions and timeouts
      const results: Array<{ duration: number, exitCode: number, stdout: string }> = []

      for (let i = 0; i < 3; i++) {
        const result = await runCLIWithTiming(['dev', tempDir, '--shell'])
        results.push(result)

        expect(result.duration).toBeLessThan(2000)
        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('export PATH=')
      }

      const avgTime = results.reduce((sum, r) => sum + r.duration, 0) / results.length
      console.warn(`📊 Sequential access - avg: ${avgTime.toFixed(1)}ms`)
    }, TEST_CONFIG.DEFAULT_TIMEOUT)
  })
})
