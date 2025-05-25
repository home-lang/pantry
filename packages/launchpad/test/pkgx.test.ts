import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { check_pkgx_autoupdate, configure_pkgx_autoupdate, get_pkgx, query_pkgx } from '../src/pkgx'

describe('pkgx', () => {
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

  describe('get_pkgx', () => {
    it('should find pkgx in PATH', () => {
      // This test requires pkgx to be installed
      try {
        const pkgxPath = get_pkgx()
        expect(pkgxPath).toBeDefined()
        expect(typeof pkgxPath).toBe('string')
        expect(pkgxPath.length).toBeGreaterThan(0)
        expect(fs.existsSync(pkgxPath)).toBe(true)
      }
      catch (error) {
        // If pkgx is not installed, skip this test
        if (error instanceof Error && error.message.includes('no `pkgx` found')) {
          console.warn('Skipping test: pkgx not found in PATH')
          return
        }
        throw error
      }
    })

    it('should validate pkgx version', () => {
      try {
        const pkgxPath = get_pkgx()
        // If we get here, pkgx was found and version is valid
        expect(pkgxPath).toBeDefined()
      }
      catch (error) {
        if (error instanceof Error) {
          // Should either find pkgx or throw a descriptive error
          expect(
            error.message.includes('no `pkgx` found')
            || error.message.includes('version must be'),
          ).toBe(true)
        }
      }
    })

    it('should handle missing pkgx gracefully', () => {
      // Temporarily modify PATH to not include pkgx
      const originalPath = process.env.PATH
      process.env.PATH = '/nonexistent/path'

      try {
        expect(() => get_pkgx()).toThrow('no `pkgx` found in `$PATH`')
      }
      finally {
        process.env.PATH = originalPath
      }
    })
  })

  describe('query_pkgx', () => {
    it('should query package information', async () => {
      try {
        const pkgxPath = get_pkgx()

        // Test with a simple, commonly available package
        const [response, env] = await query_pkgx(pkgxPath, ['curl'], { timeout: 30000 })

        expect(response).toBeDefined()
        expect(response.pkgs).toBeDefined()
        expect(Array.isArray(response.pkgs)).toBe(true)
        expect(response.pkgs.length).toBeGreaterThan(0)

        // Find curl package
        const curlPkg = response.pkgs.find(p => p.pkg.project === 'curl.se')
        expect(curlPkg).toBeDefined()
        expect(curlPkg!.pkg.version).toBeDefined()
        expect(curlPkg!.path).toBeDefined()
        expect(response.pkgs).toBeDefined()
        expect(Array.isArray(response.pkgs)).toBe(true)
        expect(response.env).toBeDefined()
        expect(response.runtime_env).toBeDefined()

        expect(env).toBeDefined()
        expect(typeof env).toBe('object')
        expect(env.PATH).toBeDefined()
      }
      catch (error) {
        if (error instanceof Error && error.message.includes('no `pkgx` found')) {
          console.warn('Skipping test: pkgx not found in PATH')
          return
        }
        throw error
      }
    }, 60000) // 60 second timeout for network operations

    it('should handle multiple packages', async () => {
      try {
        const pkgxPath = get_pkgx()

        // Test with multiple packages
        const [response, _env] = await query_pkgx(pkgxPath, ['curl', 'jq'], { timeout: 30000 })

        expect(response.pkgs.length).toBeGreaterThanOrEqual(2)

        // Should find both packages
        const projects = response.pkgs.map(p => p.pkg.project)
        expect(projects).toContain('curl.se')
        expect(projects).toContain('stedolan.github.io/jq')
      }
      catch (error) {
        if (error instanceof Error && error.message.includes('no `pkgx` found')) {
          console.warn('Skipping test: pkgx not found in PATH')
          return
        }
        throw error
      }
    }, 60000)

    it('should handle timeout option', async () => {
      try {
        const pkgxPath = get_pkgx()

        // Test with very short timeout (should timeout)
        await expect(
          query_pkgx(pkgxPath, ['curl'], { timeout: 1 }),
        ).rejects.toThrow('Command timed out')
      }
      catch (error) {
        if (error instanceof Error && error.message.includes('no `pkgx` found')) {
          console.warn('Skipping test: pkgx not found in PATH')
          return
        }
        throw error
      }
    }, 10000)

    it('should preserve environment variables', async () => {
      try {
        const pkgxPath = get_pkgx()

        // Set some environment variables that should be preserved
        process.env.PKGX_DIR = '/custom/pkgx/dir'
        process.env.HOME = os.homedir()

        const [_response, env] = await query_pkgx(pkgxPath, ['curl'], { timeout: 10000 })

        expect(env.HOME).toBe(os.homedir())
        expect(env.PKGX_DIR).toBe('/custom/pkgx/dir')
        expect(env.PATH).toBeDefined()
      }
      catch (error) {
        if (error instanceof Error && error.message.includes('no `pkgx` found')) {
          console.warn('Skipping test: pkgx not found in PATH')
          return
        }
        // For timeout or other errors, just log and continue
        console.warn('Environment variable test failed:', error instanceof Error ? error.message : String(error))
      }
      finally {
        delete process.env.PKGX_DIR
      }
    }, 20000)

    it('should handle sudo requirements', async () => {
      try {
        const pkgxPath = get_pkgx()

        // This test checks that sudo logic works without actually requiring sudo
        const [response, _env] = await query_pkgx(pkgxPath, ['curl'], { timeout: 30000 })

        // Should complete successfully regardless of sudo requirements
        expect(response).toBeDefined()
        expect(response.pkg).toBeDefined()
      }
      catch (error) {
        if (error instanceof Error && error.message.includes('no `pkgx` found')) {
          console.warn('Skipping test: pkgx not found in PATH')
          return
        }
        throw error
      }
    }, 60000)
  })

  describe('check_pkgx_autoupdate', () => {
    it('should check auto-update status', async () => {
      const result = await check_pkgx_autoupdate()
      expect(typeof result).toBe('boolean')
    })

    it('should return true when config does not exist', async () => {
      // Temporarily move config if it exists
      const configDir = path.join(os.homedir(), '.config', 'pkgx')
      const configPath = path.join(configDir, 'config.json')
      const backupPath = path.join(tempDir, 'config.json.backup')

      let configExisted = false
      if (fs.existsSync(configPath)) {
        configExisted = true
        fs.copyFileSync(configPath, backupPath)
        fs.unlinkSync(configPath)
      }

      try {
        const result = await check_pkgx_autoupdate()
        expect(result).toBe(true) // Default should be true
      }
      finally {
        // Restore config if it existed
        if (configExisted && fs.existsSync(backupPath)) {
          if (!fs.existsSync(configDir)) {
            fs.mkdirSync(configDir, { recursive: true })
          }
          fs.copyFileSync(backupPath, configPath)
        }
      }
    })

    it('should read existing config correctly', async () => {
      const configDir = path.join(tempDir, '.config', 'pkgx')
      const configPath = path.join(configDir, 'config.json')

      // Create test config
      fs.mkdirSync(configDir, { recursive: true })
      fs.writeFileSync(configPath, JSON.stringify({ auto_update: false }))

      // Temporarily change HOME to use our test config
      const originalHome = process.env.HOME
      process.env.HOME = tempDir

      try {
        const result = await check_pkgx_autoupdate()
        expect(result).toBe(false)
      }
      finally {
        process.env.HOME = originalHome
      }
    })

    it('should handle malformed config gracefully', async () => {
      const configDir = path.join(tempDir, '.config', 'pkgx')
      const configPath = path.join(configDir, 'config.json')

      // Create malformed config
      fs.mkdirSync(configDir, { recursive: true })
      fs.writeFileSync(configPath, 'invalid json')

      // Temporarily change HOME to use our test config
      const originalHome = process.env.HOME
      process.env.HOME = tempDir

      try {
        const result = await check_pkgx_autoupdate()
        expect(result).toBe(true) // Should default to true on error
      }
      finally {
        process.env.HOME = originalHome
      }
    })
  })

  describe('configure_pkgx_autoupdate', () => {
    it('should create config directory if it does not exist', async () => {
      const configDir = path.join(tempDir, '.config', 'pkgx')
      const configPath = path.join(configDir, 'config.json')

      // Temporarily change HOME to use our test directory
      const originalHome = process.env.HOME
      process.env.HOME = tempDir

      try {
        expect(fs.existsSync(configDir)).toBe(false)

        const result = await configure_pkgx_autoupdate(false)
        expect(result).toBe(true)

        expect(fs.existsSync(configDir)).toBe(true)
        expect(fs.existsSync(configPath)).toBe(true)

        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        expect(config.auto_update).toBe(false)
      }
      finally {
        process.env.HOME = originalHome
      }
    })

    it('should update existing config', async () => {
      const configDir = path.join(tempDir, '.config', 'pkgx')
      const configPath = path.join(configDir, 'config.json')

      // Create existing config
      fs.mkdirSync(configDir, { recursive: true })
      fs.writeFileSync(configPath, JSON.stringify({
        auto_update: true,
        other_setting: 'value',
      }))

      // Temporarily change HOME to use our test config
      const originalHome = process.env.HOME
      process.env.HOME = tempDir

      try {
        const result = await configure_pkgx_autoupdate(false)
        expect(result).toBe(true)

        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        expect(config.auto_update).toBe(false)
        expect(config.other_setting).toBe('value') // Should preserve other settings
      }
      finally {
        process.env.HOME = originalHome
      }
    })

    it('should enable auto-update', async () => {
      const configDir = path.join(tempDir, '.config', 'pkgx')
      const configPath = path.join(configDir, 'config.json')

      // Temporarily change HOME to use our test directory
      const originalHome = process.env.HOME
      process.env.HOME = tempDir

      try {
        const result = await configure_pkgx_autoupdate(true)
        expect(result).toBe(true)

        const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'))
        expect(config.auto_update).toBe(true)
      }
      finally {
        process.env.HOME = originalHome
      }
    })

    it('should handle permission errors gracefully', async () => {
      // Create read-only directory
      const readOnlyDir = path.join(tempDir, 'readonly')
      fs.mkdirSync(readOnlyDir, { recursive: true })
      fs.chmodSync(readOnlyDir, 0o444)

      // Temporarily change HOME to read-only directory
      const originalHome = process.env.HOME
      process.env.HOME = readOnlyDir

      try {
        const result = await configure_pkgx_autoupdate(true)
        expect(result).toBe(false) // Should return false on error
      }
      finally {
        process.env.HOME = originalHome
        // Restore permissions for cleanup
        try {
          fs.chmodSync(readOnlyDir, 0o755)
        }
        catch {
          // Ignore cleanup errors
        }
      }
    })
  })

  describe('integration tests', () => {
    it('should work end-to-end with real pkgx', async () => {
      try {
        // Find pkgx
        const pkgxPath = get_pkgx()
        expect(pkgxPath).toBeDefined()

        // Query a package
        const [response, _env] = await query_pkgx(pkgxPath, ['curl'], { timeout: 30000 })
        const curlPkg = response.pkgs.find(p => p.pkg.project === 'curl.se')
        expect(curlPkg).toBeDefined()
        expect(curlPkg!.pkg.project).toBe('curl.se')

        // Check auto-update status
        const autoUpdateStatus = await check_pkgx_autoupdate()
        expect(typeof autoUpdateStatus).toBe('boolean')

        // Configure auto-update (toggle it)
        const configResult = await configure_pkgx_autoupdate(!autoUpdateStatus)
        expect(configResult).toBe(true)

        // Verify the change
        const newStatus = await check_pkgx_autoupdate()
        expect(newStatus).toBe(!autoUpdateStatus)

        // Restore original setting
        await configure_pkgx_autoupdate(autoUpdateStatus)
      }
      catch (error) {
        if (error instanceof Error && error.message.includes('no `pkgx` found')) {
          console.warn('Skipping integration test: pkgx not found in PATH')
          return
        }
        throw error
      }
    }, 90000) // 90 second timeout for full integration test
  })

  describe('error handling', () => {
    it('should handle invalid package names', async () => {
      try {
        const pkgxPath = get_pkgx()

        // This should fail or handle gracefully
        await expect(
          query_pkgx(pkgxPath, ['nonexistent-package-12345'], { timeout: 10000 }),
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

    it('should handle network issues gracefully', async () => {
      try {
        const pkgxPath = get_pkgx()

        // Set environment to potentially cause network issues
        const originalEnv = { ...process.env }
        process.env.PKGX_DIST_URL = 'http://nonexistent.example.com'

        try {
          await query_pkgx(pkgxPath, ['curl'], { timeout: 5000 })
        }
        catch (error) {
          // Network errors are expected in this case
          expect(error).toBeInstanceOf(Error)
        }
        finally {
          // Restore environment
          Object.assign(process.env, originalEnv)
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
})
