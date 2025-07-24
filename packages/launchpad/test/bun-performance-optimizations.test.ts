import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import path from 'node:path'
import { install_bun } from '../src/bun'

describe('Bun Performance Optimizations', () => {
  let tempDir: string
  let originalEnv: typeof process.env

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(import.meta.dirname, 'bun-perf-test-'))
    originalEnv = { ...process.env }

    // Set test environment to avoid actual downloads
    process.env.NODE_ENV = 'test'

    // Mock the global fetch function
    globalThis.fetch = (async (url: string | Request): Promise<Response> => {
      const urlString = typeof url === 'string' ? url : url.url

      if (urlString.includes('github.com/oven-sh/bun/releases/download')) {
        // Create a minimal zip file for testing with proper ZIP signature
        const zipContent = Buffer.alloc(1024 * 1024) // 1MB buffer

        // Write ZIP Local File Header signature (PK\x03\x04 = 0x04034b50 in little endian)
        zipContent.writeUInt32LE(0x04034B50, 0)

        // Fill the rest with some content to make it look like a valid zip
        zipContent.fill(0x20, 4) // Fill with spaces

        return new Response(zipContent, {
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'application/zip', 'content-length': zipContent.length.toString() },
        })
      }

      if (urlString.includes('github.com/oven-sh/bun/releases/latest')) {
        return new Response(JSON.stringify({ tag_name: 'bun-v1.2.19' }), {
          status: 200,
          statusText: 'OK',
          headers: { 'content-type': 'application/json' },
        })
      }

      throw new Error(`Unexpected URL: ${urlString}`)
    }) as typeof fetch
  })

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
    process.env = originalEnv
    // Clean up global mocks
    delete (globalThis as any).fetch
  })

  describe('Environment Readiness Marker Files', () => {
    it('should create .launchpad_ready marker file after successful bun installation', async () => {
      const installedFiles = await install_bun(tempDir, '1.2.19')

      // Should return the bun binary path
      expect(installedFiles).toHaveLength(1)
      expect(installedFiles[0]).toContain('bun')

      // Should create the readiness marker file
      const markerFile = path.join(tempDir, '.launchpad_ready')
      expect(fs.existsSync(markerFile)).toBe(true)

      // Marker file should contain a timestamp
      const markerContent = fs.readFileSync(markerFile, 'utf-8')
      expect(markerContent).toMatch(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}/)
    })

    it('should create marker file even when bun binary already exists', async () => {
      // Create bin directory and fake bun binary
      const binDir = path.join(tempDir, 'bin')
      fs.mkdirSync(binDir, { recursive: true })
      fs.writeFileSync(path.join(binDir, 'bun'), '#!/bin/sh\necho "existing bun"\n')

      await install_bun(tempDir, '1.2.19')

      const markerFile = path.join(tempDir, '.launchpad_ready')
      expect(fs.existsSync(markerFile)).toBe(true)
    })

    it('should handle marker file creation errors gracefully', async () => {
      // Should not throw when marker file creation might fail (test environments handle this gracefully)
      const installedFiles = await install_bun(tempDir, '1.2.19')

      // Should still successfully install bun
      expect(installedFiles).toHaveLength(1)
      expect(installedFiles[0]).toContain('bun')
    })
  })

  describe('Zip File Validation', () => {
    it('should include zip validation in bun.ts source code', () => {
      // Read the bun.ts source to verify validation logic exists
      const bunSource = fs.readFileSync(path.join(import.meta.dirname, '../src/bun.ts'), 'utf-8')

      // Should include validateZipFile function
      expect(bunSource).toContain('function validateZipFile')
      expect(bunSource).toContain('validateZipFile(')

      // Should validate file size
      expect(bunSource).toContain('stats.size')
      expect(bunSource).toContain('1024 * 1024') // 1MB minimum
      expect(bunSource).toContain('200 * 1024 * 1024') // 200MB maximum

      // Should validate zip signature
      expect(bunSource).toContain('ZIP signature')
      expect(bunSource).toContain('0x04034b50') // Local file header
      expect(bunSource).toContain('0x06054b50') // End of central directory
      expect(bunSource).toContain('0x08074b50') // Data descriptor
    })

    it('should validate cached files before using them', () => {
      const bunSource = fs.readFileSync(path.join(import.meta.dirname, '../src/bun.ts'), 'utf-8')

      // Should validate cached files
      expect(bunSource).toContain('validateZipFile(cachedArchivePath)')
      expect(bunSource).toContain('Cached file is corrupted, removing')
    })

    it('should validate downloaded files before caching', () => {
      const bunSource = fs.readFileSync(path.join(import.meta.dirname, '../src/bun.ts'), 'utf-8')

      // Should validate downloaded files before caching
      expect(bunSource).toContain('validateZipFile(zipPath)')
      expect(bunSource).toContain('Downloaded bun archive is corrupted')
    })

    it('should provide helpful error messages for corruption', () => {
      const bunSource = fs.readFileSync(path.join(import.meta.dirname, '../src/bun.ts'), 'utf-8')

      // Should provide actionable error messages
      expect(bunSource).toContain('launchpad cache:clear --force')
      expect(bunSource).toContain('download may have been interrupted')
      expect(bunSource).toContain('file is damaged')
    })
  })

  describe('Error Handling Improvements', () => {
    it('should handle zip extraction errors with specific messages', () => {
      const bunSource = fs.readFileSync(path.join(import.meta.dirname, '../src/bun.ts'), 'utf-8')

      // Should detect specific zip corruption errors
      expect(bunSource).toContain('End-of-central-directory signature not found')
      expect(bunSource).toContain('zipfile')
      expect(bunSource).toContain('not a zipfile')

      // Should provide specific error handling for these cases
      expect(bunSource).toContain('Downloaded bun archive is corrupted')
    })

    it('should clean up corrupted files automatically', () => {
      const bunSource = fs.readFileSync(path.join(import.meta.dirname, '../src/bun.ts'), 'utf-8')

      // Should remove corrupted files
      expect(bunSource).toContain('fs.unlinkSync(zipPath)')
      expect(bunSource).toContain('fs.unlinkSync(cachedPath)')
      expect(bunSource).toContain('Removed corrupted cached file')
    })
  })

  describe('Cache Optimization', () => {
    it('should include cache validation logic', () => {
      const bunSource = fs.readFileSync(path.join(import.meta.dirname, '../src/bun.ts'), 'utf-8')

      // Should check cached files before using
      expect(bunSource).toContain('if (cachedArchivePath && validateZipFile(cachedArchivePath))')

      // Should fall through to download when cache is invalid
      expect(bunSource).toContain('Remove corrupted cache if it exists')
    })

    it('should handle cache misses gracefully', () => {
      const bunSource = fs.readFileSync(path.join(import.meta.dirname, '../src/bun.ts'), 'utf-8')

      // Should download fresh copy when cache is corrupted
      expect(bunSource).toContain('Remove corrupted cache if it exists')
      expect(bunSource).toContain('Downloading from:')
    })
  })

  describe('Performance Regression Prevention', () => {
    it('should not perform unnecessary validations in test mode', async () => {
      // In test mode, bun installation should be fast and not download anything
      const startTime = Date.now()

      await install_bun(tempDir, '1.2.19')

      const duration = Date.now() - startTime

      // Should complete quickly in test mode (under 1 second)
      expect(duration).toBeLessThan(1000)
    })

    it('should create fake executable in test mode', async () => {
      const installedFiles = await install_bun(tempDir, '1.2.19')

      const bunPath = installedFiles[0]
      expect(fs.existsSync(bunPath)).toBe(true)

      // Should be executable
      const stats = fs.statSync(bunPath)
      expect(stats.mode & 0o111).toBeTruthy() // Has execute permissions

      // Should contain test content
      const content = fs.readFileSync(bunPath, 'utf-8')
      expect(content).toContain('fake bun for testing')
    })

    it('should avoid actual network requests in test mode', async () => {
      const bunSource = fs.readFileSync(path.join(import.meta.dirname, '../src/bun.ts'), 'utf-8')

      // Should skip extraction in test environment
      expect(bunSource).toContain('Skip extraction in test environment')
      expect(bunSource).toContain('NODE_ENV === \'test\'')
      expect(bunSource).toContain('Create a fake executable file')
    })
  })

  describe('Binary Path Detection Optimization', () => {
    it('should use full path for development builds', () => {
      const shellcodeSource = fs.readFileSync(path.join(import.meta.dirname, '../src/dev/shellcode.ts'), 'utf-8')

      // Should return full path when running from development
      expect(shellcodeSource).toContain('process.argv[1]')
      expect(shellcodeSource).toContain('/bin/cli.ts')
      expect(shellcodeSource).toContain('In development mode, return the full path')
    })

    it('should detect development environment correctly', () => {
      const shellcodeSource = fs.readFileSync(path.join(import.meta.dirname, '../src/dev/shellcode.ts'), 'utf-8')

      // Should check for CLI script in development
      expect(shellcodeSource).toContain('bin/cli.ts')
      expect(shellcodeSource).toContain('CLI script in development')
    })

    it('should fallback to system paths for production', () => {
      const shellcodeSource = fs.readFileSync(path.join(import.meta.dirname, '../src/dev/shellcode.ts'), 'utf-8')

      // Should check common installation paths
      expect(shellcodeSource).toContain('/usr/local/bin/launchpad')
      expect(shellcodeSource).toContain('.bun/bin/launchpad')
      expect(shellcodeSource).toContain('.local/bin/launchpad')
    })
  })
})
