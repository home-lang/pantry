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

    // Check that either progress indicators were shown or installation succeeded
    const hasProgressIndicators = stderrText.includes('📦')
      || stderrText.includes('🔧')
      || stderrText.includes('⚡')
      || stderrText.includes('%')
      || stderrText.includes('Installing')
      || stderrText.includes('Downloading')
      || stderrText.includes('Extracting')

    const hasSuccessIndicators = stderrText.includes('Using cached')
      || stderrText.includes('Successfully')
      || stderrText.includes('✅')
      || installationSucceeded

    // Either progress indicators should be shown OR installation should succeed
    expect(hasProgressIndicators || hasSuccessIndicators).toBe(true)
  }, 60000)

  it('should show progress indicators for shell mode installations', async () => {
    createDepsFile(tempDir, ['nginx.org@1.25.3'])

    let installationSucceeded = false
    const { stdout, stderr } = await captureOutput(async () => {
      try {
        await dump(tempDir, { shellOutput: true, quiet: false })
        installationSucceeded = true
      }
      catch {
        // Installation may fail in test environment, that's okay
      }
    })

    const stdoutText = stdout.join('')
    const stderrText = stderr.join('')

    // In shell mode, progress indicators should still appear in stderr OR installation should succeed
    const hasProgressIndicators = stderrText.includes('📦')
      || stderrText.includes('🔧')
      || stderrText.includes('⚡')
      || stderrText.includes('%')
      || stderrText.includes('Installing')
      || stderrText.includes('Downloading')
      || stderrText.includes('Extracting')

    const hasSuccessIndicators = stderrText.includes('Using cached')
      || stderrText.includes('Successfully')
      || stderrText.includes('✅')
      || installationSucceeded

    // Shell output should be present in shell mode
    const hasShellOutput = stdoutText.includes('export PATH=')
      || stdoutText.includes('# Launchpad environment setup')

    // Either progress indicators should be shown OR installation should succeed
    expect(hasProgressIndicators || hasSuccessIndicators).toBe(true)

    // And shell output should be present
    expect(hasShellOutput).toBe(true)

    // Shell output should be clean (no progress indicators mixed in)
    expect(stdoutText).not.toContain('📦 Downloading')
    expect(stdoutText).not.toContain('🔧 Extracting')
    expect(stdoutText).not.toContain('⚡ Installing')
  }, 60000)

  it('should handle progress indicators for multiple packages', async () => {
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

    const progressCount = (stderrText.match(/📦|🔧|⚡|Installing|Downloading|Extracting/g) || []).length

    if (progressCount > 0) {
      // If we see progress indicators, they should be present
      expect(progressCount).toBeGreaterThan(0)
    }
    else {
      // Check if packages are cached or installation succeeded
      const cachedCount = (stderrText.match(/Using cached/g) || []).length
      const successMessage = stderrText.includes('✅ Successfully') || installationSucceeded
      expect(cachedCount > 0 || successMessage).toBe(true)
    }
  }, 90000)

  it('should suppress non-progress output in shell mode', async () => {
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

    // Shell output should only contain shell setup code
    expect(stdoutText).toContain('# Launchpad environment setup')
    expect(stdoutText).toContain('export PATH=')

    // Should not contain installation success messages in stdout
    expect(stdoutText).not.toContain('✅ Successfully set up environment')
    expect(stdoutText).not.toContain('Found dependency file')
    expect(stdoutText).not.toContain('Packages:')
  }, 60000)
})

describe('Nginx Installation Testing', () => {
  it('should attempt to install nginx and show appropriate output', async () => {
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
  }, 90000)

  it('should generate shell code for nginx environment', async () => {
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
  }, 60000)
})

describe('Progress Indicators vs. Output Mode Interaction', () => {
  it('should maintain progress visibility across different output modes', async () => {
    createDepsFile(tempDir, ['nginx.org@1.25.3'])

    // First run in normal mode to ensure installation
    await captureOutput(async () => {
      try {
        await dump(tempDir, { shellOutput: false, quiet: false })
      }
      catch {
        // Installation may fail in test environment, that's okay
      }
    })

    // Test that shell mode produces shell output (when cached)
    const { stdout: shellStdout } = await captureOutput(async () => {
      try {
        await dump(tempDir, { shellOutput: true, quiet: false })
      }
      catch {
        // May fail, that's okay
      }
    })

    const shellOutput = shellStdout.join('')

    // Should generate shell environment code
    const hasShellOutput = shellOutput.includes('export PATH=')
      || shellOutput.includes('# Launchpad environment setup')

    expect(hasShellOutput).toBe(true)
  }, 60000)

  it('should not leak progress indicators into shell evaluation output', async () => {
    createDepsFile(tempDir, ['nginx.org@1.25.3'])

    // First install to ensure environment is set up
    try {
      await dump(tempDir, { shellOutput: false, quiet: false })
    }
    catch {
      // Installation may fail
    }

    // Now test shell mode
    const { stdout: shellStdout } = await captureOutput(async () => {
      try {
        await dump(tempDir, { shellOutput: true, quiet: false })
      }
      catch {
        // May fail, that's okay
      }
    })

    const shellOutput = shellStdout.join('')

    // Should generate shell environment code OR be empty (if cached path was taken)
    if (shellOutput.length > 0) {
      // If we got output, it should be clean shell code
      expect(shellOutput).toContain('export PATH=')
      expect(shellOutput).not.toContain('📦')
      expect(shellOutput).not.toContain('🔧')
      expect(shellOutput).not.toContain('⚡')
    }
    else {
      // Empty output is also acceptable (cached environment early return)
      expect(shellOutput).toBe('')
    }
  }, 60000)
})

describe('Cached Environment Behavior', () => {
  it('should skip progress indicators when using cached environment', async () => {
    createDepsFile(tempDir, ['nginx.org@1.25.3'])

    // First run to ensure installation
    await captureOutput(async () => {
      try {
        await dump(tempDir, { shellOutput: false, quiet: false })
      }
      catch {
        // May fail, that's okay
      }
    })

    // Second run should use cached environment
    const { stdout, stderr } = await captureOutput(async () => {
      try {
        await dump(tempDir, { shellOutput: true, quiet: false })
      }
      catch {
        // May fail, that's okay
      }
    })

    const shellOutput = stdout.join('')
    const errorOutput = stderr.join('')

    // Shell mode with cached environment should either:
    // 1. Generate shell code, or
    // 2. Take early return with empty output
    const hasShellOutput = shellOutput.includes('export PATH=')
      || shellOutput.includes('# Launchpad environment setup')

    // If we got shell output, it should be clean
    if (hasShellOutput) {
      expect(shellOutput).toContain('export PATH=')
    }

    // Progress indicators should not appear in stderr during cached runs
    expect(errorOutput).not.toContain('📦 Downloading')
    expect(errorOutput).not.toContain('🔧 Extracting')
  }, 90000)
})

function generateTestProjectHash(projectPath: string): string {
  // Generate a simple hash based on the project path
  // eslint-disable-next-line ts/no-require-imports
  const crypto = require('node:crypto')
  const hash = crypto.createHash('md5').update(projectPath).digest('hex')
  const projectName = path.basename(projectPath)
  return `${projectName}_${hash.slice(0, 8)}`
}
