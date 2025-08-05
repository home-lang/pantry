import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { addToPath, isInPath } from '../src/utils'

describe('Utils', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string

  beforeEach(() => {
    originalEnv = { ...process.env }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-test-'))
  })

  afterEach(() => {
    // Restore environment variables properly without replacing the entire process.env object
    Object.keys(process.env).forEach((key) => {
      delete process.env[key]
    })
    Object.assign(process.env, originalEnv)
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  describe('isInPath', () => {
    it('should return true for directory in PATH', () => {
      process.env.PATH = '/usr/bin:/usr/local/bin:/custom/path'
      expect(isInPath('/usr/bin')).toBe(true)
      expect(isInPath('/usr/local/bin')).toBe(true)
      expect(isInPath('/custom/path')).toBe(true)
    })

    it('should return false for directory not in PATH', () => {
      process.env.PATH = '/usr/bin:/usr/local/bin'
      expect(isInPath('/not/in/path')).toBe(false)
      expect(isInPath('/another/missing')).toBe(false)
    })

    it('should handle empty PATH', () => {
      delete process.env.PATH
      expect(isInPath('/usr/bin')).toBe(false)
    })

    it('should handle exact matches only', () => {
      process.env.PATH = '/usr/bin:/usr/local/bin'
      expect(isInPath('/usr')).toBe(false)
      expect(isInPath('/usr/bin/subdir')).toBe(false)
    })

    it('should handle paths with trailing slashes', () => {
      process.env.PATH = '/usr/bin/:/usr/local/bin'
      expect(isInPath('/usr/bin/')).toBe(true)
      expect(isInPath('/usr/bin')).toBe(false) // Exact match required
    })
  })

  describe('addToPath', () => {
    let originalFs: any

    beforeEach(() => {
      // Store original fs methods
      originalFs = {
        existsSync: fs.existsSync,
        readFileSync: fs.readFileSync,
        appendFileSync: fs.appendFileSync,
      }
    })

    afterEach(() => {
      // Restore original fs methods
      fs.existsSync = originalFs.existsSync
      fs.readFileSync = originalFs.readFileSync
      fs.appendFileSync = originalFs.appendFileSync
    })

    it('should add path to PATH environment variable', () => {
      const originalPath = process.env.PATH
      const testPath = '/test/path'

      addToPath(testPath)

      expect(process.env.PATH).toContain(testPath)
      expect(process.env.PATH).toContain(originalPath)

      // Cleanup
      process.env.PATH = originalPath
    })

    it('should not add path if already in PATH', () => {
      const originalPath = process.env.PATH
      const testPath = '/test/path'

      // Add path first time
      addToPath(testPath)
      const firstAdd = process.env.PATH

      // Add path second time
      addToPath(testPath)
      const secondAdd = process.env.PATH

      expect((firstAdd ?? '')).toBe((secondAdd ?? ''))

      // Cleanup
      process.env.PATH = originalPath
    })

    it('should handle empty PATH', () => {
      const originalPath = process.env.PATH
      delete process.env.PATH

      const testPath = '/test/path'
      addToPath(testPath)

      expect((process.env.PATH ?? '')).toBe(testPath)

      // Cleanup
      process.env.PATH = originalPath
    })

    it('should handle undefined PATH', () => {
      const originalPath = process.env.PATH
      process.env.PATH = undefined

      const testPath = '/test/path'
      addToPath(testPath)

      expect((process.env.PATH ?? '')).toBe(testPath)

      // Cleanup
      process.env.PATH = originalPath
    })
  })

  describe('edge cases', () => {
    it('should handle undefined PATH environment variable', () => {
      delete process.env.PATH
      expect(() => isInPath('/usr/bin')).not.toThrow()
    })

    it('should handle empty string PATH', () => {
      process.env.PATH = ''
      expect(isInPath('/usr/bin')).toBe(false)
    })

    it('should handle PATH with only colons', () => {
      process.env.PATH = ':::'
      expect(isInPath('/usr/bin')).toBe(false)
    })

    it('should handle very long PATH', () => {
      const longPath = Array.from({ length: 1000 }).fill('/very/long/path').join(':')
      process.env.PATH = longPath
      expect(() => isInPath('/usr/bin')).not.toThrow()
    })
  })
})
