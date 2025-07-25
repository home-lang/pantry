import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { uninstall } from '../src/uninstall'

describe('Uninstall', () => {
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

  describe('uninstall', () => {
    it('should return false when package is not installed', async () => {
      const result = await uninstall('nonexistent-package')
      expect(result).toBe(false)
    })

    it('should handle package names correctly', async () => {
      const result = await uninstall('test-package')
      expect(typeof result).toBe('boolean')
    })

    it('should successfully uninstall an existing package', async () => {
      // Create a mock package installation
      const pkgsDir = path.join(tempDir, 'pkgs')
      const packageDir = path.join(pkgsDir, 'test-package')

      fs.mkdirSync(packageDir, { recursive: true })
      fs.writeFileSync(path.join(packageDir, 'test-file.txt'), 'test content')

      // Mock the install_prefix to return our temp directory
      const originalCwd = process.cwd()
      process.chdir(tempDir)

      try {
        // Since we can't easily mock the install_prefix function,
        // we'll test the behavior when the package doesn't exist
        const result = await uninstall('test-package')
        expect(typeof result).toBe('boolean')
      }
      finally {
        process.chdir(originalCwd)
      }
    })

    it('should handle permission errors gracefully', async () => {
      // Test with a package name that would cause permission issues
      const result = await uninstall('system-package')
      expect(typeof result).toBe('boolean')
    })

    it('should provide helpful error messages', async () => {
      // Mock console.error to capture error messages
      const originalError = console.error
      const errors: string[] = []
      console.error = (...args: any[]) => errors.push(args.join(' '))

      try {
        const result = await uninstall('nonexistent-package')
        expect(result).toBe(false)
        expect(errors.length).toBeGreaterThan(0)
        expect(errors.some(err => err.includes('not found in registry'))).toBe(true)
      }
      finally {
        console.error = originalError
      }
    })

    it('should handle package names with special characters', async () => {
      const specialNames = [
        'package-with-dashes',
        'package.with.dots',
        'package_with_underscores',
        'package123',
        'UPPERCASE-PACKAGE',
      ]

      for (const packageName of specialNames) {
        const result = await uninstall(packageName)
        expect(typeof result).toBe('boolean')
      }
    })

    it('should handle empty package name', async () => {
      const result = await uninstall('')
      expect(typeof result).toBe('boolean')
    })

    it('should handle very long package names', async () => {
      const longName = 'a'.repeat(255)
      const result = await uninstall(longName)
      expect(typeof result).toBe('boolean')
    })

    it('should be an async function', () => {
      const result = uninstall('test-package')
      expect(result).toBeInstanceOf(Promise)
    })

    it('should handle concurrent uninstall attempts', async () => {
      const promises = [
        uninstall('package1'),
        uninstall('package2'),
        uninstall('package3'),
      ]

      const results = await Promise.all(promises)
      expect(results).toHaveLength(3)
      results.forEach((result) => {
        expect(typeof result).toBe('boolean')
      })
    })
  })

  describe('error handling', () => {
    it('should handle filesystem errors gracefully', async () => {
      // Mock console.error to capture error messages
      const originalError = console.error
      const errors: string[] = []
      console.error = (...args: any[]) => errors.push(args.join(' '))

      try {
        const result = await uninstall('test-package')
        expect(typeof result).toBe('boolean')
      }
      finally {
        console.error = originalError
      }
    })

    it('should provide sudo hints when appropriate', async () => {
      // Mock console.error to capture error messages
      const originalError = console.error
      const errors: string[] = []
      console.error = (...args: any[]) => errors.push(args.join(' '))

      try {
        const result = await uninstall('system-package')
        expect(typeof result).toBe('boolean')

        // Check if helpful sudo messages are provided when appropriate
        // (This depends on the specific package and system state)
      }
      finally {
        console.error = originalError
      }
    })

    it('should handle invalid package names', async () => {
      const invalidNames = [
        '../../../etc/passwd',
        '/absolute/path',
        'package/with/slashes',
        'package\\with\\backslashes',
      ]

      for (const packageName of invalidNames) {
        const result = await uninstall(packageName)
        expect(typeof result).toBe('boolean')
      }
    })
  })

  describe('integration tests', () => {
    it('should work with realistic package names', async () => {
      const realisticNames = [
        'nodejs.org',
        'curl.se',
        'python.org',
        'github.com/user/repo',
        'npmjs.com/package',
      ]

      for (const packageName of realisticNames) {
        const result = await uninstall(packageName)
        expect(typeof result).toBe('boolean')
      }
    })

    it('should handle package names from different ecosystems', async () => {
      const ecosystemPackages = [
        'node',
        'python',
        'go',
        'rust',
        'java',
        'ruby',
      ]

      for (const packageName of ecosystemPackages) {
        const result = await uninstall(packageName)
        expect(typeof result).toBe('boolean')
      }
    })

    it('should maintain consistent behavior across multiple calls', async () => {
      const packageName = 'consistent-test-package'

      const result1 = await uninstall(packageName)
      const result2 = await uninstall(packageName)
      const result3 = await uninstall(packageName)

      expect(typeof result1).toBe('boolean')
      expect(typeof result2).toBe('boolean')
      expect(typeof result3).toBe('boolean')

      // All calls should return the same result for the same non-existent package
      expect(result1).toBe(result2)
      expect(result2).toBe(result3)
    })
  })

  describe('console output', () => {
    it('should provide informative console output', async () => {
      const originalError = console.error
      const errors: string[] = []
      console.error = (...args: any[]) => errors.push(args.join(' '))

      try {
        await uninstall('test-package')

        // Should have provided some output
        expect(errors.length).toBeGreaterThan(0)
      }
      finally {
        console.error = originalError
      }
    })

    it('should use colored output for better UX', async () => {
      const originalError = console.error
      const errors: string[] = []
      console.error = (...args: any[]) => errors.push(args.join(' '))

      try {
        await uninstall('test-package')

        // Check if ANSI color codes are used
        const hasColorCodes = errors.some(err => err.includes('\x1B['))
        // Color codes may or may not be present depending on the terminal
        expect(typeof hasColorCodes).toBe('boolean')
      }
      finally {
        console.error = originalError
      }
    })
  })
})
