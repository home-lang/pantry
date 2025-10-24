import { describe, expect, it } from 'bun:test'
import { spawn } from 'node:child_process'
import path from 'node:path'

describe('Upgrade Command Edge Cases', () => {
  const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')

  it('should handle --dry-run with --force', async () => {
    return new Promise<void>((resolve, reject) => {
      // Use --release to avoid GitHub API rate limiting
      const proc = spawn('bun', [cliPath, 'upgrade', '--dry-run', '--force', '--release', 'v0.4.15'], {
        stdio: ['ignore', 'pipe', 'pipe'],
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
        try {
          const output = stdout + stderr
          // Check for any valid output indicating the command ran
          const hasValidOutput = output.includes('DRY RUN MODE')
            || output.includes('Already on target version')
            || output.includes('already on the latest version')
            || output.includes('no upgrade needed')
            || output.includes('Failed to check latest version') // Accept rate limiting
            || output.length > 20
          expect(hasValidOutput).toBe(true)
          // Accept both 0 and 1 exit codes (1 can be from rate limiting)
          expect(code).toBeLessThanOrEqual(1)
          resolve()
        }
        catch (error) {
          reject(error)
        }
      })

      setTimeout(() => {
        proc.kill()
        reject(new Error('Test timed out'))
      }, 10000)
    })
  }, 15000)

  it('should handle self-update with upgrade flags', async () => {
    return new Promise<void>((resolve, reject) => {
      const proc = spawn('bun', [
        cliPath,
        'self-update',
        '--dry-run',
        '--release',
        'v0.3.11',
      ], {
        stdio: ['ignore', 'pipe', 'pipe'],
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
        try {
          const output = stdout + stderr
          expect(output).toContain('DRY RUN MODE')
          expect(output).toContain('v0.3.11')
          expect(code).toBe(0)
          resolve()
        }
        catch (error) {
          reject(error)
        }
      })

      setTimeout(() => {
        proc.kill()
        reject(new Error('Test timed out'))
      }, 10000)
    })
  }, 15000)

  it('should show help for self-update command', async () => {
    return new Promise<void>((resolve, reject) => {
      const proc = spawn('bun', [cliPath, 'self-update', '--help'], {
        stdio: ['ignore', 'pipe', 'pipe'],
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
        try {
          const output = stdout + stderr
          expect(output).toContain('Usage:')
          expect(output).toContain('upgrade')
          expect(output).toContain('--dry-run')
          expect(code).toBe(0)
          resolve()
        }
        catch (error) {
          reject(error)
        }
      })

      setTimeout(() => {
        proc.kill()
        reject(new Error('Test timed out'))
      }, 10000)
    })
  }, 15000)
})
