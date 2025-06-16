import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { config } from '../src/config'
import { update } from '../src/package'

// Mock console methods to capture output
let consoleOutput: string[] = []
let consoleWarnOutput: string[] = []

// Helper function to find CLI path
function findCliPath(): string {
  const possiblePaths = [
    path.resolve(process.cwd(), 'packages/launchpad/bin/cli.ts'),
    path.resolve(process.cwd(), 'launchpad/packages/launchpad/bin/cli.ts'),
    path.resolve(__dirname, '../bin/cli.ts'),
    path.resolve('/home/runner/work/launchpad/launchpad/packages/launchpad/bin/cli.ts'),
    path.resolve('/tmp', 'launchpad/packages/launchpad/bin/cli.ts'),
  ]

  let cliPath = ''
  for (const p of possiblePaths) {
    console.error('Debug: Checking path:', p, '- exists:', fs.existsSync(p))
    if (fs.existsSync(p)) {
      cliPath = p
      break
    }
  }

  if (!cliPath) {
    console.error('Debug: No CLI found, using fallback')
    cliPath = possiblePaths[0] // Use first path as fallback
  }

  console.error('Debug: Using CLI at path:', cliPath)
  console.error('Debug: Current working directory:', process.cwd())
  console.error('Debug: __dirname:', __dirname)
  console.error('Debug: Directory contents:', fs.readdirSync(process.cwd()).join(', '))

  return cliPath
}

const mockConsole = {
  log: mock((message: string) => {
    consoleOutput.push(message.toString())
  }),
  warn: mock((message: string) => {
    consoleWarnOutput.push(message.toString())
  }),
  error: mock(() => {}),
}

describe('Update Module', () => {
  let tempDir: string
  let originalConsole: typeof console
  let originalInstallPrefix: string

  beforeEach(() => {
    // Create temporary directory for testing
    tempDir = fs.mkdtempSync(path.join(process.cwd(), 'test-update-'))

    // Mock console
    originalConsole = { ...console }
    Object.assign(console, mockConsole)

    // Clear output arrays
    consoleOutput = []
    consoleWarnOutput = []

    // Mock install prefix to use temp directory
    originalInstallPrefix = process.env.LAUNCHPAD_PREFIX || ''
    process.env.LAUNCHPAD_PREFIX = tempDir

    // Reset config
    config.verbose = false
  })

  afterEach(() => {
    // Restore console
    Object.assign(console, originalConsole)

    // Restore install prefix
    if (originalInstallPrefix) {
      process.env.LAUNCHPAD_PREFIX = originalInstallPrefix
    }
    else {
      delete process.env.LAUNCHPAD_PREFIX
    }

    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  describe('update function - basic scenarios', () => {
    it('should show message when no packages are installed', async () => {
      await update()

      expect(consoleOutput.some(msg => msg.includes('No packages installed'))).toBe(true)
    })

    it('should handle specific package update request', async () => {
      await update(['bun'])

      expect(consoleOutput.some(msg => msg.includes('Checking for updates to bun'))).toBe(true)
    })

    it('should handle --latest flag', async () => {
      await update(['bun'], { latest: true })

      expect(consoleOutput.some(msg => msg.includes('Checking for updates to bun'))).toBe(true)
    })

    it('should handle --dry-run flag', async () => {
      await update(['bun'], { dryRun: true })

      expect(consoleOutput.some(msg => msg.includes('Checking for updates to bun'))).toBe(true)
    })
  })

  describe('CLI integration tests', () => {
    it('should handle update command with specific packages', async () => {
      const { spawn } = Bun

      const cliPath = findCliPath()
      console.error('Debug: Environment LAUNCHPAD_PREFIX:', process.env.LAUNCHPAD_PREFIX)

      const proc = spawn(['bun', 'run', cliPath, 'update', 'bun', '--dry-run'], {
        cwd: process.cwd(),
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, LAUNCHPAD_PREFIX: tempDir },
      })

      // Add timeout to prevent hanging in CI
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('CLI command timed out after 10 seconds')), 10000)
      })

      try {
        const [output, stderr, exitCode] = await Promise.race([
          Promise.all([
            new Response(proc.stdout).text(),
            new Response(proc.stderr).text(),
            proc.exited,
          ]),
          timeoutPromise,
        ]) as [string, string, number]

        // Always log output for debugging in CI
        console.error('CLI stdout:', output)
        console.error('CLI stderr:', stderr)
        console.error('Exit code:', exitCode)

        if (exitCode !== 0) {
          throw new Error(`CLI failed with exit code ${exitCode}. Stdout: ${output}. Stderr: ${stderr}`)
        }

        expect(exitCode).toBe(0)
        expect(output).toContain('bun')
      }
      catch (error) {
        console.error('CLI test failed:', error)
        throw error
      }
    })

    it('should handle upgrade alias', async () => {
      const { spawn } = Bun

      const cliPath = findCliPath()

      const proc = spawn(['bun', 'run', cliPath, 'upgrade', 'bun', '--latest', '--dry-run'], {
        cwd: process.cwd(),
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, LAUNCHPAD_PREFIX: tempDir },
      })

      // Add timeout to prevent hanging in CI
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('CLI command timed out after 10 seconds')), 10000)
      })

      try {
        const [output, stderr, exitCode] = await Promise.race([
          Promise.all([
            new Response(proc.stdout).text(),
            new Response(proc.stderr).text(),
            proc.exited,
          ]),
          timeoutPromise,
        ]) as [string, string, number]

        // Always log output for debugging in CI
        console.error('CLI stdout:', output)
        console.error('CLI stderr:', stderr)
        console.error('Exit code:', exitCode)

        if (exitCode !== 0) {
          throw new Error(`CLI failed with exit code ${exitCode}. Stdout: ${output}. Stderr: ${stderr}`)
        }

        expect(exitCode).toBe(0)
        expect(output).toContain('bun')
      }
      catch (error) {
        console.error('CLI test failed:', error)
        throw error
      }
    })

    it('should handle up alias', async () => {
      const { spawn } = Bun

      const cliPath = findCliPath()

      const proc = spawn(['bun', 'run', cliPath, 'up', 'node', '--dry-run'], {
        cwd: process.cwd(),
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, LAUNCHPAD_PREFIX: tempDir },
      })

      // Add timeout to prevent hanging in CI
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('CLI command timed out after 10 seconds')), 10000)
      })

      try {
        const [output, stderr, exitCode] = await Promise.race([
          Promise.all([
            new Response(proc.stdout).text(),
            new Response(proc.stderr).text(),
            proc.exited,
          ]),
          timeoutPromise,
        ]) as [string, string, number]

        // Always log output for debugging in CI
        console.error('CLI stdout:', output)
        console.error('CLI stderr:', stderr)
        console.error('Exit code:', exitCode)

        if (exitCode !== 0) {
          throw new Error(`CLI failed with exit code ${exitCode}. Stdout: ${output}. Stderr: ${stderr}`)
        }

        expect(exitCode).toBe(0)
        expect(output).toContain('node')
      }
      catch (error) {
        console.error('CLI test failed:', error)
        throw error
      }
    })
  })

  describe('error handling', () => {
    it('should handle unknown packages gracefully', async () => {
      await update(['nonexistent-package-12345'])

      expect(consoleWarnOutput.some(msg => msg.includes('not found'))).toBe(true)
    })

    it('should handle packages not installed', async () => {
      await update(['bun'])

      expect(consoleOutput.some(msg =>
        msg.includes('not installed')
        || msg.includes('Checking for updates'),
      )).toBe(true)
    })
  })

  describe('dry run and latest functionality', () => {
    it('should handle dry run with --latest flag', async () => {
      await update(['bun'], { dryRun: true, latest: true })

      expect(consoleOutput.some(msg => msg.includes('Checking for updates'))).toBe(true)
    })

    it('should handle multiple packages with various options', async () => {
      await update(['bun', 'node'], { latest: true })

      expect(consoleOutput.some(msg => msg.includes('Checking for updates'))).toBe(true)
    })
  })
})
