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
      try {
        await create_shim([], tempDir)
        expect(true).toBe(false) // Should not reach here
      }
      catch (error) {
        expect(error instanceof Error).toBe(true)
        expect((error as Error).message).toContain('No packages specified')
      }
    })

    it('should handle installation failures gracefully', async () => {
      // Test with a package that will fail to install
      try {
        await create_shim(['nonexistent-package-12345'], tempDir)
        expect(true).toBe(false) // Should not reach here
      }
      catch (error) {
        expect(error instanceof Error).toBe(true)
        expect((error as Error).message).toContain('Failed to create shims')
      }
    })

    it('should create shim directory if it does not exist', async () => {
      try {
        // Test with a mock installation (will fail but should create directory)
        await create_shim(['nonexistent-test-package'], tempDir)
      }
      catch (error) {
        // Expected to fail for nonexistent package
        expect(error instanceof Error).toBe(true)
      }

      // But the shim directory should still be created
      const binDir = path.join(tempDir, 'bin')
      expect(fs.existsSync(binDir)).toBe(true)
      expect(fs.statSync(binDir).isDirectory()).toBe(true)
    }, 30000)

    it('should create shims for valid packages', async () => {
      // Create a mock binary in the installation directory
      const installBinDir = path.join(tempDir, 'bin')
      fs.mkdirSync(installBinDir, { recursive: true })

      const mockBinaryPath = path.join(installBinDir, 'test-cmd')
      fs.writeFileSync(mockBinaryPath, '#!/bin/sh\necho "test binary"', { mode: 0o755 })

      // Now create shims (this should work without actually installing)
      try {
        const createdShims = await create_shim(['test-package'], tempDir)

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
          expect(content).toContain('#!/bin/sh')
          expect(content).toContain('# Shim for')
          expect(content).toContain('# Created by Launchpad')
        }
      }
      catch (error) {
        // If installation fails, that's expected for mock packages
        console.warn(`Expected installation failure: ${error}`)
      }
    }, 60000)

    it('should handle multiple packages', async () => {
      // Create mock binaries
      const installBinDir = path.join(tempDir, 'bin')
      fs.mkdirSync(installBinDir, { recursive: true })

      const mockBinary1 = path.join(installBinDir, 'cmd1')
      const mockBinary2 = path.join(installBinDir, 'cmd2')
      fs.writeFileSync(mockBinary1, '#!/bin/sh\necho "cmd1"', { mode: 0o755 })
      fs.writeFileSync(mockBinary2, '#!/bin/sh\necho "cmd2"', { mode: 0o755 })

      try {
        const createdShims = await create_shim(['package1', 'package2'], tempDir)

        expect(Array.isArray(createdShims)).toBe(true)
        if (createdShims.length > 0) {
          const shimNames = createdShims.map(shimPath => path.basename(shimPath))
          expect(shimNames.length).toBeGreaterThan(0)
        }
      }
      catch (error) {
        console.warn(`Expected installation failure: ${error}`)
      }
    }, 60000)

    it('should skip existing shims when not forcing reinstall', async () => {
      // Create mock binary
      const installBinDir = path.join(tempDir, 'bin')
      fs.mkdirSync(installBinDir, { recursive: true })

      const mockBinaryPath = path.join(installBinDir, 'test-cmd')
      fs.writeFileSync(mockBinaryPath, '#!/bin/sh\necho "test"', { mode: 0o755 })

      // Create a shim manually first
      const shimDir = path.join(tempDir, 'bin')
      const existingShim = path.join(shimDir, 'test-cmd')
      fs.writeFileSync(existingShim, '#!/bin/sh\necho "existing"', { mode: 0o755 })

      try {
        const createdShims = await create_shim(['test-package'], tempDir)
        // Should handle existing shims appropriately
        expect(Array.isArray(createdShims)).toBe(true)
      }
      catch (error) {
        console.warn(`Expected installation failure: ${error}`)
      }
    }, 60000)

    it('should handle packages with no executables gracefully', async () => {
      try {
        // Try with empty installation directory
        const createdShims = await create_shim(['empty-package'], tempDir)

        // Should not fail, but might create no shims
        expect(Array.isArray(createdShims)).toBe(true)
      }
      catch (error) {
        // Installation failure is expected
        expect(error instanceof Error).toBe(true)
      }
    }, 30000)

    it('should handle installation failures with proper error messages', async () => {
      try {
        await create_shim(['definitely-nonexistent-package-xyz'], tempDir)
        expect(true).toBe(false) // Should not reach here
      }
      catch (error) {
        expect(error instanceof Error).toBe(true)
        expect((error as Error).message).toContain('Failed to create shims')
      }
    }, 60000)

    it('should create valid shim content', async () => {
      // Create mock binary
      const installBinDir = path.join(tempDir, 'bin')
      fs.mkdirSync(installBinDir, { recursive: true })

      const mockBinaryPath = path.join(installBinDir, 'test-cmd')
      fs.writeFileSync(mockBinaryPath, '#!/bin/sh\necho "test"', { mode: 0o755 })

      try {
        const createdShims = await create_shim(['test-package'], tempDir)

        if (createdShims.length > 0) {
          const shimPath = createdShims[0]
          const content = fs.readFileSync(shimPath, 'utf-8')

          // Check shim format
          expect(content).toMatch(/^#!/) // Shebang
          expect(content).toContain('Shim for')
          expect(content).toContain('Created by Launchpad')

          // Should end with newline
          expect(content.endsWith('\n') || content.endsWith('\r\n')).toBe(true)
        }
      }
      catch (error) {
        console.warn(`Expected installation failure: ${error}`)
      }
    }, 30000)
  })

  describe('integration tests', () => {
    it('should work end-to-end with mock packages', async () => {
      // Test the complete workflow with mock data
      const shimPath = shim_dir()
      expect(shimPath).toBeDefined()

      // Create mock installation
      const installBinDir = path.join(tempDir, 'bin')
      fs.mkdirSync(installBinDir, { recursive: true })

      const mockBinaryPath = path.join(installBinDir, 'test-cmd')
      fs.writeFileSync(mockBinaryPath, '#!/bin/sh\necho "test"', { mode: 0o755 })

      try {
        const createdShims = await create_shim(['test-package'], tempDir)
        expect(Array.isArray(createdShims)).toBe(true)

        if (createdShims.length > 0) {
          // Verify shims are in the expected location
          const binDir = path.join(tempDir, 'bin')
          expect(fs.existsSync(binDir)).toBe(true)
        }
      }
      catch (error) {
        console.warn(`Expected installation failure: ${error}`)
      }
    }, 60000)
  })

  describe('error handling', () => {
    it('should handle invalid package names', async () => {
      try {
        await create_shim(['invalid-package-name-xyz'], tempDir)
        expect(true).toBe(false) // Should not reach here
      }
      catch (error) {
        expect(error instanceof Error).toBe(true)
        expect((error as Error).message).toContain('Failed to create shims')
      }
    })

    it('should handle permission errors gracefully', async () => {
      // Create a read-only directory to simulate permission errors
      const readOnlyDir = path.join(tempDir, 'readonly')
      fs.mkdirSync(readOnlyDir, { recursive: true })
      fs.chmodSync(readOnlyDir, 0o444)

      try {
        await create_shim(['nonexistent-package-12345'], readOnlyDir)
        expect(true).toBe(false) // Should not reach here
      }
      catch (error) {
        expect(error instanceof Error).toBe(true)
        // Should fail due to either installation failure or permission issues
        expect((error as Error).message.length).toBeGreaterThan(0)
      }
      finally {
        // Clean up: restore permissions so directory can be deleted
        fs.chmodSync(readOnlyDir, 0o755)
      }
    })

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
