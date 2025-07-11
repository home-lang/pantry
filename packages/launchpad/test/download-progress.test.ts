import { afterEach, beforeEach, describe, expect, it, jest } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

// Mock fetch for testing download progress
const mockFetch = jest.fn()
// @ts-expect-error - Mock fetch for testing
globalThis.fetch = mockFetch

// Create a mock ReadableStream for testing
class MockReadableStream {
  private chunks: Uint8Array[]
  private index = 0
  private chunkSize: number

  constructor(data: Uint8Array, chunkSize = 1024) {
    this.chunkSize = chunkSize
    this.chunks = []

    // Split data into chunks
    for (let i = 0; i < data.length; i += chunkSize) {
      this.chunks.push(data.slice(i, i + chunkSize))
    }
  }

  getReader() {
    return {
      read: async () => {
        if (this.index >= this.chunks.length) {
          return { done: true, value: undefined }
        }

        const chunk = this.chunks[this.index++]
        return { done: false, value: chunk }
      },
    }
  }
}

describe('Download Progress', () => {
  let mockStdout: jest.Mock
  let mockStderr: jest.Mock
  let tempDir: string
  let originalEnv: Record<string, string | undefined>

  beforeEach(() => {
    // Create temp directory for test installs
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-download-test-'))

    // Save original environment
    originalEnv = { ...process.env }

    // Mock stdout and stderr
    mockStdout = jest.fn()
    mockStderr = jest.fn()

    // Mock process.stdout.write and process.stderr.write
    jest.spyOn(process.stdout, 'write').mockImplementation(mockStdout)
    jest.spyOn(process.stderr, 'write').mockImplementation(mockStderr)

    // Mock fs operations
    jest.spyOn(fs, 'writeSync').mockImplementation(jest.fn())
    jest.spyOn(fs.promises, 'writeFile').mockImplementation(jest.fn())
    jest.spyOn(fs.promises, 'mkdir').mockImplementation(jest.fn())
    jest.spyOn(fs, 'existsSync').mockReturnValue(false)
    jest.spyOn(fs, 'mkdtempSync').mockReturnValue(tempDir)

    // Reset fetch mock
    mockFetch.mockReset()
  })

  afterEach(() => {
    // Restore environment
    process.env = originalEnv

    // Clean up temp directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }

    // Restore mocks
    jest.restoreAllMocks()
  })

  describe('Progress Display', () => {
    it('should show byte-level progress for downloads with content-length', async () => {
      // Create test data
      const testData = new Uint8Array(2048) // 2KB of data
      testData.fill(65) // Fill with 'A' character

      // Mock fetch response with content-length
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: (name: string) => {
            if (name === 'content-length')
              return '2048'
            return null
          },
        },
        body: new MockReadableStream(testData, 512), // 512 byte chunks
      })

      // Set up test environment
      process.env.NODE_ENV = 'development' // Allow network calls
      delete process.env.LAUNCHPAD_SHELL_INTEGRATION

      // Import and call downloadPackage (we need to mock the internals)
      const { downloadPackage } = await import('../src/install')

      try {
        // This will fail due to mocking, but we can test the progress display
        await downloadPackage('test.domain', '1.0.0', 'darwin', 'x86_64', tempDir)
      }
      catch {
        // Expected to fail due to mocking
      }

      // Verify progress messages were written
      const progressCalls = mockStdout.mock.calls.filter(call =>
        call[0].includes('⬇️') && call[0].includes('bytes') && call[0].includes('%'),
      )

      expect(progressCalls.length).toBeGreaterThan(0)

      // Check that progress shows bytes and percentages
      const progressMessages = progressCalls.map(call => call[0])
      expect(progressMessages.some(msg => msg.includes('/2048 bytes'))).toBe(true)
      expect(progressMessages.some(msg => msg.includes('%'))).toBe(true)
    })

    it('should show progress in shell integration mode', async () => {
      // Set up shell integration mode
      process.env.LAUNCHPAD_SHELL_INTEGRATION = '1'
      process.env.NODE_ENV = 'development'

      // Create test data
      const testData = new Uint8Array(1024)
      testData.fill(66) // Fill with 'B' character

      // Mock fetch response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: (name: string) => {
            if (name === 'content-length')
              return '1024'
            return null
          },
        },
        body: new MockReadableStream(testData, 256), // 256 byte chunks
      })

      const { downloadPackage } = await import('../src/install')

      try {
        await downloadPackage('test.domain', '1.0.0', 'darwin', 'x86_64', tempDir)
      }
      catch {
        // Expected to fail due to mocking
      }

      // Verify progress messages were written to stderr in shell mode
      const progressCalls = mockStderr.mock.calls.filter(call =>
        call[0].includes('⬇️') && call[0].includes('bytes'),
      )

      expect(progressCalls.length).toBeGreaterThan(0)
    })

    it('should show progress with package details in verbose mode', async () => {
      // Set up verbose mode
      const { config } = await import('../src/config')
      config.verbose = true

      process.env.NODE_ENV = 'development'

      // Create test data
      const testData = new Uint8Array(1024)
      testData.fill(67) // Fill with 'C' character

      // Mock fetch response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: (name: string) => {
            if (name === 'content-length')
              return '1024'
            return null
          },
        },
        body: new MockReadableStream(testData, 256),
      })

      const { downloadPackage } = await import('../src/install')

      try {
        await downloadPackage('test.domain', '1.0.0', 'darwin', 'x86_64', tempDir)
      }
      catch {
        // Expected to fail due to mocking
      }

      // Verify verbose progress messages include package details
      const progressCalls = mockStdout.mock.calls.filter(call =>
        call[0].includes('⬇️') && call[0].includes('test.domain') && call[0].includes('v1.0.0'),
      )

      expect(progressCalls.length).toBeGreaterThan(0)

      // Reset verbose mode
      config.verbose = false
    })

    it('should handle downloads without content-length header', async () => {
      process.env.NODE_ENV = 'development'

      // Create test data
      const testData = new Uint8Array(1024)
      testData.fill(68) // Fill with 'D' character

      // Mock fetch response without content-length
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: () => null, // No content-length header
        },
        arrayBuffer: async () => testData.buffer,
      })

      const { downloadPackage } = await import('../src/install')

      try {
        await downloadPackage('test.domain', '1.0.0', 'darwin', 'x86_64', tempDir)
      }
      catch {
        // Expected to fail due to mocking
      }

      // Verify download message was shown
      const downloadCalls = mockStdout.mock.calls.filter(call =>
        call[0].includes('⬇️') && call[0].includes('Downloading'),
      )

      expect(downloadCalls.length).toBeGreaterThan(0)
    })

    it('should clear progress messages after completion', async () => {
      process.env.NODE_ENV = 'development'

      // Create test data
      const testData = new Uint8Array(1024)
      testData.fill(69) // Fill with 'E' character

      // Mock fetch response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: (name: string) => {
            if (name === 'content-length')
              return '1024'
            return null
          },
        },
        body: new MockReadableStream(testData, 256),
      })

      const { downloadPackage } = await import('../src/install')

      try {
        await downloadPackage('test.domain', '1.0.0', 'darwin', 'x86_64', tempDir)
      }
      catch {
        // Expected to fail due to mocking
      }

      // Verify clear sequences were written
      const clearCalls = mockStdout.mock.calls.filter(call =>
        call[0].includes('\r\x1B[K'),
      )

      expect(clearCalls.length).toBeGreaterThan(0)
    })

    it('should throttle progress updates to avoid spam', async () => {
      process.env.NODE_ENV = 'development'

      // Create larger test data to generate more chunks
      const testData = new Uint8Array(10240) // 10KB
      testData.fill(70) // Fill with 'F' character

      // Mock fetch response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: (name: string) => {
            if (name === 'content-length')
              return '10240'
            return null
          },
        },
        body: new MockReadableStream(testData, 100), // Small chunks to generate many updates
      })

      const { downloadPackage } = await import('../src/install')

      try {
        await downloadPackage('test.domain', '1.0.0', 'darwin', 'x86_64', tempDir)
      }
      catch {
        // Expected to fail due to mocking
      }

      // Count progress updates
      const progressCalls = mockStdout.mock.calls.filter(call =>
        call[0].includes('⬇️') && call[0].includes('bytes') && call[0].includes('%'),
      )

      // Should have progress updates, but not one for every single chunk
      expect(progressCalls.length).toBeGreaterThan(0)
      expect(progressCalls.length).toBeLessThan(100) // Should be throttled
    })

    it('should show percentage progress rounded to nearest 5%', async () => {
      process.env.NODE_ENV = 'development'

      // Create test data
      const testData = new Uint8Array(1000) // 1000 bytes for easy percentage calculation
      testData.fill(71) // Fill with 'G' character

      // Mock fetch response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: (name: string) => {
            if (name === 'content-length')
              return '1000'
            return null
          },
        },
        body: new MockReadableStream(testData, 100), // 100 byte chunks = 10% each
      })

      const { downloadPackage } = await import('../src/install')

      try {
        await downloadPackage('test.domain', '1.0.0', 'darwin', 'x86_64', tempDir)
      }
      catch {
        // Expected to fail due to mocking
      }

      // Check that percentages are rounded to nearest 5%
      const progressCalls = mockStdout.mock.calls.filter(call =>
        call[0].includes('⬇️') && call[0].includes('%'),
      )

      const percentages = progressCalls.map((call) => {
        const match = call[0].match(/\((\d+)%\)/)
        return match ? Number.parseInt(match[1]) : null
      }).filter(p => p !== null)

      // All percentages should be multiples of 5
      percentages.forEach((percentage) => {
        expect(percentage % 5).toBe(0)
      })
    })
  })

  describe('Error Handling', () => {
    it('should handle network errors gracefully', async () => {
      process.env.NODE_ENV = 'development'

      // Mock fetch to reject
      mockFetch.mockRejectedValueOnce(new Error('Network error'))

      const { downloadPackage } = await import('../src/install')

      await expect(downloadPackage('test.domain', '1.0.0', 'darwin', 'x86_64', tempDir))
        .rejects
        .toThrow()
    })

    it('should handle HTTP errors gracefully', async () => {
      process.env.NODE_ENV = 'development'

      // Mock fetch to return 404
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
      })

      const { downloadPackage } = await import('../src/install')

      await expect(downloadPackage('test.domain', '1.0.0', 'darwin', 'x86_64', tempDir))
        .rejects
        .toThrow()
    })

    it('should handle stream reading errors', async () => {
      process.env.NODE_ENV = 'development'

      // Mock fetch response with broken stream
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: (name: string) => {
            if (name === 'content-length')
              return '1024'
            return null
          },
        },
        body: {
          getReader: () => ({
            read: async () => {
              throw new Error('Stream error')
            },
          }),
        },
      })

      const { downloadPackage } = await import('../src/install')

      await expect(downloadPackage('test.domain', '1.0.0', 'darwin', 'x86_64', tempDir))
        .rejects
        .toThrow()
    })
  })

  describe('Bun Download Progress', () => {
    it('should show progress for Bun downloads', async () => {
      process.env.NODE_ENV = 'development'

      // Create test data
      const testData = new Uint8Array(2048)
      testData.fill(72) // Fill with 'H' character

      // Mock fetch response for Bun download
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: (name: string) => {
            if (name === 'content-length')
              return '2048'
            return null
          },
        },
        body: new MockReadableStream(testData, 512),
      })

      const { install_bun } = await import('../src/bun')

      try {
        await install_bun(tempDir, '1.0.0')
      }
      catch {
        // Expected to fail due to mocking
      }

      // Verify Bun progress messages were written
      const progressCalls = mockStdout.mock.calls.filter(call =>
        call[0].includes('⬇️') && call[0].includes('bytes') && call[0].includes('%'),
      )

      expect(progressCalls.length).toBeGreaterThan(0)
    })

    it('should show Bun-specific progress in verbose mode', async () => {
      process.env.NODE_ENV = 'development'

      // Set up verbose mode
      const { config } = await import('../src/config')
      config.verbose = true

      // Create test data
      const testData = new Uint8Array(1024)
      testData.fill(73) // Fill with 'I' character

      // Mock fetch response
      mockFetch.mockResolvedValueOnce({
        ok: true,
        headers: {
          get: (name: string) => {
            if (name === 'content-length')
              return '1024'
            return null
          },
        },
        body: new MockReadableStream(testData, 256),
      })

      const { install_bun } = await import('../src/bun')

      try {
        await install_bun(tempDir, '1.0.0')
      }
      catch {
        // Expected to fail due to mocking
      }

      // Verify verbose Bun progress messages include version details
      const progressCalls = mockStdout.mock.calls.filter(call =>
        call[0].includes('⬇️') && call[0].includes('Bun v1.0.0'),
      )

      expect(progressCalls.length).toBeGreaterThan(0)

      // Reset verbose mode
      config.verbose = false
    })
  })

  describe('Cache vs Download Progress', () => {
    it('should show cache loading messages for cached packages', async () => {
      // Mock cache hit
      jest.spyOn(fs, 'existsSync').mockReturnValue(true)
      jest.spyOn(fs, 'statSync').mockReturnValue({ size: 1024 } as any)
      jest.spyOn(fs, 'copyFileSync').mockImplementation(jest.fn())

      process.env.NODE_ENV = 'development'

      const { downloadPackage } = await import('../src/install')

      try {
        await downloadPackage('test.domain', '1.0.0', 'darwin', 'x86_64', tempDir)
      }
      catch {
        // Expected to fail due to mocking
      }

      // Verify cache loading messages were written
      const cacheCalls = mockStdout.mock.calls.filter(call =>
        call[0].includes('🔄') && call[0].includes('Loading') && call[0].includes('cache'),
      )

      expect(cacheCalls.length).toBeGreaterThan(0)
    })

    it('should not show download progress for cached packages', async () => {
      // Mock cache hit
      jest.spyOn(fs, 'existsSync').mockReturnValue(true)
      jest.spyOn(fs, 'statSync').mockReturnValue({ size: 1024 } as any)
      jest.spyOn(fs, 'copyFileSync').mockImplementation(jest.fn())

      process.env.NODE_ENV = 'development'

      const { downloadPackage } = await import('../src/install')

      try {
        await downloadPackage('test.domain', '1.0.0', 'darwin', 'x86_64', tempDir)
      }
      catch {
        // Expected to fail due to mocking
      }

      // Verify no download progress messages for cached packages
      const downloadCalls = mockStdout.mock.calls.filter(call =>
        call[0].includes('⬇️') && call[0].includes('bytes') && call[0].includes('%'),
      )

      expect(downloadCalls.length).toBe(0)
    })
  })
})
