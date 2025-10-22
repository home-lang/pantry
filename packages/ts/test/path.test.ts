import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { Path } from '../src/path'

describe('Path', () => {
  let tempDir: string

  beforeEach(() => {
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-test-'))
  })

  afterEach(() => {
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  describe('constructor', () => {
    it('should create a Path from string', () => {
      const p = new Path('/usr/local/bin')
      expect(p.string).toBe('/usr/local/bin')
    })

    it('should handle relative paths', () => {
      const p = new Path('./bin')
      expect(p.string).toBe('./bin')
    })

    it('should handle empty string', () => {
      const p = new Path('')
      expect(p.string).toBe('')
    })

    it('should handle home directory expansion', () => {
      const p = new Path('~/bin')
      expect(p.string).toBe('~/bin')
    })
  })

  describe('static methods', () => {
    it('should create home path', () => {
      const homePath = Path.home()
      expect(homePath.string).toBe(os.homedir())
    })
  })

  describe('join', () => {
    it('should join paths correctly', () => {
      const p = new Path('/usr/local')
      const joined = p.join('bin', 'node')
      expect(joined.string).toBe('/usr/local/bin/node')
    })

    it('should handle multiple segments', () => {
      const p = new Path('/usr')
      const joined = p.join('local', 'bin', 'node')
      expect(joined.string).toBe('/usr/local/bin/node')
    })

    it('should handle empty segments', () => {
      const p = new Path('/usr/local')
      const joined = p.join('', 'bin')
      expect(joined.string).toBe('/usr/local/bin')
    })
  })

  describe('parent', () => {
    it('should return parent directory', () => {
      const p = new Path('/usr/local/bin')
      const parent = p.parent()
      expect(parent.string).toBe('/usr/local')
    })

    it('should handle root directory', () => {
      const p = new Path('/')
      const parent = p.parent()
      expect(parent.string).toBe('/')
    })

    it('should handle relative paths', () => {
      const p = new Path('./bin/node')
      const parent = p.parent()
      expect(parent.string).toBe('./bin')
    })
  })

  describe('basename', () => {
    it('should return basename', () => {
      const p = new Path('/usr/local/bin/node')
      expect(p.basename()).toBe('node')
    })

    it('should handle paths without extension', () => {
      const p = new Path('/usr/local/bin')
      expect(p.basename()).toBe('bin')
    })

    it('should handle root path', () => {
      const p = new Path('/')
      expect(p.basename()).toBe('')
    })
  })

  describe('exists', () => {
    it('should return true for existing path', () => {
      const testFile = path.join(tempDir, 'test.txt')
      fs.writeFileSync(testFile, 'test')

      const p = new Path(testFile)
      expect(p.exists()).toBe(true)
    })

    it('should return false for non-existing path', () => {
      const p = new Path(path.join(tempDir, 'nonexistent.txt'))
      expect(p.exists()).toBe(false)
    })
  })

  describe('isDirectory', () => {
    it('should return true for directory', () => {
      const p = new Path(tempDir)
      expect(p.isDirectory()).toBe(true)
    })

    it('should return false for file', () => {
      const testFile = path.join(tempDir, 'test.txt')
      fs.writeFileSync(testFile, 'test')

      const p = new Path(testFile)
      expect(p.isDirectory()).toBe(false)
    })

    it('should return false for non-existing path', () => {
      const p = new Path(path.join(tempDir, 'nonexistent'))
      expect(p.isDirectory()).toBe(false)
    })
  })

  describe('relative', () => {
    it('should return relative path', () => {
      const from = new Path('/usr/local/bin')
      const to = new Path('/usr/local')
      expect(from.relative({ to })).toBe('bin')
    })

    it('should handle same directory', () => {
      const from = new Path('/usr/local')
      const to = new Path('/usr/local')
      expect(from.relative({ to })).toBe('')
    })
  })

  describe('ls', () => {
    it('should list directory contents', async () => {
      // Create test files
      const testFile = path.join(tempDir, 'test.txt')
      const testDir = path.join(tempDir, 'testdir')
      fs.writeFileSync(testFile, 'test')
      fs.mkdirSync(testDir)

      const p = new Path(tempDir)
      const entries = []
      for await (const [entryPath, info] of p.ls()) {
        entries.push({ path: entryPath.basename(), info })
      }

      expect(entries).toHaveLength(2)
      expect(entries.some(e => e.path === 'test.txt' && !e.info.isDirectory)).toBe(true)
      expect(entries.some(e => e.path === 'testdir' && e.info.isDirectory)).toBe(true)
    })

    it('should handle empty directory', async () => {
      const p = new Path(tempDir)
      const entries = []
      for await (const entry of p.ls()) {
        entries.push(entry)
      }

      expect(entries).toHaveLength(0)
    })
  })

  describe('string property', () => {
    it('should return the path as string', () => {
      const p = new Path('/usr/local/bin')
      expect(p.string).toBe('/usr/local/bin')
    })

    it('should handle complex paths', () => {
      const p = new Path('/usr/local/bin/../lib')
      expect(p.string).toBe('/usr/local/bin/../lib')
    })
  })
})
