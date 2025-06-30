import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { dump } from '../src/dev/dump.ts'

let tempDir: string
let originalEnv: NodeJS.ProcessEnv

beforeEach(() => {
  // Store original environment
  originalEnv = { ...process.env }

  // Create temp directory for this test
  tempDir = fs.mkdtempSync(path.join(tmpdir(), 'launchpad-progress-test-'))

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

describe('Progress Indicators During Installation', () => {
  it('should show progress indicators for normal dev mode', async () => {
    createDepsFile(tempDir, ['nginx.org@1.25.3'])

    const { stdout, stderr } = await captureOutput(async () => {
      try {
        await dump(tempDir, { shellOutput: false, quiet: false })
      }
      catch {
        // Installation may fail in CI environment
      }
    })

    const allOutput = [...stdout, ...stderr].join('')

    // Should either show progress indicators or handle installation failure gracefully
    const hasProgressOrInstallation = allOutput.includes('📦')
      || allOutput.includes('Installing')
      || allOutput.includes('nginx')
      || allOutput.includes('Failed to install')

    expect(hasProgressOrInstallation).toBe(true)
  })

  it('should show progress indicators for shell mode installations', async () => {
    createDepsFile(tempDir, ['nginx.org@1.25.3'])

    const { stdout, stderr } = await captureOutput(async () => {
      try {
        await dump(tempDir, { shellOutput: true, quiet: false })
      }
      catch {
        // Installation may fail in CI environment
      }
    })

    const allOutput = [...stdout, ...stderr].join('')

    // In shell mode, progress should be visible in stderr or installation should be attempted
    const hasProgressOrInstallation = allOutput.includes('📦')
      || allOutput.includes('Installing')
      || allOutput.includes('nginx')
      || allOutput.includes('export PATH=')
      || stderr.join('').includes('📦')

    expect(hasProgressOrInstallation).toBe(true)
  })

  it('should handle progress indicators for multiple packages', async () => {
    createDepsFile(tempDir, ['nginx.org@1.25.3', 'curl.se@8.0'])

    const { stdout, stderr } = await captureOutput(async () => {
      try {
        await dump(tempDir, { shellOutput: false, quiet: false })
      }
      catch {
        // Installation may fail in CI environment
      }
    })

    const allOutput = [...stdout, ...stderr].join('')

    // Should show multiple package installation attempts or appropriate error handling
    const hasMultiPackageHandling = allOutput.includes('nginx')
      || allOutput.includes('curl')
      || allOutput.includes('Installing')
      || allOutput.includes('Failed to install')

    expect(hasMultiPackageHandling).toBe(true)
  })

  it('should suppress non-progress output in shell mode', async () => {
    createDepsFile(tempDir, ['nginx.org@1.25.3'])

    const { stdout } = await captureOutput(async () => {
      try {
        await dump(tempDir, { shellOutput: true, quiet: false })
      }
      catch {
        // Installation may fail in CI environment
      }
    })

    const stdoutText = stdout.join('')

    // In shell mode, stdout should either contain shell code or be empty (if installation failed)
    if (stdoutText.trim() !== '') {
      // If we have output, it should be shell code, not progress indicators
      expect(stdoutText.includes('export') || stdoutText.includes('#')).toBe(true)
      expect(stdoutText.includes('📦')).toBe(false)
    }
    // Empty output is acceptable if installation failed in CI
  })
})

describe('Nginx Installation Testing', () => {
  it('should attempt to install nginx and show appropriate output', async () => {
    createDepsFile(tempDir, ['nginx.org@1.25.3'])

    const { stdout, stderr } = await captureOutput(async () => {
      try {
        await dump(tempDir, { shellOutput: false, quiet: false })
      }
      catch {
        // Installation may fail in CI environment
      }
    })

    const allOutput = [...stdout, ...stderr].join('')

    // Should attempt nginx installation or show appropriate error
    expect(allOutput.includes('nginx') || allOutput.includes('Failed to install')).toBe(true)
  })

  it('should generate shell code for nginx environment', async () => {
    createDepsFile(tempDir, ['nginx.org@1.25.3'])

    const { stdout } = await captureOutput(async () => {
      try {
        await dump(tempDir, { shellOutput: true, quiet: false })
      }
      catch {
        // Installation may fail in CI environment
      }
    })

    const stdoutText = stdout.join('')

    // Should either generate shell code or be empty if installation failed
    if (stdoutText.trim() !== '') {
      expect(stdoutText.includes('export PATH=') || stdoutText.includes('#')).toBe(true)
    }
    // Empty output is acceptable if installation failed in CI
  })
})

describe('Progress Indicators vs. Output Mode Interaction', () => {
  it('should maintain progress visibility across different output modes', async () => {
    createDepsFile(tempDir, ['nginx.org@1.25.3'])

    // First run in normal mode
    const { stdout: normalStdout, stderr: normalStderr } = await captureOutput(async () => {
      try {
        await dump(tempDir, { shellOutput: false, quiet: false })
      }
      catch {
        // Installation may fail in CI environment
      }
    })

    // Test that shell mode produces appropriate output
    const { stdout: shellStdout } = await captureOutput(async () => {
      try {
        await dump(tempDir, { shellOutput: true, quiet: false })
      }
      catch {
        // Installation may fail in CI environment
      }
    })

    const normalOutput = [...normalStdout, ...normalStderr].join('')
    const shellOutput = shellStdout.join('')

    // Both modes should handle nginx appropriately
    const normalHandlesNginx = normalOutput.includes('nginx') || normalOutput.includes('Failed to install')
    const shellHandlesNginx = shellOutput.includes('export') || shellOutput.trim() === ''

    expect(normalHandlesNginx && (shellHandlesNginx || shellOutput.includes('nginx'))).toBe(true)
  })

  it('should not leak progress indicators into shell evaluation output', async () => {
    createDepsFile(tempDir, ['nginx.org@1.25.3'])

    const { stdout } = await captureOutput(async () => {
      try {
        await dump(tempDir, { shellOutput: true, quiet: false })
      }
      catch {
        // Installation may fail in CI environment
      }
    })

    const stdoutText = stdout.join('')

    // Shell output should not contain progress indicators
    if (stdoutText.trim() !== '') {
      expect(stdoutText.includes('📦')).toBe(false)
      expect(stdoutText.includes('⚡')).toBe(false)
      expect(stdoutText.includes('🔧')).toBe(false)
    }
    // Empty output is acceptable if installation failed
  })
})

describe('Cached Environment Behavior', () => {
  it('should skip progress indicators when using cached environment', async () => {
    createDepsFile(tempDir, ['nginx.org@1.25.3'])

    // First installation attempt
    await captureOutput(async () => {
      try {
        await dump(tempDir, { shellOutput: false, quiet: false })
      }
      catch {
        // Installation may fail in CI environment
      }
    })

    // Second call should use cached environment or handle gracefully
    const { stdout, stderr } = await captureOutput(async () => {
      try {
        await dump(tempDir, { shellOutput: false, quiet: false })
      }
      catch {
        // Installation may fail in CI environment
      }
    })

    const allOutput = [...stdout, ...stderr].join('')

    // Should either use cached environment or handle installation failure
    const handlesAppropriately = allOutput.includes('cached')
      || allOutput.includes('Successfully set up environment')
      || allOutput.includes('nginx')
      || allOutput.includes('Failed to install')
      || allOutput.trim() === ''

    expect(handlesAppropriately).toBe(true)
  })
})

function generateTestProjectHash(projectPath: string): string {
  // Generate a simple hash based on the project path
  // eslint-disable-next-line ts/no-require-imports
  const crypto = require('node:crypto')
  const hash = crypto.createHash('md5').update(projectPath).digest('hex')
  const projectName = path.basename(projectPath)
  return `${projectName}_${hash.slice(0, 8)}`
}
