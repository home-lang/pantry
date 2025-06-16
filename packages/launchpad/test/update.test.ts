import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import fs from 'node:fs'
import path from 'node:path'
import process from 'node:process'
import { config } from '../src/config'
import { update } from '../src/package'

// Mock console methods to capture output
let consoleOutput: string[] = []
let consoleWarnOutput: string[] = []

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
      const proc = spawn(['bun', 'run', './packages/launchpad/bin/cli.ts', 'update', 'bun', '--dry-run'], {
        cwd: process.cwd(),
        stdio: ['ignore', 'pipe', 'pipe'],
      })

      const output = await new Response(proc.stdout).text()
      const exitCode = await proc.exited

      expect(exitCode).toBe(0)
      expect(output).toContain('bun')
    })

    it('should handle upgrade alias', async () => {
      const { spawn } = Bun
      const proc = spawn(['bun', 'run', './packages/launchpad/bin/cli.ts', 'upgrade', 'bun', '--latest', '--dry-run'], {
        cwd: process.cwd(),
        stdio: ['ignore', 'pipe', 'pipe'],
      })

      const output = await new Response(proc.stdout).text()
      const exitCode = await proc.exited

      expect(exitCode).toBe(0)
      expect(output).toContain('bun')
    })

    it('should handle up alias', async () => {
      const { spawn } = Bun
      const proc = spawn(['bun', 'run', './packages/launchpad/bin/cli.ts', 'up', 'node', '--dry-run'], {
        cwd: process.cwd(),
        stdio: ['ignore', 'pipe', 'pipe'],
      })

      const output = await new Response(proc.stdout).text()
      const exitCode = await proc.exited

      expect(exitCode).toBe(0)
      expect(output).toContain('node')
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
