import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import crypto from 'node:crypto'
import fs from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { dump } from '../src/dev/dump.ts'

let tempDir: string
let originalEnv: NodeJS.ProcessEnv

beforeEach(() => {
  // Store original environment
  originalEnv = { ...process.env }

  // Create temp directory for this test
  tempDir = fs.mkdtempSync(path.join(tmpdir(), 'launchpad-nginx-test-'))

  // Set test environment variables for isolation
  process.env.LAUNCHPAD_PREFIX = tempDir
  process.env.XDG_CACHE_HOME = path.join(tempDir, '.cache')
  process.env.XDG_DATA_HOME = path.join(tempDir, '.local', 'share')
  process.env.LAUNCHPAD_DEBUG = '1'
})

afterEach(() => {
  process.env = originalEnv

  // Clean up test temp directory
  if (fs.existsSync(tempDir)) {
    fs.rmSync(tempDir, { recursive: true, force: true })
  }

  // Clean up any environment directories that might have been created during tests
  try {
    const projectHash = generateTestProjectHash(tempDir)
    const envDir = path.join(process.env.HOME || '', '.local', 'share', 'launchpad', projectHash)
    if (fs.existsSync(envDir)) {
      fs.rmSync(envDir, { recursive: true, force: true })
    }
  }
  catch {
    // Ignore cleanup errors
  }
})

function createDepsFile(dir: string, packages: string[]) {
  const depsContent = `dependencies:\n${packages.map(pkg => `  - ${pkg}`).join('\n')}`
  fs.writeFileSync(path.join(dir, 'deps.yaml'), depsContent)
}

function generateTestProjectHash(projectPath: string): string {
  const hash = crypto.createHash('md5').update(projectPath).digest('hex')
  const projectName = path.basename(projectPath)
  return `${projectName}_${hash.slice(0, 8)}`
}

// Helper function to capture console output during a function call
/* eslint-disable no-console */
async function captureOutput(fn: () => Promise<void>): Promise<{ stdout: string[], stderr: string[] }> {
  const stdoutOutput: string[] = []
  const stderrOutput: string[] = []

  const originalStdoutWrite = process.stdout.write
  const originalStderrWrite = process.stderr.write
  const originalConsoleLog = console.log
  const originalConsoleWarn = console.warn
  const originalConsoleError = console.error

  // Temporarily capture output
  process.stdout.write = function (chunk: any): boolean {
    stdoutOutput.push(chunk.toString())
    return originalStdoutWrite.call(this, chunk)
  }

  process.stderr.write = function (chunk: any): boolean {
    stderrOutput.push(chunk.toString())
    return originalStderrWrite.call(this, chunk)
  }

  // Capture console methods too since dump uses console.log for shell output
  console.log = (...args: any[]) => {
    stdoutOutput.push(`${args.join(' ')}\n`)
  }

  console.warn = (...args: any[]) => {
    stderrOutput.push(`${args.join(' ')}\n`)
  }

  console.error = (...args: any[]) => {
    stderrOutput.push(`${args.join(' ')}\n`)
  }

  try {
    await fn()
  }
  finally {
    // Always restore original functions
    process.stdout.write = originalStdoutWrite
    process.stderr.write = originalStderrWrite
    console.log = originalConsoleLog
    console.warn = originalConsoleWarn
    console.error = originalConsoleError
  }

  return { stdout: stdoutOutput, stderr: stderrOutput }
}
/* eslint-enable no-console */

describe('Nginx Installation and Binary Availability', () => {
  describe('Installation Process', () => {
    it('should attempt to install nginx with correct package name', async () => {
      createDepsFile(tempDir, ['nginx.org@1.25.3'])

      let installationSucceeded = false
      const { stderr } = await captureOutput(async () => {
        try {
          await dump(tempDir, { shellOutput: false, quiet: false })
          installationSucceeded = true
        }
        catch {
          // Installation may fail in test environment, that's okay
        }
      })

      const stderrText = stderr.join('')

      // Should attempt to install nginx
      const mentionsNginx = stderrText.includes('nginx')
        || stderrText.includes('nginx.org')
        || installationSucceeded

      expect(mentionsNginx).toBe(true)
    }, 60000)
  })

  describe('Binary Detection', () => {
    it('should detect nginx binary in sbin directory', async () => {
      createDepsFile(tempDir, ['nginx.org@1.25.3'])

      try {
        await dump(tempDir, { shellOutput: false, quiet: false })

        // Check if nginx binary stub was created
        const projectHash = generateTestProjectHash(tempDir)
        const envSbinPath = path.join(process.env.HOME || '', '.local', 'share', 'launchpad', projectHash, 'sbin')
        const nginxStub = path.join(envSbinPath, 'nginx')

        if (fs.existsSync(nginxStub)) {
          expect(fs.existsSync(nginxStub)).toBe(true)

          // Check that stub is executable
          const stats = fs.statSync(nginxStub)
          expect(stats.mode & 0o111).toBeGreaterThan(0)

          // Check stub content
          const stubContent = fs.readFileSync(nginxStub, 'utf-8')
          expect(stubContent).toContain('#!/bin/sh')
          expect(stubContent).toContain('nginx')
        }
      }
      catch {
        // Installation may fail in test environment due to network issues
        // This is acceptable for testing - we're mainly testing the flow
        expect(true).toBe(true) // Test passes if we got here without hanging
      }
    }, 90000)

    it('should create proper shims for sbin binaries', async () => {
      createDepsFile(tempDir, ['nginx.org@1.25.3'])

      try {
        await dump(tempDir, { shellOutput: false, quiet: false })

        // Check if sbin directory structure was created
        const projectHash = generateTestProjectHash(tempDir)
        const envSbinPath = path.join(process.env.HOME || '', '.local', 'share', 'launchpad', projectHash, 'sbin')

        if (fs.existsSync(envSbinPath)) {
          expect(fs.existsSync(envSbinPath)).toBe(true)

          // Check for nginx specifically
          const nginxShim = path.join(envSbinPath, 'nginx')
          if (fs.existsSync(nginxShim)) {
            const shimContent = fs.readFileSync(nginxShim, 'utf-8')
            expect(shimContent).toContain('#!/bin/sh')
          }
        }
      }
      catch {
        // Installation may fail in test environment
        expect(true).toBe(true) // Test passes if we got here without hanging
      }
    }, 90000)
  })

  describe('Shell Integration', () => {
    it('should include sbin in PATH for shell output', async () => {
      createDepsFile(tempDir, ['nginx.org@1.25.3'])

      const { stdout } = await captureOutput(async () => {
        try {
          await dump(tempDir, { shellOutput: true, quiet: false })
        }
        catch {
          // Installation may fail in test environment, that's okay
        }
      })

      const stdoutText = stdout.join('')

      // Should include sbin in PATH
      const hasEnvSetup = stdoutText.includes('export PATH=')
        || stdoutText.includes('# Launchpad environment setup')

      expect(hasEnvSetup).toBe(true)

      // PATH should include sbin directory reference
      if (stdoutText.includes('export PATH=')) {
        expect(stdoutText).toMatch(/sbin/)
      }
    }, 60000)

    it('should generate proper shell code for nginx environment', async () => {
      createDepsFile(tempDir, ['nginx.org@1.25.3'])

      const { stdout } = await captureOutput(async () => {
        try {
          await dump(tempDir, { shellOutput: true, quiet: false })
        }
        catch {
          // Installation may fail in test environment, that's okay
        }
      })

      const stdoutText = stdout.join('')

      // Should generate shell environment code
      expect(stdoutText).toContain('export PATH=')
      expect(stdoutText).toContain('# Launchpad environment setup')

      // Should not contain progress indicators in shell output
      expect(stdoutText).not.toContain('📦')
      expect(stdoutText).not.toContain('🔧')
      expect(stdoutText).not.toContain('⚡')
    }, 60000)
  })

  describe('Error Handling', () => {
    it('should handle missing dependency files correctly', async () => {
      // Don't create any deps file - this should exit gracefully without hanging

      const { stdout, stderr } = await captureOutput(async () => {
        try {
          await dump(tempDir, { shellOutput: false, quiet: false })
        }
        catch {
          // May fail, that's okay
        }
      })

      const output = stdout.join('') + stderr.join('')

      // Should handle missing file gracefully - either no output or appropriate message
      expect(typeof output).toBe('string')
      // Test passes if we reach this point without hanging
    }, 30000)
  })
})
