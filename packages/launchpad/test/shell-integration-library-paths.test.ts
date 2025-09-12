import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import path from 'node:path'

describe('Shell Integration Library Paths', () => {
  let tempDir: string
  let originalHome: string | undefined

  beforeEach(() => {
    // Create a temporary test environment
    tempDir = fs.mkdtempSync(path.join(import.meta.dirname, 'lib-paths-test-'))
    originalHome = process.env.HOME
    process.env.HOME = tempDir
  })

  afterEach(() => {
    // Clean up
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
    if (originalHome) {
      process.env.HOME = originalHome
    }
    else {
      delete process.env.HOME
    }
  })

  // Helper to create mock package structure
  function createMockPackage(domain: string, version: string) {
    const packageDir = path.join(tempDir, '.local', 'share', 'launchpad', 'global', domain, `v${version}`)
    fs.mkdirSync(packageDir, { recursive: true })

    // Create lib directory with mock .so files
    const libDir = path.join(packageDir, 'lib')
    fs.mkdirSync(libDir, { recursive: true })
    fs.writeFileSync(path.join(libDir, `lib${domain.split('.')[0]}.so`), 'mock library')
    fs.writeFileSync(path.join(libDir, `lib${domain.split('.')[0]}.so.1`), 'mock library v1')

    // Create lib64 directory with mock .so files
    const lib64Dir = path.join(packageDir, 'lib64')
    fs.mkdirSync(lib64Dir, { recursive: true })
    fs.writeFileSync(path.join(lib64Dir, `lib${domain.split('.')[0]}64.so`), 'mock library 64bit')

    const binDir = path.join(packageDir, 'bin')
    fs.mkdirSync(binDir, { recursive: true })
    fs.writeFileSync(path.join(binDir, domain.split('.')[0]), '#!/bin/sh\necho "mock binary"\n')
    fs.chmodSync(path.join(binDir, domain.split('.')[0]), 0o755)
  }

  describe('Shell Integration Library Paths', () => {
    it('should generate correct shell code for library path setup', async () => {
      // Import the shellcode function
      const { shellcode } = await import('../src/dev/shellcode')

      const generatedShellCode = shellcode()

      // Check for PATH management
      expect(generatedShellCode).toContain('PATH')
      expect(generatedShellCode).toContain('export PATH')
    })

    it('should handle path management', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should handle path management
      expect(generatedShellCode).toContain('PATH')
      expect(generatedShellCode).toContain('__lp_prepend_path')
    })

    it('should handle environment variables', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should handle environment variables
      expect(generatedShellCode).toContain('LAUNCHPAD_DISABLE_SHELL_INTEGRATION')
      expect(generatedShellCode).toContain('LAUNCHPAD_SKIP_INITIAL_INTEGRATION')
    })
  })

  describe('Library Path Environment Variables', () => {
    it('should handle library path environment variables', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should handle library path environment variables
      expect(generatedShellCode).toContain('DYLD_LIBRARY_PATH')
      expect(generatedShellCode).toContain('DYLD_FALLBACK_LIBRARY_PATH')
      expect(generatedShellCode).toContain('LD_LIBRARY_PATH')
    })
  })
})
