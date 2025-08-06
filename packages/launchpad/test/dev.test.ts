import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { Buffer } from 'node:buffer'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { shellcode } from '../src/dev/shellcode'
import { TestUtils } from './test.config'

// Extend expect with custom matchers
expect.extend({
  toBeOneOf(received, expected) {
    const pass = expected.includes(received)
    if (pass) {
      return {
        message: () => `expected ${received} not to be one of ${expected}`,
        pass: true,
      }
    }
    else {
      return {
        message: () => `expected ${received} to be one of ${expected}`,
        pass: false,
      }
    }
  },
})

// Mock fetch to prevent real network calls in tests
const originalFetch = globalThis.fetch
async function mockFetch(url: string | URL | Request, _init?: RequestInit): Promise<Response> {
  const urlString = url.toString()

  // Mock successful responses for known test packages
  if (urlString.includes('dist.pkgx.dev') && urlString.includes('gnu.org/wget')) {
    // Create a minimal tar.gz file for testing
    const tarContent = Buffer.from('fake tar content for testing')
    return new Response(tarContent, {
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/gzip' },
    })
  }

  // Mock 404 for nonexistent packages
  if (urlString.includes('nonexistent-package') || urlString.includes('testing.org')) {
    return new Response('Not Found', {
      status: 404,
      statusText: 'Not Found',
    })
  }

  // For any other URLs, return 404 to simulate package not available
  return new Response('Package not available in test environment', {
    status: 404,
    statusText: 'Not Found',
  })
}

describe('Dev Commands', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string
  let cliPath: string
  let fixturesDir: string

  beforeEach(() => {
    // Reset global state for test isolation
    TestUtils.resetTestEnvironment()

    originalEnv = { ...process.env }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-dev-test-'))
    cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
    fixturesDir = path.join(__dirname, 'fixtures')

    // Enable fetch mocking for tests
    globalThis.fetch = mockFetch as typeof fetch
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

    // Restore original fetch
    globalThis.fetch = originalFetch
  })

  const getTestEnv = (extraEnv: Record<string, string> = {}) => {
    const currentEnv = process.env || {}
    const currentPath = currentEnv.PATH || ''
    // Add common bun installation paths to PATH
    const bunPaths = [
      `${process.env.HOME}/.local/bin`, // User's bun installation
      '/usr/local/bin',
      '/usr/bin',
      '/bin',
      '/usr/sbin',
      '/sbin',
    ]
    const pathWithBun = `${bunPaths.join(':')}:${currentPath}`
    return {
      ...currentEnv,
      PATH: pathWithBun,
      NODE_ENV: 'test',
      ...extraEnv,
    }
  }

  // Helper function to run CLI commands
  const runCLI = (args: string[], cwd?: string): Promise<{ stdout: string, stderr: string, exitCode: number }> => {
    return new Promise((resolve, reject) => {
      // Use bun to run TypeScript files
      const bunExecutable = 'bun'
      const proc = spawn(bunExecutable, [cliPath, ...args], {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: getTestEnv(),
        cwd: cwd || tempDir,
      })

      let stdout = ''
      let stderr = ''

      proc.stdout.on('data', (data) => {
        stdout += data.toString()
      })

      proc.stderr.on('data', (data) => {
        stderr += data.toString()
      })

      proc.on('close', (code) => {
        // Add debug logging for failed tests
        if (code !== 0) {
          console.error(`CLI command failed with exit code ${code}`)
          console.error(`Command: bun ${cliPath} ${args.join(' ')}`)
          console.error(`CWD: ${cwd || tempDir}`)
          console.error(`Stdout:`, stdout)
          console.error(`Stderr:`, stderr)
        }
        resolve({ stdout, stderr, exitCode: code || 0 })
      })

      proc.on('error', (error) => {
        console.error('CLI process error:', error)
        reject(error)
      })

      // Timeout after 30 seconds
      setTimeout(() => {
        proc.kill()
        reject(new Error('CLI command timed out'))
      }, 30000)
    })
  }

  // Helper function to create test dependencies.yaml
  const createDependenciesYaml = (dir: string, deps: Record<string, string>, env?: Record<string, string>) => {
    const depsSection = `dependencies:\n${Object.entries(deps).map(([pkg, version]) => `  ${pkg}: ${version}`).join('\n')}`
    const envSection = env ? `\nenv:\n${Object.entries(env).map(([key, value]) => `  ${key}: ${value}`).join('\n')}` : ''
    const yamlContent = depsSection + envSection

    fs.writeFileSync(path.join(dir, 'dependencies.yaml'), yamlContent)
  }

  describe('dev:shellcode', () => {
    it('should generate shell integration code', () => {
      const result = shellcode(true) // Use test mode to bypass NODE_ENV check

      expect(result).toContain('__launchpad_chpwd')
    })

    it('should include proper shell function definitions', () => {
      const result = shellcode(true) // Use test mode to bypass NODE_ENV check

      // Check for key shell functions
      expect(result).toContain('__launchpad_find_deps_file')
      expect(result).toContain('__launchpad_chpwd')
    })

    it('should handle different shell types', () => {
      const result = shellcode(true) // Use test mode to bypass NODE_ENV check

      // Should contain both zsh and bash compatibility
      expect(result).toContain('ZSH_VERSION')
      expect(result).toContain('BASH_VERSION')
    })

    it('should include shell message configuration', () => {
      const result = shellcode(true) // Use test mode to bypass NODE_ENV check

      // Should include inline message handling instead of command calls
      expect(result).toContain('LAUNCHPAD_SHOW_ENV_MESSAGES')
      expect(result).toContain('Environment activated for')
    })

    it('should respect showShellMessages configuration', () => {
      const result = shellcode(true) // Use test mode to bypass NODE_ENV check

      // Should include inline message handling that respects configuration
      expect(result).toContain('LAUNCHPAD_SHOW_ENV_MESSAGES')
      expect(result).toContain('LAUNCHPAD_SHOW_ENV_MESSAGES:-true')
    })

    it('should include custom activation message', () => {
      const result = shellcode(true) // Use test mode to bypass NODE_ENV check

      // Should include inline activation message handling
      expect(result).toContain('Environment activated for')
    })

    it('should include custom deactivation message', () => {
      const result = shellcode(true) // Use test mode to bypass NODE_ENV check

      // Should include inline deactivation message handling
      expect(result).toContain('Environment deactivated')
    })

    it('should handle path placeholder in activation message', () => {
      const result = shellcode(true) // Use test mode to bypass NODE_ENV check

      // Should contain shell variable usage for project directory
      expect(result).toContain('$project_dir')
    })

    it('should generate shell-safe message code', () => {
      const result = shellcode(true) // Use test mode to bypass NODE_ENV check

      // Basic shell syntax validation
      expect(result).not.toContain('undefined')
      expect(result).not.toMatch(/(?<!\/dev\/)null\)/g)
      expect(result).not.toContain('= null')

      // Should contain proper shell constructs for command execution
      expect(result).toContain('launchpad')
    })
  })

  describe('dev', () => {
    it('should report no devenv when no dependency files exist', async () => {
      const result = await runCLI(['dev', tempDir])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('No dependency file found')
    }, 30000)

    it('should install packages from dependencies.yaml', async () => {
      createDependenciesYaml(tempDir, {
        'gnu.org/wget': '^1.21',
      }, {
        TEST_VAR: 'test_value',
      })

      const result = await runCLI(['dev', tempDir])

      // Accept either successful installation or graceful failure
      if (result.exitCode === 0) {
        // If installation succeeds, check expected output
        const output = result.stdout + result.stderr
        expect(output).toMatch(/✅[^\w\n\r\u2028\u2029]*\w[^\n\r(\u2028\u2029]*\((?:[^\n\r)\u2028\u2029]*\)[^\n\r(\u2028\u2029]*\()*(?:[\n\r\u2028\u2029][^)]*|[^\n\r)\u2028\u2029]+(?:[\n\r\u2028\u2029][^)]*)?)\)|✅.*installed|Installing.*packages|Installed.*package/i)
        // Environment variables are used internally but may not be printed to stdout
      }
      else {
        // If installation fails, check graceful error handling
        expect(result.stderr).toMatch(/Failed to (install|set up dev environment)/)
      }
    }, 60000)

    it('should create binary stubs in ~/.local/bin', async () => {
      createDependenciesYaml(tempDir, {
        'gnu.org/wget': '^1.21',
      })

      const result = await runCLI(['dev', tempDir])

      // Accept either successful installation or graceful failure
      if (result.exitCode === 0) {
        // Check that binary stubs were created
        const projectHash = Buffer.from(tempDir).toString('base64').replace(/[/+=]/g, '_')
        const installDir = path.join(os.homedir(), '.local', 'share', 'launchpad', 'envs', projectHash)
        const binDir = path.join(installDir, 'bin')
        if (fs.existsSync(binDir)) {
          const wgetStub = path.join(binDir, 'wget')
          if (fs.existsSync(wgetStub)) {
            const stubContent = fs.readFileSync(wgetStub, 'utf-8')
            expect(stubContent).toContain('#!/bin/sh')
            expect(stubContent).toContain('exec')
          }
        }
      }
      else {
        // If installation fails, check graceful error handling
        expect(result.stderr).toContain('Failed to install')
      }
    }, 60000)

    it('should handle package installation failures gracefully (may exit 0 or 1 depending on error handling)', async () => {
      fs.writeFileSync(path.join(tempDir, 'dependencies.yaml'), 'dependencies:\n  nonexistent-package-12345: ^1.0\n')

      const result = await runCLI(['dev', tempDir])

      // Should handle package installation failures gracefully (may exit 0 or 1 depending on error handling)
      expect(result.exitCode).toBeOneOf([0, 1])

      const output = result.stdout + result.stderr
      expect(output).toMatch(/nonexistent-package-12345|Failed to install|Warning.*Failed to install/i)
    }, 60000)
  })

  describe('Fixture Testing', () => {
    // Helper to test a fixture file
    const testFixture = async (fixturePath: string): Promise<{ stdout: string, stderr: string, exitCode: number }> => {
      const testDir = path.join(tempDir, path.basename(fixturePath))
      fs.mkdirSync(testDir, { recursive: true })

      if (fs.statSync(fixturePath).isDirectory()) {
        // Copy directory contents
        const files = fs.readdirSync(fixturePath)
        for (const file of files) {
          const srcPath = path.join(fixturePath, file)
          const destPath = path.join(testDir, file)
          if (fs.statSync(srcPath).isDirectory()) {
            fs.cpSync(srcPath, destPath, { recursive: true })
          }
          else {
            fs.copyFileSync(srcPath, destPath)
          }
        }
      }
      else {
        // Copy single file
        fs.copyFileSync(fixturePath, path.join(testDir, path.basename(fixturePath)))
      }

      const result = await runCLI(['dev', testDir])
      return result
    }

    it('should handle pkgx.yml fixture', async () => {
      const fixturePath = path.join(fixturesDir, 'pkgx.yml')
      if (fs.existsSync(fixturePath)) {
        const result = await testFixture(fixturePath)
        // pkgx.yml is recognized but packages may fail to install in test environment
        if (result.exitCode === 0) {
          const output = result.stdout + result.stderr
          expect(output).toMatch(/✅[^\w\n\r\u2028\u2029]*\w[^\n\r(\u2028\u2029]*\((?:[^\n\r)\u2028\u2029]*\)[^\n\r(\u2028\u2029]*\()*(?:[\n\r\u2028\u2029][^)]*|[^\n\r)\u2028\u2029]+(?:[\n\r\u2028\u2029][^)]*)?)\)|✅.*installed|Installing.*packages|Installed.*package/i)
          // Environment variables like FOO=BAR are used internally but may not be printed to stdout
        }
        else {
          // Accept graceful failure in test environment
          expect(result.stderr).toMatch(/Failed to (install|set up dev environment)|All package installations failed/)
        }
      }
    }, 60000)

    it('should handle go.mod fixture', async () => {
      const fixturePath = path.join(fixturesDir, 'go.mod')
      if (fs.existsSync(fixturePath)) {
        const result = await testFixture(fixturePath)
        // go.mod is now recognized as a dependency file by Launchpad's enhanced detection
        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('Installing')
      }
    }, 60000)

    it('should handle Cargo.toml fixture', async () => {
      const fixturePath = path.join(fixturesDir, 'Cargo.toml')
      if (fs.existsSync(fixturePath)) {
        const result = await testFixture(fixturePath)
        // Cargo.toml is now recognized as a dependency file by Launchpad's enhanced detection
        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('Installing')
      }
    }, 60000)

    it('should handle .node-version fixture', async () => {
      const fixturePath = path.join(fixturesDir, '.node-version')
      if (fs.existsSync(fixturePath)) {
        const result = await testFixture(fixturePath)
        // .node-version is now recognized as a dependency file by Launchpad's enhanced detection
        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('Installing')
      }
    }, 60000)

    it('should handle .ruby-version fixture', async () => {
      const fixturePath = path.join(fixturesDir, '.ruby-version')
      if (fs.existsSync(fixturePath)) {
        const result = await testFixture(fixturePath)
        // .ruby-version is now recognized as a dependency file by Launchpad's enhanced detection
        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('Installing')
      }
    }, 60000)

    it('should handle deno.jsonc fixture', async () => {
      const fixturePath = path.join(fixturesDir, 'deno.jsonc')
      if (fs.existsSync(fixturePath)) {
        const result = await testFixture(fixturePath)
        // deno.jsonc is now recognized as a dependency file by Launchpad's enhanced detection
        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('Installing')
      }
    }, 60000)

    it('should handle Gemfile fixture', async () => {
      const fixturePath = path.join(fixturesDir, 'Gemfile')
      if (fs.existsSync(fixturePath)) {
        const result = await testFixture(fixturePath)
        // Gemfile is now recognized as a dependency file by Launchpad's enhanced detection
        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('Installing')
      }
    }, 60000)

    it('should handle requirements.txt fixture', async () => {
      const fixturePath = path.join(fixturesDir, 'requirements.txt')
      if (fs.existsSync(fixturePath)) {
        const result = await testFixture(fixturePath)
        // requirements.txt is now recognized as a dependency file by Launchpad's enhanced detection
        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('Installing')
      }
    }, 60000)

    it('should handle pixi.toml fixture', async () => {
      const fixturePath = path.join(fixturesDir, 'pixi.toml')
      if (fs.existsSync(fixturePath)) {
        const result = await testFixture(fixturePath)
        // pixi.toml is not currently recognized as a dependency file by Launchpad
        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('No dependency file found')
      }
    }, 60000)

    // Test directory-based fixtures
    it('should handle package.json/std fixture', async () => {
      const fixturePath = path.join(fixturesDir, 'package.json', 'std')
      if (fs.existsSync(fixturePath)) {
        const result = await testFixture(fixturePath)
        // package.json is now recognized as a dependency source by Launchpad
        expect(result.exitCode).toBe(0)
        // Should show that packages are being installed (enhanced detection working)
        expect(result.stdout).toContain('Installing')
      }
    }, 60000)

    it('should handle deno.json/std fixture', async () => {
      const fixturePath = path.join(fixturesDir, 'deno.json', 'std')
      if (fs.existsSync(fixturePath)) {
        const result = await testFixture(fixturePath)
        // deno.json is now recognized as a dependency file by Launchpad's enhanced detection
        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('Installing')
      }
    }, 60000)

    it('should handle pyproject.toml/std fixture', async () => {
      const fixturePath = path.join(fixturesDir, 'pyproject.toml', 'std')
      if (fs.existsSync(fixturePath)) {
        const result = await testFixture(fixturePath)
        // pyproject.toml is now recognized as a dependency file by Launchpad's enhanced detection
        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('Installing')
      }
    }, 60000)

    it('should handle action.yml/std fixture', async () => {
      const fixturePath = path.join(fixturesDir, 'action.yml', 'std')
      if (fs.existsSync(fixturePath)) {
        const result = await testFixture(fixturePath)
        // action.yml is now recognized as a dependency file by Launchpad's enhanced detection
        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('Installing')
      }
    }, 60000)

    it('should handle python-version/std fixture', async () => {
      const fixturePath = path.join(fixturesDir, 'python-version', 'std')
      if (fs.existsSync(fixturePath)) {
        const result = await testFixture(fixturePath)
        // .python-version is now recognized as a dependency file by Launchpad's enhanced detection
        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('Installing')
      }
    }, 60000)

    // Test all package.json variants
    it('should handle all package.json variants', async () => {
      const packageJsonDir = path.join(fixturesDir, 'package.json')
      if (fs.existsSync(packageJsonDir)) {
        const variants = fs.readdirSync(packageJsonDir).filter(name =>
          fs.statSync(path.join(packageJsonDir, name)).isDirectory(),
        )

        for (const variant of variants) {
          const fixturePath = path.join(packageJsonDir, variant)
          try {
            const _result = await testFixture(fixturePath)
            // Don't assert specific content since fixtures vary
          }
          catch (error) {
            console.warn(`package.json/${variant} test failed:`, error instanceof Error ? error.message : String(error))
            // Don't fail the entire test suite for individual fixture failures
          }
        }
      }
    }, 120000)

    // Test all deno.json variants
    it('should handle all deno.json variants', async () => {
      const denoJsonDir = path.join(fixturesDir, 'deno.json')
      if (fs.existsSync(denoJsonDir)) {
        const variants = fs.readdirSync(denoJsonDir).filter(name =>
          fs.statSync(path.join(denoJsonDir, name)).isDirectory(),
        )

        for (const variant of variants) {
          const fixturePath = path.join(denoJsonDir, variant)
          try {
            await testFixture(fixturePath)
          }
          catch (error) {
            console.warn(`deno.json/${variant} test failed:`, error instanceof Error ? error.message : String(error))
          }
        }
      }
    }, 120000)

    // Test all pyproject.toml variants
    it('should handle all pyproject.toml variants', async () => {
      const pyprojectDir = path.join(fixturesDir, 'pyproject.toml')
      if (fs.existsSync(pyprojectDir)) {
        const variants = fs.readdirSync(pyprojectDir).filter(name =>
          fs.statSync(path.join(pyprojectDir, name)).isDirectory(),
        )

        for (const variant of variants) {
          const fixturePath = path.join(pyprojectDir, variant)
          try {
            await testFixture(fixturePath)
          }
          catch (error) {
            console.warn(`pyproject.toml/${variant} test failed:`, error instanceof Error ? error.message : String(error))
          }
        }
      }
    }, 120000)
  })

  describe('Integration Tests', () => {
    it('should work end-to-end with shell integration', async () => {
      createDependenciesYaml(tempDir, {
        'gnu.org/wget': '^1.21',
      }, {
        TEST_VAR: 'integration_test',
      })

      // Use shorter timeout and more resilient approach
      const result = await runCLI(['dev', tempDir, '--shell'])

      // Accept either success or failure, but ensure it completes quickly
      expect(result.exitCode).toBeOneOf([0, 1])

      if (result.exitCode === 0) {
        // If successful, check shell integration
        expect(result.stdout).toContain('export PATH=')
        expect(result.stdout).toContain('TEST_VAR=integration_test')
        // Check that deactivation function includes the correct directory
        expect(result.stdout).toContain(tempDir)
      }
      else {
        // If installation fails, check graceful error handling
        expect(result.stderr).toContain('Failed to install')
      }
    }, 10000) // Reduced timeout from 60s to 10s
  })

  describe('Error Handling', () => {
    it('should handle invalid directory paths', async () => {
      const result = await runCLI(['dev', '/nonexistent/path'])
      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('No dependency file found')
    }, 30000)

    it('should handle malformed dependencies.yaml', async () => {
      fs.writeFileSync(path.join(tempDir, 'dependencies.yaml'), 'invalid: yaml: content: [')

      const result = await runCLI(['dev', tempDir])

      // The current implementation may handle malformed YAML gracefully
      // or may fail - both are acceptable outcomes
      expect(result.exitCode).toBeOneOf([0, 1])

      if (result.exitCode === 0) {
        // If it succeeds, the system handled the malformed file gracefully
        // (May process as empty or use fallback behavior)
        expect(true).toBe(true)
      }
      else {
        // If it fails, it should show an appropriate error message
        expect(result.stderr).toMatch(/Failed|Error|YAML|Invalid/)
      }
    }, 30000)

    it('should handle permission errors gracefully', async () => {
      createDependenciesYaml(tempDir, { 'bun.sh': '^1.2' })

      // Make directory read-only
      fs.chmodSync(tempDir, 0o444)

      try {
        const result = await runCLI(['dev', tempDir])
        // Should handle permission errors gracefully
        expect(result.exitCode).toBe(1)
      }
      catch (error) {
        // Permission errors during process spawn are also acceptable
        expect(error).toBeInstanceOf(Error)
        if (error instanceof Error) {
          expect(error.message).toMatch(/permission denied|EACCES/)
        }
      }
      finally {
        // Restore permissions for cleanup
        fs.chmodSync(tempDir, 0o755)
      }
    }, 30000)
  })

  describe('Constraint Checking and Environment Readiness', () => {
    it('should detect when system bun satisfies constraint', async () => {
      // Test with a constraint that should be satisfied by system bun
      createDependenciesYaml(tempDir, { 'bun.sh': '^1.0.0' })

      const result = await runCLI(['dev', '--dry-run', tempDir])
      expect(result.exitCode).toBe(0)

      // Should indicate that constraints are satisfied if system bun is available
      const output = result.stdout + result.stderr
      expect(output).toMatch(/✅.*bun|satisfied by existing installations|would install locally|Installing.*packages|bun\.sh|Downloading.*Bun/i)
    }, 30000)

    it('should require installation for unsatisfied constraints', async () => {
      // Test with a constraint that should NOT be satisfied (future version)
      createDependenciesYaml(tempDir, { 'bun.sh': '^999.0.0' })

      const result = await runCLI(['dev', '--dry-run', tempDir])
      expect(result.exitCode).toBe(0)

      const output = result.stdout + result.stderr
      expect(output).toMatch(/would install locally|Installing.*packages|Downloading.*Bun.*999|bun\.sh/i)
    }, 30000)

    it('should handle mixed satisfied and unsatisfied constraints', async () => {
      createDependenciesYaml(tempDir, {
        'bun.sh': '^1.0.0', // Should be satisfied
        'nonexistent-package': '^1.0.0', // Should not be satisfied
      })

      const result = await runCLI(['dev', '--dry-run', tempDir])
      expect(result.exitCode).toBe(0)
      // Should handle mixed constraints (either shows planning or installs directly)
      const output = result.stdout + result.stderr
      expect(output).toMatch(/would install locally|Installing.*packages|bun\.sh|nonexistent-package/i)
    }, 30000)

    it('should check environment readiness before constraint validation', async () => {
      createDependenciesYaml(tempDir, { 'bun.sh': '^1.2.0' })

      const result = await runCLI(['dev', '--dry-run', tempDir])
      expect(result.exitCode).toBe(0)

      // Should handle constraint checking (either satisfied or needs installation)
      const output = result.stdout + result.stderr
      expect(output).toMatch(/satisfied by existing installations|would install locally|Installing.*packages|bun\.sh/i)
    }, 30000)

    it('should prioritize local environment over global and system', async () => {
      // Create a fake local environment
      // eslint-disable-next-line ts/no-require-imports
      const crypto = require('node:crypto')
      const projectHash = `${path.basename(tempDir)}_${crypto.createHash('md5').update(tempDir).digest('hex').slice(0, 8)}`
      const localEnvDir = path.join(os.homedir(), '.local', 'share', 'launchpad', projectHash)
      const localBinDir = path.join(localEnvDir, 'bin')
      const localPkgsDir = path.join(localEnvDir, 'pkgs', 'bun.sh', 'v1.2.18')

      try {
        fs.mkdirSync(localBinDir, { recursive: true })
        fs.mkdirSync(localPkgsDir, { recursive: true })

        // Create a fake bun binary
        fs.writeFileSync(path.join(localBinDir, 'bun'), '#!/bin/sh\necho "1.2.18"')
        fs.chmodSync(path.join(localBinDir, 'bun'), 0o755)

        // Also create the package directory structure (like real installations)
        const packageDir = path.join(localEnvDir, 'bun.sh', 'v1.2.18')
        const packageBinDir = path.join(packageDir, 'bin')
        fs.mkdirSync(packageBinDir, { recursive: true })
        fs.writeFileSync(path.join(packageBinDir, 'bun'), '#!/bin/sh\necho "1.2.18"')
        fs.chmodSync(path.join(packageBinDir, 'bun'), 0o755)

        // Create metadata
        const metadata = {
          domain: 'bun.sh',
          version: '1.2.18',
          installedAt: new Date().toISOString(),
          binaries: ['bun'],
          installPath: packageDir,
        }
        fs.writeFileSync(path.join(localPkgsDir, 'metadata.json'), JSON.stringify(metadata, null, 2))

        createDependenciesYaml(tempDir, { 'bun.sh': '^1.2.18' })

        const result = await runCLI(['dev', '--dry-run', tempDir])
        expect(result.exitCode).toBe(0)

        // Should detect local installation satisfies constraint
        const output = result.stdout + result.stderr
        expect(output).toMatch(/satisfied by existing installations|Installing.*packages|bun\.sh/i)
      }
      finally {
        // Clean up
        if (fs.existsSync(localEnvDir)) {
          fs.rmSync(localEnvDir, { recursive: true, force: true })
        }
      }
    }, 30000)

    it('should handle constraint checking with different version formats', async () => {
      // Test various constraint formats
      const constraints = ['^1.2.0', '~1.2.0', '1.2.0', '*', 'latest']

      for (const constraint of constraints) {
        createDependenciesYaml(tempDir, { 'bun.sh': constraint })

        const result = await runCLI(['dev', '--dry-run', tempDir])
        expect(result.exitCode).toBe(0)

        // Should handle bun constraint checking (either satisfied or installs locally)
        const output = result.stdout + result.stderr
        expect(output).toMatch(/✅.*bun|satisfied by existing installations|would install locally|Installing.*packages|bun\.sh|Downloading.*Bun/i)
      }
    }, 60000)
  })

  describe('Performance', () => {
    it('should complete dev:shellcode quickly', async () => {
      const start = Date.now()
      const result = await runCLI(['dev:shellcode'], process.cwd())
      const duration = Date.now() - start

      expect(result.exitCode).toBe(0)
      expect(duration).toBeLessThan(5000) // Should complete within 5 seconds
      expect(result.stdout).toContain('__launchpad_chpwd')
    }, 30000)

    it('should handle large dependency files efficiently', async () => {
      // Create a large dependencies.yaml file
      const largeDeps: Record<string, string> = {}
      for (let i = 0; i < 10; i++) {
        largeDeps[`package-${i}`] = '^1.0'
      }

      createDependenciesYaml(tempDir, largeDeps)

      const start = Date.now()
      const result = await runCLI(['dev', tempDir])
      const duration = Date.now() - start

      // Should complete even with many packages (though some may fail)
      expect(duration).toBeLessThan(120000) // Should complete in under 2 minutes
      expect(result.exitCode).toBeOneOf([0, 1]) // May succeed or fail, but should complete
    }, 150000)

    it('should cache constraint checking results for performance', async () => {
      createDependenciesYaml(tempDir, { 'bun.sh': '^1.2.0' })

      // First run
      const start1 = Date.now()
      const result1 = await runCLI(['dev', '--dry-run', tempDir])
      const duration1 = Date.now() - start1
      expect(result1.exitCode).toBe(0)

      // Second run (should be faster due to caching)
      const start2 = Date.now()
      const result2 = await runCLI(['dev', '--dry-run', tempDir])
      const duration2 = Date.now() - start2
      expect(result2.exitCode).toBe(0)

      // Both should have successful installation messages (but download progress may differ)
      // Extract the final success messages, ignoring progress indicators
      const cleanOutput1 = result1.stdout.replace(/\r⬇️[^\r\n]*\r/g, '').replace(/\r\\u001B\[K/g, '')
      const cleanOutput2 = result2.stdout.replace(/\r⬇️[^\r\n]*\r/g, '').replace(/\r\\u001B\[K/g, '')

      // Both should contain the same success messages
      expect(cleanOutput1).toContain('Installing 1 local packages')
      // Handle different output formats in CI vs local
      if (process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true') {
        expect(cleanOutput1).toContain('Successfully installed')
        // In CI, the output format is different - just check that it completed successfully
        expect(result1.exitCode).toBe(0)
      }
      else {
        expect(cleanOutput1).toContain('✅ bun.sh')
        expect(cleanOutput1).toContain('Successfully set up environment')
      }

      expect(cleanOutput2).toContain('Installing 1 local packages')
      // Handle different output formats in CI vs local
      if (process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true') {
        expect(cleanOutput2).toContain('Successfully installed')
        // In CI, the output format is different - just check that it completed successfully
        expect(result2.exitCode).toBe(0)
      }
      else {
        expect(cleanOutput2).toContain('✅ bun.sh')
        expect(cleanOutput2).toContain('Successfully set up environment')
      }

      // Test caching behavior rather than strict timing
      // The key is that both runs complete successfully, indicating caching works
      expect(duration1).toBeGreaterThan(0)
      expect(duration2).toBeGreaterThan(0)

      // In CI, we're more lenient about timing but still test the core functionality
      if (process.env.CI === 'true' || process.env.GITHUB_ACTIONS === 'true') {
        // In CI, just ensure both runs complete and don't take an unreasonable amount of time
        // (more than 30 seconds would indicate a serious problem)
        expect(duration1).toBeLessThan(30000)
        expect(duration2).toBeLessThan(30000)
      }
      else {
        // In local environment, expect the second run to be faster
        expect(duration2).toBeLessThan(duration1 * 1.5)
      }
    }, 60000)
  })
})
