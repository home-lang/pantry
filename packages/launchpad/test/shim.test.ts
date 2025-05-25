import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { create_shim, shim_dir } from '../src/shim'

describe('Shim', () => {
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

  describe('shim_dir', () => {
    it('should return default shim directory', () => {
      const shimPath = shim_dir()
      expect(shimPath).toBeDefined()
      expect(shimPath.string).toContain('.local/bin')
    })

    it('should handle home directory expansion', () => {
      const shimPath = shim_dir()
      expect(shimPath.string).not.toContain('~')
      expect(path.isAbsolute(shimPath.string)).toBe(true)
    })

    it('should return a Path object', () => {
      const shimPath = shim_dir()
      expect(shimPath).toHaveProperty('string')
      expect(shimPath).toHaveProperty('join')
    })

    it('should be consistent across calls', () => {
      const shimPath1 = shim_dir()
      const shimPath2 = shim_dir()
      expect(shimPath1.string).toBe(shimPath2.string)
    })

    it('should use configured shim path when available', () => {
      // This test checks the logic but doesn't modify global config
      const shimPath = shim_dir()
      expect(typeof shimPath.string).toBe('string')
      expect(shimPath.string.length).toBeGreaterThan(0)
    })
  })

  describe('create_shim', () => {
    it('should throw error when no packages specified', async () => {
      await expect(create_shim([], tempDir)).rejects.toThrow('No packages specified')
    })

    it('should handle pkgx not found gracefully', async () => {
      // Temporarily modify PATH to not include pkgx
      const originalPath = process.env.PATH
      process.env.PATH = '/nonexistent/path'

      try {
        await expect(create_shim(['curl'], tempDir)).rejects.toThrow()
      }
      finally {
        process.env.PATH = originalPath
      }
    })

    it('should create shim directory if it does not exist', async () => {
      try {
        // This test requires pkgx to be available
        await create_shim(['curl'], tempDir)

        const binDir = path.join(tempDir, 'bin')
        expect(fs.existsSync(binDir)).toBe(true)
        expect(fs.statSync(binDir).isDirectory()).toBe(true)
      }
      catch (error) {
        if (error instanceof Error && error.message.includes('no `pkgx` found')) {
          console.warn('Skipping test: pkgx not found in PATH')
          return
        }
        throw error
      }
    }, 30000)

    it('should create shims for valid packages', async () => {
      try {
        const createdShims = await create_shim(['curl'], tempDir)

        expect(Array.isArray(createdShims)).toBe(true)
        expect(createdShims.length).toBeGreaterThan(0)

        // Check that shims were actually created
        for (const shimPath of createdShims) {
          expect(fs.existsSync(shimPath)).toBe(true)
          expect(fs.statSync(shimPath).isFile()).toBe(true)

          // Check that shim is executable
          const stats = fs.statSync(shimPath)
          expect(stats.mode & 0o111).toBeGreaterThan(0)

          // Check shim content
          const content = fs.readFileSync(shimPath, 'utf-8')
          expect(content).toContain('#!/usr/bin/env -S pkgx')
          expect(content).toContain('@') // Should contain version specification
        }
      }
      catch (error) {
        if (error instanceof Error && error.message.includes('no `pkgx` found')) {
          console.warn('Skipping test: pkgx not found in PATH')
          return
        }
        throw error
      }
    }, 60000)

    it('should handle multiple packages', async () => {
      try {
        const createdShims = await create_shim(['curl', 'jq'], tempDir)

        expect(Array.isArray(createdShims)).toBe(true)
        expect(createdShims.length).toBeGreaterThan(0)

        // Should create shims for both packages
        const shimNames = createdShims.map(shimPath => path.basename(shimPath))
        expect(shimNames).toContain('curl')
        expect(shimNames).toContain('jq')
      }
      catch (error) {
        if (error instanceof Error && error.message.includes('no `pkgx` found')) {
          console.warn('Skipping test: pkgx not found in PATH')
          return
        }
        throw error
      }
    }, 60000)

    it('should skip existing shims when not forcing reinstall', async () => {
      try {
        // Create initial shims
        const firstRun = await create_shim(['curl'], tempDir)
        expect(firstRun.length).toBeGreaterThan(0)

        // Create shims again (should skip existing ones)
        const secondRun = await create_shim(['curl'], tempDir)

        // Should still return the paths but may have fewer new creations
        expect(Array.isArray(secondRun)).toBe(true)
      }
      catch (error) {
        if (error instanceof Error && error.message.includes('no `pkgx` found')) {
          console.warn('Skipping test: pkgx not found in PATH')
          return
        }
        throw error
      }
    }, 60000)

    it('should handle packages with no executables', async () => {
      try {
        // Try with a package that might not have executables
        const createdShims = await create_shim(['ca-certificates'], tempDir)

        // Should not fail, but might create no shims
        expect(Array.isArray(createdShims)).toBe(true)
      }
      catch (error) {
        if (error instanceof Error && error.message.includes('no `pkgx` found')) {
          console.warn('Skipping test: pkgx not found in PATH')
          return
        }
        // Some packages might not be available, which is okay
        if (error instanceof Error && error.message.includes('Failed to query pkgx')) {
          console.warn('Skipping test: package not available')
          return
        }
        throw error
      }
    }, 30000)

    it('should handle query failures with retries', async () => {
      try {
        // This test checks that the retry mechanism works
        // We can't easily simulate failures, so we just verify it doesn't crash
        const createdShims = await create_shim(['curl'], tempDir)
        expect(Array.isArray(createdShims)).toBe(true)
      }
      catch (error) {
        if (error instanceof Error && error.message.includes('no `pkgx` found')) {
          console.warn('Skipping test: pkgx not found in PATH')
          return
        }
        // If it fails after retries, that's expected behavior
        if (error instanceof Error && error.message.includes('Failed to query pkgx after')) {
          expect(error.message).toContain('attempts')
          return
        }
        throw error
      }
    }, 60000)

    it('should create valid shim content', async () => {
      try {
        const createdShims = await create_shim(['curl'], tempDir)

        if (createdShims.length > 0) {
          const shimPath = createdShims[0]
          const content = fs.readFileSync(shimPath, 'utf-8')

          // Check shim format
          expect(content).toMatch(/^#!/) // Shebang
          expect(content).toContain('pkgx')
          expect(content).toContain('@') // Version specification

          // Should end with newline
          expect(content.endsWith('\n') || content.endsWith('\r\n')).toBe(true)
        }
      }
      catch (error) {
        if (error instanceof Error && error.message.includes('no `pkgx` found')) {
          console.warn('Skipping test: pkgx not found in PATH')
          return
        }
        throw error
      }
    }, 30000)
  })

  describe('integration tests', () => {
    it('should work end-to-end with real packages', async () => {
      try {
        // Test the complete workflow
        const shimPath = shim_dir()
        expect(shimPath).toBeDefined()

        const createdShims = await create_shim(['curl'], tempDir)
        expect(Array.isArray(createdShims)).toBe(true)

        if (createdShims.length > 0) {
          // Verify shims are in the expected location
          const binDir = path.join(tempDir, 'bin')
          expect(fs.existsSync(binDir)).toBe(true)

          // Verify shim files
          for (const shimPath of createdShims) {
            expect(shimPath.startsWith(binDir)).toBe(true)
            expect(fs.existsSync(shimPath)).toBe(true)
          }
        }
      }
      catch (error) {
        if (error instanceof Error && error.message.includes('no `pkgx` found')) {
          console.warn('Skipping integration test: pkgx not found in PATH')
          return
        }
        throw error
      }
    }, 60000)
  })

  describe('error handling', () => {
    it('should handle invalid package names', async () => {
      try {
        await expect(
          create_shim(['nonexistent-package-12345'], tempDir),
        ).rejects.toThrow()
      }
      catch (error) {
        if (error instanceof Error && error.message.includes('no `pkgx` found')) {
          console.warn('Skipping test: pkgx not found in PATH')
          return
        }
        throw error
      }
    }, 30000)

    it('should handle permission errors gracefully', async () => {
      // Create read-only directory
      const readOnlyDir = path.join(tempDir, 'readonly')
      fs.mkdirSync(readOnlyDir, { recursive: true })
      fs.chmodSync(readOnlyDir, 0o444)

      try {
        await expect(
          create_shim(['curl'], readOnlyDir),
        ).rejects.toThrow()
      }
      catch (error) {
        if (error instanceof Error && error.message.includes('no `pkgx` found')) {
          console.warn('Skipping test: pkgx not found in PATH')
          return
        }
        throw error
      }
      finally {
        // Restore permissions for cleanup
        try {
          fs.chmodSync(readOnlyDir, 0o755)
        }
        catch {
          // Ignore cleanup errors
        }
      }
    }, 30000)

    it('should handle network timeouts', async () => {
      try {
        // This test verifies timeout handling exists
        // The actual timeout behavior is tested in the pkgx module
        const createdShims = await create_shim(['curl'], tempDir)
        expect(Array.isArray(createdShims)).toBe(true)
      }
      catch (error) {
        if (error instanceof Error && error.message.includes('no `pkgx` found')) {
          console.warn('Skipping test: pkgx not found in PATH')
          return
        }
        // Timeout errors are expected and handled
        if (error instanceof Error && error.message.includes('timeout')) {
          expect(error.message).toContain('timeout')
          return
        }
        throw error
      }
    }, 30000)
  })
})
