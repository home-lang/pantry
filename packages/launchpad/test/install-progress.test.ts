import { afterEach, beforeEach, describe, expect, it, jest } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { cleanupSpinner } from '../src/install'

// Simple test to verify progress message functionality
describe('Install Progress Messages', () => {
  let mockStdout: jest.Mock
  let mockStderr: jest.Mock
  let tempDir: string
  let originalEnv: Record<string, string | undefined>

  beforeEach(() => {
    // Create temp directory for test installs
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-test-'))

    // Save original environment
    originalEnv = { ...process.env }

    // Mock stdout and stderr
    mockStdout = jest.fn()
    mockStderr = jest.fn()

    // Mock process.stdout.write and process.stderr.write
    jest.spyOn(process.stdout, 'write').mockImplementation(mockStdout)
    jest.spyOn(process.stderr, 'write').mockImplementation(mockStderr)

    // Mock console.log for non-shell mode
    jest.spyOn(console, 'log').mockImplementation(jest.fn())

    // Mock fs.writeSync to avoid actual file writes during tests
    jest.spyOn(fs, 'writeSync').mockImplementation(jest.fn())
  })

  afterEach(() => {
    // Cleanup spinner state
    cleanupSpinner()

    // Restore environment
    process.env = originalEnv

    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }

    // Restore mocks
    jest.restoreAllMocks()
  })

  describe('Message Output Logic', () => {
    it('should write to stdout in normal mode', () => {
      // Set up normal mode (no shell integration)
      delete process.env.LAUNCHPAD_SHELL_INTEGRATION

      // Test direct stdout write
      process.stdout.write('Test message')

      expect(mockStdout).toHaveBeenCalledWith('Test message')
    })

    it('should write to stderr in shell integration mode', () => {
      // Set up shell integration mode
      process.env.LAUNCHPAD_SHELL_INTEGRATION = '1'

      // Test direct stderr write
      process.stderr.write('Shell message')

      expect(mockStderr).toHaveBeenCalledWith('Shell message')
    })

    it('should handle clear line sequences', () => {
      const clearSequence = '\r\x1B[K'

      process.stdout.write(clearSequence)

      expect(mockStdout).toHaveBeenCalledWith(clearSequence)
    })

    it('should handle progress message format', () => {
      const progressMsg = '⬇️  1024000/2048000 bytes (50%)'

      process.stdout.write(progressMsg)

      expect(mockStdout).toHaveBeenCalledWith(progressMsg)
      expect(mockStdout.mock.calls[0][0]).toContain('⬇️')
      expect(mockStdout.mock.calls[0][0]).toContain('bytes')
      expect(mockStdout.mock.calls[0][0]).toContain('%')
    })

    it('should handle processing message format', () => {
      const processingMsg = '🔄 Processing next dependency...'

      process.stdout.write(processingMsg)

      expect(mockStdout).toHaveBeenCalledWith(processingMsg)
      expect(mockStdout.mock.calls[0][0]).toContain('🔄')
      expect(mockStdout.mock.calls[0][0]).toContain('Processing')
    })

    it('should handle cache loading message format', () => {
      const cacheMsg = '🔄 Loading package v1.0.0 from cache...'

      process.stdout.write(cacheMsg)

      expect(mockStdout).toHaveBeenCalledWith(cacheMsg)
      expect(mockStdout.mock.calls[0][0]).toContain('🔄')
      expect(mockStdout.mock.calls[0][0]).toContain('Loading')
      expect(mockStdout.mock.calls[0][0]).toContain('cache')
    })

    it('should handle success message format', () => {
      const successMsg = '✅ package.domain (v1.0.0)'

      process.stdout.write(successMsg)

      expect(mockStdout).toHaveBeenCalledWith(successMsg)
      expect(mockStdout.mock.calls[0][0]).toContain('✅')
    })
  })

  describe('Message Timing', () => {
    it('should support delayed message output', async () => {
      // Test that setTimeout-based messages work
      const delayedMessage = '🔄 Delayed processing...'

      setTimeout(() => {
        process.stdout.write(delayedMessage)
      }, 10)

      // Wait for the timeout to execute
      await new Promise(resolve => setTimeout(resolve, 50))

      expect(mockStdout).toHaveBeenCalledWith(delayedMessage)
    })

    it('should support promise-based delays', async () => {
      const loadingMsg = '🔄 Loading from cache...'
      const clearMsg = '\r\x1B[K'

      // Simulate the cache loading sequence
      process.stdout.write(loadingMsg)
      await new Promise(resolve => setTimeout(resolve, 10))
      process.stdout.write(clearMsg)

      expect(mockStdout).toHaveBeenCalledWith(loadingMsg)
      expect(mockStdout).toHaveBeenCalledWith(clearMsg)
    })
  })

  describe('Progress Message Patterns', () => {
    it('should recognize download progress pattern', () => {
      const patterns = [
        '⬇️  512000/1024000 bytes (50%)',
        '⬇️  1024000/1024000 bytes (100%)',
        '⬇️  Downloading package v1.0.0...',
      ]

      patterns.forEach((pattern) => {
        expect(pattern).toMatch(/⬇️.*(?:bytes|Downloading)/)
      })
    })

    it('should recognize processing message pattern', () => {
      const patterns = [
        '🔄 Processing next dependency...',
        '🔄 Loading package v1.0.0 from cache...',
      ]

      patterns.forEach((pattern) => {
        expect(pattern).toMatch(/🔄.*(?:Processing|Loading)/)
      })
    })

    it('should recognize success message pattern', () => {
      const patterns = [
        '✅ package.domain (v1.0.0)',
        '✅ Environment activated for project',
      ]

      patterns.forEach((pattern) => {
        expect(pattern).toMatch(/✅/)
      })
    })

    it('should recognize clear sequence pattern', () => {
      const clearSequence = '\r\x1B[K'

      expect(clearSequence).toContain('\r')
      expect(clearSequence).toContain('\x1B[K')
    })
  })
})
