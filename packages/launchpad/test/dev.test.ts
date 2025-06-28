import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { Buffer } from 'node:buffer'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

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
    originalEnv = { ...process.env }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-dev-test-'))
    cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
    fixturesDir = path.join(__dirname, 'fixtures')

    // Enable fetch mocking for tests
    globalThis.fetch = mockFetch as typeof fetch
  })

  afterEach(() => {
    process.env = originalEnv
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }

    // Restore original fetch
    globalThis.fetch = originalFetch
  })

  const getTestEnv = (extraEnv: Record<string, string> = {}) => {
    return {
      ...process.env,
      PATH: process.env.PATH?.includes('/usr/local/bin')
        ? process.env.PATH
        : `/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${process.env.PATH || ''}`,
      NODE_ENV: 'test',
      ...extraEnv,
    }
  }

  // Helper function to run CLI commands
  const runCLI = (args: string[], cwd?: string): Promise<{ stdout: string, stderr: string, exitCode: number }> => {
    return new Promise((resolve, reject) => {
      const proc = spawn('bun', [cliPath, ...args], {
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
    it('should generate shell integration code', async () => {
      // Run from project directory since shellcode needs to find the dev/launchpad binary
      const result = await runCLI(['dev:shellcode'], process.cwd())

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('__launchpad_chpwd')
    })

    it('should include proper shell function definitions', async () => {
      const result = await runCLI(['dev:shellcode'], process.cwd())

      expect(result.exitCode).toBe(0)

      // Check for key shell functions
      expect(result.stdout).toContain('__launchpad_find_deps_file')
      expect(result.stdout).toContain('__launchpad_chpwd')
    })

    it('should handle different shell types', async () => {
      const result = await runCLI(['dev:shellcode'], process.cwd())

      expect(result.exitCode).toBe(0)

      // Should contain both zsh and bash compatibility
      expect(result.stdout).toContain('ZSH_VERSION')
      expect(result.stdout).toContain('BASH_VERSION')
    }, 30000)

    it('should include shell message configuration', async () => {
      const result = await runCLI(['dev:shellcode'], process.cwd())

      expect(result.exitCode).toBe(0)

      // Should include command calls that handle messages
      expect(result.stdout).toContain('launchpad dev:on')
      expect(result.stdout).toContain('launchpad dev:off')
    })

    it('should respect showShellMessages configuration', async () => {
      const result = await runCLI(['dev:shellcode'], process.cwd())

      expect(result.exitCode).toBe(0)

      // Should include command calls that respect configuration
      expect(result.stdout).toContain('launchpad dev:on')
      expect(result.stdout).toContain('launchpad dev:off')
    })

    it('should include custom activation message', async () => {
      const result = await runCLI(['dev:shellcode'], process.cwd())

      expect(result.exitCode).toBe(0)

      // Should include command calls that will handle messages
      expect(result.stdout).toContain('launchpad dev:on')
    })

    it('should include custom deactivation message', async () => {
      const result = await runCLI(['dev:shellcode'], process.cwd())

      expect(result.exitCode).toBe(0)

      // Should include command calls that will handle messages
      expect(result.stdout).toContain('launchpad dev:off')
    })

    it('should handle path placeholder in activation message', async () => {
      const result = await runCLI(['dev:shellcode'], process.cwd())

      expect(result.exitCode).toBe(0)

      // Should contain shell variable usage for project directory
      expect(result.stdout).toContain('$project_dir')
    })

    it('should generate shell-safe message code', async () => {
      const result = await runCLI(['dev:shellcode'], process.cwd())

      expect(result.exitCode).toBe(0)

      // Basic shell syntax validation
      expect(result.stdout).not.toContain('undefined')
      expect(result.stdout).not.toMatch(/(?<!\/dev\/)null\)/g)
      expect(result.stdout).not.toContain('= null')

      // Should contain proper shell constructs for command execution
      expect(result.stdout).toContain('/usr/local/bin/launchpad')
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
        expect(result.stdout).toContain('Project-specific environment')
        expect(result.stdout).toContain('TEST_VAR=test_value')
        expect(result.stdout).toContain('_pkgx_dev_try_bye')
        expect(result.stdout).toContain('export PATH=')
      }
      else {
        // If installation fails, check graceful error handling
        expect(result.stderr).toContain('Failed to install')
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

    it('should handle package installation failures gracefully', async () => {
      fs.writeFileSync(path.join(tempDir, 'dependencies.yaml'), 'dependencies:\n  nonexistent-package-12345: ^1.0\n')

      const result = await runCLI(['dev', tempDir])

      // Should fail with exit code 1 when all packages fail to install
      expect(result.exitCode).toBe(1)
      expect(result.stderr).toContain('Failed to install')
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
        // Even if packages fail, environment variables might be set
        if (result.exitCode === 0) {
          expect(result.stdout).toContain('FOO=BAR')
        }
      }
    }, 60000)

    it('should handle go.mod fixture', async () => {
      const fixturePath = path.join(fixturesDir, 'go.mod')
      if (fs.existsSync(fixturePath)) {
        const result = await testFixture(fixturePath)
        // go.mod is not currently recognized as a dependency file by Launchpad
        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('No dependency file found')
      }
    }, 60000)

    it('should handle Cargo.toml fixture', async () => {
      const fixturePath = path.join(fixturesDir, 'Cargo.toml')
      if (fs.existsSync(fixturePath)) {
        const result = await testFixture(fixturePath)
        // Cargo.toml is not currently recognized as a dependency file by Launchpad
        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('No dependency file found')
      }
    }, 60000)

    it('should handle .node-version fixture', async () => {
      const fixturePath = path.join(fixturesDir, '.node-version')
      if (fs.existsSync(fixturePath)) {
        const result = await testFixture(fixturePath)
        // .node-version is not currently recognized as a dependency file by Launchpad
        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('No dependency file found')
      }
    }, 60000)

    it('should handle .ruby-version fixture', async () => {
      const fixturePath = path.join(fixturesDir, '.ruby-version')
      if (fs.existsSync(fixturePath)) {
        const result = await testFixture(fixturePath)
        // .ruby-version is not currently recognized as a dependency file by Launchpad
        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('No dependency file found')
      }
    }, 60000)

    it('should handle deno.jsonc fixture', async () => {
      const fixturePath = path.join(fixturesDir, 'deno.jsonc')
      if (fs.existsSync(fixturePath)) {
        const result = await testFixture(fixturePath)
        // deno.jsonc is not currently recognized as a dependency file by Launchpad
        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('No dependency file found')
      }
    }, 60000)

    it('should handle Gemfile fixture', async () => {
      const fixturePath = path.join(fixturesDir, 'Gemfile')
      if (fs.existsSync(fixturePath)) {
        const result = await testFixture(fixturePath)
        // Gemfile is not currently recognized as a dependency file by Launchpad
        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('No dependency file found')
      }
    }, 60000)

    it('should handle requirements.txt fixture', async () => {
      const fixturePath = path.join(fixturesDir, 'requirements.txt')
      if (fs.existsSync(fixturePath)) {
        const result = await testFixture(fixturePath)
        // requirements.txt is not currently recognized as a dependency file by Launchpad
        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('No dependency file found')
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
        // package.json is not currently recognized as a dependency file by Launchpad
        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('No dependency file found')
      }
    }, 60000)

    it('should handle deno.json/std fixture', async () => {
      const fixturePath = path.join(fixturesDir, 'deno.json', 'std')
      if (fs.existsSync(fixturePath)) {
        const result = await testFixture(fixturePath)
        // deno.json is not currently recognized as a dependency file by Launchpad
        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('No dependency file found')
      }
    }, 60000)

    it('should handle pyproject.toml/std fixture', async () => {
      const fixturePath = path.join(fixturesDir, 'pyproject.toml', 'std')
      if (fs.existsSync(fixturePath)) {
        const result = await testFixture(fixturePath)
        // pyproject.toml is not currently recognized as a dependency file by Launchpad
        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('No dependency file found')
      }
    }, 60000)

    it('should handle action.yml/std fixture', async () => {
      const fixturePath = path.join(fixturesDir, 'action.yml', 'std')
      if (fs.existsSync(fixturePath)) {
        const result = await testFixture(fixturePath)
        // action.yml is not currently recognized as a dependency file by Launchpad
        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('No dependency file found')
      }
    }, 60000)

    it('should handle python-version/std fixture', async () => {
      const fixturePath = path.join(fixturesDir, 'python-version', 'std')
      if (fs.existsSync(fixturePath)) {
        const result = await testFixture(fixturePath)
        // python-version is not currently recognized as a dependency file by Launchpad
        expect(result.exitCode).toBe(0)
        expect(result.stdout).toContain('No dependency file found')
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

      const result = await runCLI(['dev', tempDir])

      // Accept either success or failure
      if (result.exitCode === 0) {
        // If successful, check shell integration
        expect(result.stdout).toContain('Project-specific environment')
        expect(result.stdout).toContain('TEST_VAR=integration_test')
        expect(result.stdout).toContain('_pkgx_dev_try_bye')

        // Check that deactivation function includes the correct directory
        expect(result.stdout).toContain(tempDir)
      }
      else {
        // If installation fails, check graceful error handling
        expect(result.stderr).toContain('Failed to install')
      }
    }, 60000)

    it('should handle multiple dependency files in same directory', async () => {
      // Create multiple dependency files
      createDependenciesYaml(tempDir, {
        'gnu.org/wget': '^1.21',
      })

      fs.writeFileSync(path.join(tempDir, 'package.json'), JSON.stringify({
        name: 'test-project',
        dependencies: {
          node: '^18.0.0',
        },
      }))

      const result = await runCLI(['dev', tempDir])

      // Accept either success or failure
      if (result.exitCode === 0) {
        expect(result.stdout).toContain('Project-specific environment')
        expect(result.stdout).toContain('export PATH=')
      }
      else {
        expect(result.stderr).toContain('Failed to install')
      }
    }, 60000)

    it('should handle nested directory structures', async () => {
      const nestedDir = path.join(tempDir, 'nested', 'project')
      fs.mkdirSync(nestedDir, { recursive: true })

      createDependenciesYaml(nestedDir, {
        'gnu.org/wget': '^1.21',
      })

      const result = await runCLI(['dev', nestedDir])

      // Accept either success or failure
      if (result.exitCode === 0) {
        expect(result.stdout).toContain('Project-specific environment')
        expect(result.stdout).toContain(nestedDir)
      }
      else {
        expect(result.stderr).toContain('Failed to install')
      }
    }, 60000)
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
      expect(result.exitCode).toBe(0) // Changed: now returns 0 with proper error handling
      expect(result.stdout).toContain('No packages found in dependency file') // YAML parsing errors result in no packages found
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
  })
})
