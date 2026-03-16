import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, test } from 'bun:test'
import {
  createTempDir,
  createTestDir,
  createTestFile,
  removeTempDir,
  withTempDir,
  withTempDirSync,
} from '../src/testing/temp'

describe('Temp directory helpers', () => {
  test('createTempDir creates a real directory', () => {
    const dir = createTempDir('pantry-test-')
    expect(existsSync(dir)).toBe(true)
    removeTempDir(dir)
  })

  test('removeTempDir deletes it', () => {
    const dir = createTempDir('pantry-test-')
    removeTempDir(dir)
    expect(existsSync(dir)).toBe(false)
  })

  test('removeTempDir is safe on non-existent path', () => {
    expect(() => removeTempDir('/nonexistent/path')).not.toThrow()
  })

  test('withTempDir cleans up after callback', async () => {
    let captured = ''
    await withTempDir('pantry-scoped-', async (dir) => {
      captured = dir
      expect(existsSync(dir)).toBe(true)
    })
    expect(existsSync(captured)).toBe(false)
  })

  test('withTempDir cleans up on error', async () => {
    let captured = ''
    try {
      await withTempDir('pantry-err-', async (dir) => {
        captured = dir
        throw new Error('boom')
      })
    }
    catch { /* expected */ }
    expect(existsSync(captured)).toBe(false)
  })

  test('withTempDir returns the callback value', async () => {
    const result = await withTempDir('pantry-ret-', async () => 42)
    expect(result).toBe(42)
  })

  test('withTempDirSync works synchronously', () => {
    let captured = ''
    withTempDirSync('pantry-sync-', (dir) => { captured = dir })
    expect(existsSync(captured)).toBe(false)
  })

  test('createTestFile writes content with nested dirs', () => {
    const dir = createTempDir('pantry-file-')
    const path = createTestFile(dir, 'a/b/c.txt', 'hello')
    expect(existsSync(path)).toBe(true)
    expect(readFileSync(path, 'utf-8')).toBe('hello')
    removeTempDir(dir)
  })

  test('createTestDir creates nested dirs', () => {
    const dir = createTempDir('pantry-mkdir-')
    const nested = createTestDir(dir, 'x/y/z')
    expect(existsSync(nested)).toBe(true)
    removeTempDir(dir)
  })

  test('full workflow: dir + files + cleanup', async () => {
    let dirPath = ''
    await withTempDir('pantry-workflow-', async (dir) => {
      dirPath = dir
      createTestFile(dir, 'package.json', '{}')
      createTestFile(dir, 'src/index.ts', 'export {}')
      createTestDir(dir, 'dist')
      expect(existsSync(join(dir, 'package.json'))).toBe(true)
      expect(existsSync(join(dir, 'src/index.ts'))).toBe(true)
      expect(existsSync(join(dir, 'dist'))).toBe(true)
    })
    expect(existsSync(dirPath)).toBe(false)
  })
})
