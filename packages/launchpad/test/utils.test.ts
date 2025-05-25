import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { addToPath, isInPath, standardPath } from '../src/utils'

describe('Utils', () => {
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

  describe('standardPath', () => {
    it('should return a standard PATH with common directories', () => {
      const stdPath = standardPath()
      expect(stdPath).toContain('/usr/local/bin')
      expect(stdPath).toContain('/usr/bin')
      expect(stdPath).toContain('/bin')
    })

    it('should return consistent standard path regardless of current PATH', () => {
      const originalPath = process.env.PATH
      process.env.PATH = '/custom/path:/another/path'
      const stdPath = standardPath()

      // Should not include custom paths, only standard ones
      expect(stdPath).not.toContain('/custom/path')
      expect(stdPath).toContain('/usr/local/bin')
      expect(stdPath).toContain('/usr/bin')

      process.env.PATH = originalPath
    })

    it('should handle empty PATH', () => {
      delete process.env.PATH
      const stdPath = standardPath()
      expect(stdPath).toContain('/usr/local/bin')
      expect(stdPath).toContain('/usr/bin')
      expect(stdPath).toContain('/bin')
    })

    it('should include platform-specific paths on macOS', () => {
      const originalPlatform = process.platform
      Object.defineProperty(process, 'platform', { value: 'darwin' })

      const stdPath = standardPath()
      expect(stdPath).toContain('/opt/homebrew/bin')

      Object.defineProperty(process, 'platform', { value: originalPlatform })
    })
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

    it('should still try to add directory even if already in PATH', () => {
      process.env.PATH = '/usr/bin:/usr/local/bin:/custom/path'
      process.env.HOME = tempDir

      // Create a .zshrc file
      const zshrcPath = path.join(tempDir, '.zshrc')
      fs.writeFileSync(zshrcPath, '# existing content\n')

      const result = addToPath('/usr/bin')
      expect(result).toBe(true)

      // Check that the path was added to config even though it's in PATH
      const content = fs.readFileSync(zshrcPath, 'utf-8')
      expect(content).toContain('export PATH="/usr/bin:$PATH"')
    })

    it('should add directory to shell config when zsh config exists', () => {
      process.env.HOME = tempDir
      process.env.PATH = '/usr/bin'

      // Create a .zshrc file
      const zshrcPath = path.join(tempDir, '.zshrc')
      fs.writeFileSync(zshrcPath, '# existing content\n')

      const result = addToPath('/custom/path')
      expect(result).toBe(true)

      // Check that the path was added
      const content = fs.readFileSync(zshrcPath, 'utf-8')
      expect(content).toContain('export PATH="/custom/path:$PATH"')
    })

    it('should add directory to shell config when bash config exists', () => {
      process.env.HOME = tempDir
      process.env.PATH = '/usr/bin'

      // Create a .bashrc file
      const bashrcPath = path.join(tempDir, '.bashrc')
      fs.writeFileSync(bashrcPath, '# existing content\n')

      const result = addToPath('/custom/path')
      expect(result).toBe(true)

      // Check that the path was added
      const content = fs.readFileSync(bashrcPath, 'utf-8')
      expect(content).toContain('export PATH="/custom/path:$PATH"')
    })

    it('should return false when no shell config file exists', () => {
      process.env.HOME = tempDir
      process.env.PATH = '/usr/bin'

      // No shell config files exist in tempDir
      const result = addToPath('/custom/path')
      expect(result).toBe(false)
    })

    it('should handle missing HOME environment variable', () => {
      delete process.env.HOME
      process.env.PATH = '/usr/bin'

      const result = addToPath('/custom/path')
      expect(result).toBe(false)
    })

    it('should handle missing SHELL environment variable', () => {
      delete process.env.SHELL
      process.env.HOME = '/Users/testuser'
      process.env.PATH = '/usr/bin'

      const result = addToPath('/custom/path')
      expect(result).toBe(false)
    })

    it('should not add duplicate PATH entries', () => {
      process.env.HOME = tempDir
      process.env.PATH = '/usr/bin'

      // Create a .zshrc file with the path already added
      const zshrcPath = path.join(tempDir, '.zshrc')
      fs.writeFileSync(zshrcPath, 'export PATH="/custom/path:$PATH"\n')

      const result = addToPath('/custom/path')
      expect(result).toBe(true) // Returns true because path is already configured

      // Check that the path wasn't added again
      const content = fs.readFileSync(zshrcPath, 'utf-8')
      const matches = content.match(/export PATH="\/custom\/path:\$PATH"/g)
      expect(matches).toHaveLength(1) // Should only appear once
    })

    it('should handle Windows platform', () => {
      const originalPlatform = process.platform
      Object.defineProperty(process, 'platform', { value: 'win32' })
      process.env.PATH = '/usr/bin'
      process.env.HOME = tempDir // Ensure no shell config files exist

      const result = addToPath('/custom/path')
      expect(result).toBe(false)

      // Restore original platform
      Object.defineProperty(process, 'platform', { value: originalPlatform })
    })
  })

  describe('edge cases', () => {
    it('should handle undefined PATH environment variable', () => {
      delete process.env.PATH
      expect(() => standardPath()).not.toThrow()
      expect(() => isInPath('/usr/bin')).not.toThrow()
    })

    it('should handle empty string PATH', () => {
      process.env.PATH = ''
      expect(isInPath('/usr/bin')).toBe(false)
      expect(standardPath()).toContain('/usr/bin')
    })

    it('should handle PATH with only colons', () => {
      process.env.PATH = ':::'
      expect(isInPath('/usr/bin')).toBe(false)
      expect(() => standardPath()).not.toThrow()
    })

    it('should handle very long PATH', () => {
      const longPath = Array.from({ length: 1000 }).fill('/very/long/path').join(':')
      process.env.PATH = longPath
      expect(() => isInPath('/usr/bin')).not.toThrow()
      expect(() => standardPath()).not.toThrow()
    })
  })
})
