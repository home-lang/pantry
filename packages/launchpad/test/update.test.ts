/* eslint-disable no-console */
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
  const testFileDir = import.meta.dir // This is the directory containing this test file
  const repoRoot = path.resolve(testFileDir, '../../../..') // Go up from test/ -> launchpad/ -> packages/ -> repo root
  const packageRoot = path.resolve(testFileDir, '..') // Go up from test/ -> launchpad/

  const possiblePaths = [
    // From current working directory (if running from repo root)
    path.resolve(process.cwd(), 'packages/launchpad/bin/cli.ts'),
    // From current working directory (if running from nested directory)
    path.resolve(process.cwd(), 'bin/cli.ts'),
    // Relative to this test file (most reliable)
    path.resolve(testFileDir, '../bin/cli.ts'),
    // From calculated repo root
    path.resolve(repoRoot, 'packages/launchpad/bin/cli.ts'),
    // From package root
    path.resolve(packageRoot, 'bin/cli.ts'),
    // CI specific paths
    path.resolve('/home/runner/work/launchpad/launchpad/packages/launchpad/bin/cli.ts'),
    path.resolve(process.cwd(), 'launchpad/packages/launchpad/bin/cli.ts'),
    path.resolve('/tmp', 'launchpad/packages/launchpad/bin/cli.ts'),
  ]

  let cliPath = ''
  for (const p of possiblePaths) {
    console.log('Debug: Checking path:', p, '- exists:', fs.existsSync(p))
    if (fs.existsSync(p)) {
      cliPath = p
      break
    }
  }

  if (!cliPath) {
    console.log('Debug: No CLI found, using fallback')
    cliPath = possiblePaths[0] // Use first path as fallback
  }

  console.log('Debug: Using CLI at path:', cliPath)
  console.log('Debug: Current working directory:', process.cwd())
  console.log('Debug: Test file directory:', testFileDir)
  console.log('Debug: Directory contents:', fs.readdirSync(process.cwd()).join(', '))

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

      // First install a package so we have something to update
      console.error('Debug: Installing bun package first...')
      const installProc = spawn(['bun', 'run', cliPath, 'install', 'bun'], {
        cwd: process.cwd(),
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, LAUNCHPAD_PREFIX: tempDir },
      })

      const installTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Install command timed out after 30 seconds')), 30000)
      })

      const [installOutput, installStderr, installExitCode] = await Promise.race([
        Promise.all([
          new Response(installProc.stdout).text(),
          new Response(installProc.stderr).text(),
          installProc.exited,
        ]),
        installTimeout,
      ]) as [string, string, number]

      console.log('Install stdout:', installOutput)
      console.log('Install stderr:', installStderr)
      console.log('Install exit code:', installExitCode)

      // Now test the update command (even if install failed, update should show appropriate message)
      console.log('Debug: Testing update command...')
      const proc = spawn(['bun', 'run', cliPath, 'update', 'bun', '--dry-run'], {
        cwd: process.cwd(),
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, LAUNCHPAD_PREFIX: tempDir },
      })

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Update command timed out after 10 seconds')), 10000)
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

        console.error('Update stdout:', output)
        console.error('Update stderr:', stderr)
        console.error('Update exit code:', exitCode)

        if (exitCode !== 0) {
          throw new Error(`Update CLI failed with exit code ${exitCode}. Stdout: ${output}. Stderr: ${stderr}`)
        }

        expect(exitCode).toBe(0)
        // Should show update information or installation information
        const hasUpdateInfo = output.includes('bun') || output.includes('Update') || output.includes('install') || stderr.includes('bun')
        expect(hasUpdateInfo).toBe(true)
      }
      catch (error) {
        console.error('Update CLI test failed:', error)
        throw error
      }
    })

    it('should handle update command with packages and --latest flag', async () => {
      const { spawn } = Bun
      const cliPath = findCliPath()

      // First install a package so we have something to upgrade
      console.log('Debug: Installing bun package first...')
      const installProc = spawn(['bun', 'run', cliPath, 'install', 'bun'], {
        cwd: process.cwd(),
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, LAUNCHPAD_PREFIX: tempDir },
      })

      const installTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Install command timed out after 30 seconds')), 30000)
      })

      const [installOutput, installStderr, installExitCode] = await Promise.race([
        Promise.all([
          new Response(installProc.stdout).text(),
          new Response(installProc.stderr).text(),
          installProc.exited,
        ]),
        installTimeout,
      ]) as [string, string, number]

      console.log('Install stdout:', installOutput)
      console.log('Install stderr:', installStderr)
      console.log('Install exit code:', installExitCode)

      // Now test the update command with upgrade alias
      console.log('Debug: Testing update command with upgrade alias...')
      const proc = spawn(['bun', 'run', cliPath, 'update', 'bun', '--latest', '--dry-run'], {
        cwd: process.cwd(),
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, LAUNCHPAD_PREFIX: tempDir },
      })

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Upgrade command timed out after 10 seconds')), 10000)
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

        console.log('Upgrade stdout:', output)
        console.log('Upgrade stderr:', stderr)
        console.log('Upgrade exit code:', exitCode)

        if (exitCode !== 0) {
          throw new Error(`Upgrade CLI failed with exit code ${exitCode}. Stdout: ${output}. Stderr: ${stderr}`)
        }

        expect(exitCode).toBe(0)
        // Should show upgrade information or installation information
        const hasUpgradeInfo = output.includes('bun') || output.includes('Update') || output.includes('install') || stderr.includes('bun')
        expect(hasUpgradeInfo).toBe(true)
      }
      catch (error) {
        console.error('Upgrade CLI test failed:', error)
        throw error
      }
    })

    it('should handle up alias', async () => {
      const { spawn } = Bun
      const cliPath = findCliPath()

      // First install a package so we have something to update
      console.log('Debug: Installing node package first...')
      const installProc = spawn(['bun', 'run', cliPath, 'install', 'node'], {
        cwd: process.cwd(),
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, LAUNCHPAD_PREFIX: tempDir },
      })

      const installTimeout = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Install command timed out after 30 seconds')), 30000)
      })

      const [installOutput, installStderr, installExitCode] = await Promise.race([
        Promise.all([
          new Response(installProc.stdout).text(),
          new Response(installProc.stderr).text(),
          installProc.exited,
        ]),
        installTimeout,
      ]) as [string, string, number]

      console.log('Install stdout:', installOutput)
      console.log('Install stderr:', installStderr)
      console.log('Install exit code:', installExitCode)

      // Now test the up command
      console.log('Debug: Testing up command...')
      const proc = spawn(['bun', 'run', cliPath, 'up', 'node', '--dry-run'], {
        cwd: process.cwd(),
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, LAUNCHPAD_PREFIX: tempDir },
      })

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Up command timed out after 10 seconds')), 10000)
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

        console.log('Up stdout:', output)
        console.log('Up stderr:', stderr)
        console.log('Up exit code:', exitCode)

        if (exitCode !== 0) {
          throw new Error(`Up CLI failed with exit code ${exitCode}. Stdout: ${output}. Stderr: ${stderr}`)
        }

        expect(exitCode).toBe(0)
        // Should show update information or installation information
        const hasUpdateInfo = output.includes('node') || output.includes('Update') || output.includes('install') || stderr.includes('node')
        expect(hasUpdateInfo).toBe(true)
      }
      catch (error) {
        console.error('Up CLI test failed:', error)
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
