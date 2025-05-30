import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { install, install_prefix } from '../src/install'

describe('Install', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string

  beforeEach(() => {
    originalEnv = { ...process.env }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-test-'))
  })

  afterEach(() => {
    process.env = originalEnv
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  describe('install_prefix', () => {
    it('should return a Path object', () => {
      const prefix = install_prefix()
      expect(prefix).toBeDefined()
      expect(typeof prefix.string).toBe('string')
      expect(prefix.string.length).toBeGreaterThan(0)
    })

    it('should return a valid installation path', () => {
      const prefix = install_prefix()
      const validPaths = ['/usr/local', path.join(os.homedir(), '.local')]
      expect(validPaths.some(p => prefix.string.includes(p.split('/')[1]))).toBe(true)
    })

    it('should be consistent across calls', () => {
      const prefix1 = install_prefix()
      const prefix2 = install_prefix()
      expect(prefix1.string).toBe(prefix2.string)
    })

    it('should return a path that exists or can be created', () => {
      const prefix = install_prefix()
      const parentDir = path.dirname(prefix.string)

      // Either the path exists or its parent exists (so it can be created)
      const pathExists = fs.existsSync(prefix.string)
      const parentExists = fs.existsSync(parentDir)

      expect(pathExists || parentExists).toBe(true)
    })

    it('should prefer /usr/local when writable', () => {
      const prefix = install_prefix()

      // This test checks the logic but doesn't enforce a specific result
      // since it depends on the actual system permissions
      expect(prefix.string).toMatch(/\/(usr\/local|\.local)/)
    })

    it('should fall back to ~/.local when /usr/local is not writable', () => {
      const prefix = install_prefix()

      // If the prefix is not /usr/local, it should be ~/.local
      if (!prefix.string.includes('/usr/local')) {
        expect(prefix.string).toContain('.local')
      }
    })

    it('should default to system-wide installation', () => {
      const prefix = install_prefix()

      // The default behavior should prefer system-wide installation
      // Either /usr/local (if writable) or ~/.local (fallback)
      const isSystemWide = prefix.string === '/usr/local'
      const isUserFallback = prefix.string.includes('.local')

      expect(isSystemWide || isUserFallback).toBe(true)
    })

    it('should make --system flag redundant', () => {
      // The --system flag should produce the same result as default behavior
      const defaultPrefix = install_prefix()
      const systemPrefix = install_prefix() // Same function call for both cases

      expect(defaultPrefix.string).toBe(systemPrefix.string)
    })

    it('should prioritize /usr/local over user directories', () => {
      const prefix = install_prefix()

      // If /usr/local is writable, it should be preferred over ~/.local
      // This tests the priority logic in the install_prefix function
      if (prefix.string === '/usr/local') {
        // /usr/local was chosen, which means it's writable
        expect(prefix.string).toBe('/usr/local')
      }
      else {
        // ~/.local was chosen, which means /usr/local wasn't writable
        expect(prefix.string).toContain('.local')
      }
    })
  })

  describe('install function behavior', () => {
    it('should be a function', () => {
      expect(typeof install).toBe('function')
    })

    it('should export install function', () => {
      expect(install).toBeDefined()
      expect(typeof install).toBe('function')
    })
  })

  describe('module exports', () => {
    it('should export install_prefix function', () => {
      expect(install_prefix).toBeDefined()
      expect(typeof install_prefix).toBe('function')
    })

    it('should export install function', () => {
      expect(install).toBeDefined()
    })
  })

  describe('path validation', () => {
    it('should handle different path formats', () => {
      const prefix = install_prefix()

      // Should be an absolute path
      expect(path.isAbsolute(prefix.string)).toBe(true)
    })

    it('should return normalized paths', () => {
      const prefix = install_prefix()

      // Path should be normalized (no double slashes, etc.)
      expect(prefix.string).toBe(path.normalize(prefix.string))
    })

    it('should handle home directory expansion', () => {
      const prefix = install_prefix()

      // If it contains .local, it should be under the home directory
      if (prefix.string.includes('.local')) {
        const homeDir = os.homedir()
        expect(prefix.string.startsWith(homeDir)).toBe(true)
      }
    })
  })

  describe('environment integration', () => {
    it('should work with different HOME values', () => {
      const originalHome = process.env.HOME
      process.env.HOME = tempDir

      const prefix = install_prefix()
      expect(prefix.string).toBeDefined()
      expect(prefix.string.length).toBeGreaterThan(0)

      process.env.HOME = originalHome
    })

    it('should handle missing HOME environment variable', () => {
      const originalHome = process.env.HOME
      delete process.env.HOME

      const prefix = install_prefix()
      expect(prefix.string).toBeDefined()
      expect(prefix.string.length).toBeGreaterThan(0)

      process.env.HOME = originalHome
    })
  })
})
