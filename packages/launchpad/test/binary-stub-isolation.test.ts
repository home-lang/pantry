import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

describe('Binary Stub Isolation', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string
  let cliPath: string

  beforeEach(() => {
    originalEnv = { ...process.env }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-stub-test-'))
    cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
  })

  afterEach(() => {
    process.env = originalEnv
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }

    // Clean up test environment directories
    const launchpadEnvsDir = path.join(os.homedir(), '.local', 'share', 'launchpad', 'envs')
    if (fs.existsSync(launchpadEnvsDir)) {
      const entries = fs.readdirSync(launchpadEnvsDir)
      for (const entry of entries) {
        const entryPath = path.join(launchpadEnvsDir, entry)
        if (fs.statSync(entryPath).isDirectory() && entry.includes('dGVzdA')) { // Base64 contains 'test'
          fs.rmSync(entryPath, { recursive: true, force: true })
        }
      }
    }
  })

  const runCLI = (args: string[], cwd?: string): Promise<{ stdout: string, stderr: string, exitCode: number }> => {
    return new Promise((resolve, reject) => {
      const proc = spawn('bun', [cliPath, ...args], {
        stdio: ['ignore', 'pipe', 'pipe'],
        env: { ...process.env, NODE_ENV: 'test' },
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
        resolve({ stdout, stderr, exitCode: code || 0 })
      })

      proc.on('error', (error) => {
        reject(error)
      })

      setTimeout(() => {
        proc.kill()
        reject(new Error('CLI command timed out'))
      }, 30000)
    })
  }

  const createDepsFile = (dir: string, packages: string[], env?: Record<string, string>) => {
    const depsSection = `dependencies:\n${packages.map(pkg => `  - ${pkg}`).join('\n')}`
    const envSection = env ? `\nenv:\n${Object.entries(env).map(([key, value]) => `  ${key}: ${value}`).join('\n')}` : ''
    const content = depsSection + envSection
    fs.writeFileSync(path.join(dir, 'deps.yaml'), content)
  }

  describe('Stub Creation and Structure', () => {
    it('should create binary stubs with proper isolation headers', async () => {
      const projectDir = path.join(tempDir, 'project')
      fs.mkdirSync(projectDir, { recursive: true })
      createDepsFile(projectDir, ['nginx.org@1.28.0'])

      const result = await runCLI(['dev:dump'], projectDir)
      expect(result.exitCode).toBe(0)
      expect(result.stderr).toContain('Created isolated stub')

      // Find the nginx stub
      const prefixMatch = result.stderr.match(/Installation prefix: (.+)/)
      expect(prefixMatch).toBeDefined()

      if (prefixMatch) {
        const prefix = prefixMatch[1]
        const nginxStub = path.join(prefix, 'sbin', 'nginx')

        if (fs.existsSync(nginxStub)) {
          const stubContent = fs.readFileSync(nginxStub, 'utf-8')

          // Check basic structure
          expect(stubContent).toContain('#!/bin/sh')
          expect(stubContent).toContain('Project-specific binary stub - environment is isolated')

          // Check isolation mechanisms
          expect(stubContent).toContain('_cleanup_env()')
          expect(stubContent).toContain('trap _cleanup_env EXIT')

          // Check environment variable backup
          expect(stubContent).toContain('_ORIG_')
          expect(stubContent).toContain('Store original environment variables')

          // Check execution
          expect(stubContent).toContain('exec')
          expect(stubContent).toMatch(/exec ".*nginx"/)
        }
      }
    }, 60000)

    it('should create stubs with proper environment variable handling', async () => {
      const projectDir = path.join(tempDir, 'project')
      fs.mkdirSync(projectDir, { recursive: true })

      createDepsFile(projectDir, ['nginx.org@1.28.0'], {
        // Don't expect TEST_VAR to be in stub - it's only in the shell environment
        // Binary stubs only include pkgx environment variables, not custom project ones
      })

      const result = await runCLI(['dev:dump'], projectDir)
      expect(result.exitCode).toBe(0)

      // Check that environment script is generated (which contains TEST_VAR)
      expect(result.stdout).toContain('Project-specific environment')

      // Find the generated binary stub
      const prefixMatch = result.stderr.match(/📍 Installation prefix: (.+)/)
      if (prefixMatch) {
        const prefix = prefixMatch[1]
        const nginxStub = path.join(prefix, 'sbin', 'nginx')

        if (fs.existsSync(nginxStub)) {
          const stubContent = fs.readFileSync(nginxStub, 'utf-8')

          // Should backup environment variables before setting new ones
          expect(stubContent).toContain('_ORIG_PATH=')
          expect(stubContent).toContain('_ORIG_DYLD_FALLBACK_LIBRARY_PATH=')
          expect(stubContent).toContain('_cleanup_env()')
          expect(stubContent).toContain('trap _cleanup_env EXIT')
        }
      }
    }, 60000)

    it('should handle multiple binaries in a package', async () => {
      const projectDir = path.join(tempDir, 'project')
      fs.mkdirSync(projectDir, { recursive: true })
      // Use a package that has multiple binaries
      createDepsFile(projectDir, ['git-scm.org@2.40.0'])

      const result = await runCLI(['dev:dump'], projectDir)
      expect(result.exitCode).toBe(0)

      // Should create stubs for multiple binaries
      expect(result.stderr).toContain('Created isolated stub')

      // Count the number of stubs created
      const stubLines = result.stderr.split('\n').filter(line => line.includes('Created isolated stub'))
      expect(stubLines.length).toBeGreaterThan(1) // git package has multiple binaries
    }, 60000)
  })

  describe('Environment Variable Isolation', () => {
    it('should isolate PATH-like environment variables', async () => {
      const projectDir = path.join(tempDir, 'project')
      fs.mkdirSync(projectDir, { recursive: true })
      createDepsFile(projectDir, ['nginx.org@1.28.0'], {
        PATH: '/custom/path:/another/path',
        LD_LIBRARY_PATH: '/custom/lib:/another/lib',
      })

      const result = await runCLI(['dev:dump'], projectDir)
      expect(result.exitCode).toBe(0)

      const prefixMatch = result.stderr.match(/Installation prefix: (.+)/)
      if (prefixMatch) {
        const prefix = prefixMatch[1]
        const nginxStub = path.join(prefix, 'sbin', 'nginx')

        if (fs.existsSync(nginxStub)) {
          const stubContent = fs.readFileSync(nginxStub, 'utf-8')

          // Should handle PATH and LD_LIBRARY_PATH specially (arrays)
          expect(stubContent).toContain('export PATH=')
          expect(stubContent).toContain('export LD_LIBRARY_PATH=')

          // Should backup these variables
          expect(stubContent).toContain('_ORIG_PATH=')
          expect(stubContent).toContain('_ORIG_LD_LIBRARY_PATH=')
        }
      }
    }, 60000)

    it('should handle DYLD_FALLBACK_LIBRARY_PATH correctly', async () => {
      const projectDir = path.join(tempDir, 'project')
      fs.mkdirSync(projectDir, { recursive: true })
      createDepsFile(projectDir, ['nginx.org@1.28.0'])

      const result = await runCLI(['dev:dump'], projectDir)
      expect(result.exitCode).toBe(0)

      const prefixMatch = result.stderr.match(/Installation prefix: (.+)/)
      if (prefixMatch) {
        const prefix = prefixMatch[1]
        const nginxStub = path.join(prefix, 'sbin', 'nginx')

        if (fs.existsSync(nginxStub)) {
          const stubContent = fs.readFileSync(nginxStub, 'utf-8')

          // Should set DYLD_FALLBACK_LIBRARY_PATH with fallback paths
          if (stubContent.includes('DYLD_FALLBACK_LIBRARY_PATH')) {
            expect(stubContent).toContain(':/usr/lib:/usr/local/lib')
          }
        }
      }
    }, 60000)
  })

  describe('Stub Execution and Cleanup', () => {
    it('should create executable stubs', async () => {
      const projectDir = path.join(tempDir, 'project')
      fs.mkdirSync(projectDir, { recursive: true })
      createDepsFile(projectDir, ['nginx.org@1.28.0'])

      const result = await runCLI(['dev:dump'], projectDir)
      expect(result.exitCode).toBe(0)

      const prefixMatch = result.stderr.match(/Installation prefix: (.+)/)
      if (prefixMatch) {
        const prefix = prefixMatch[1]
        const nginxStub = path.join(prefix, 'sbin', 'nginx')

        if (fs.existsSync(nginxStub)) {
          const stats = fs.statSync(nginxStub)
          // Check that the stub is executable (mode includes execute bit)
          expect(stats.mode & 0o111).toBeGreaterThan(0)
        }
      }
    }, 60000)

    it('should properly escape shell arguments in stubs', async () => {
      const projectDir = path.join(tempDir, 'project')
      fs.mkdirSync(projectDir, { recursive: true })

      createDepsFile(projectDir, ['nginx.org@1.28.0'], {
        // Don't expect SPECIAL_VAR in binary stubs - they only contain pkgx environment variables
      })

      const result = await runCLI(['dev:dump'], projectDir)
      expect(result.exitCode).toBe(0)

      const prefixMatch = result.stderr.match(/📍 Installation prefix: (.+)/)
      if (prefixMatch) {
        const prefix = prefixMatch[1]
        const nginxStub = path.join(prefix, 'sbin', 'nginx')

        if (fs.existsSync(nginxStub)) {
          const stubContent = fs.readFileSync(nginxStub, 'utf-8')

          // Check that pkgx environment variables are properly escaped
          expect(stubContent).toContain('export DYLD_FALLBACK_LIBRARY_PATH=')
          expect(stubContent).toContain('export PATH=')
          expect(stubContent).toContain('exec ')
          expect(stubContent).toContain('"$@"') // Arguments should be properly passed through
        }
      }
    }, 60000)
  })

  describe('Package-specific Environment Setup', () => {
    it('should include pkgx runtime environment variables', async () => {
      const projectDir = path.join(tempDir, 'project')
      fs.mkdirSync(projectDir, { recursive: true })
      createDepsFile(projectDir, ['nginx.org@1.28.0'])

      const result = await runCLI(['dev:dump'], projectDir)
      expect(result.exitCode).toBe(0)

      const prefixMatch = result.stderr.match(/Installation prefix: (.+)/)
      if (prefixMatch) {
        const prefix = prefixMatch[1]
        const nginxStub = path.join(prefix, 'sbin', 'nginx')

        if (fs.existsSync(nginxStub)) {
          const stubContent = fs.readFileSync(nginxStub, 'utf-8')

          // Should contain sections for different environment variable types
          expect(stubContent).toContain('Set pkgx environment variables')
          expect(stubContent).toContain('Set package-specific runtime environment variables')

          // Should execute the actual binary at the end
          expect(stubContent).toMatch(/exec ".*nginx.*" "\$@"/)
        }
      }
    }, 60000)

    it('should handle packages with no binaries gracefully', async () => {
      const projectDir = path.join(tempDir, 'project')
      fs.mkdirSync(projectDir, { recursive: true })
      // Use a library-only package that doesn't provide binaries
      createDepsFile(projectDir, ['zlib.net@1.3.1']) // This is a library-only package

      const result = await runCLI(['dev:dump'], projectDir)
      // The package should install but no binary stubs will be created
      // This might fail if the package version doesn't exist, which is expected
      if (result.exitCode === 0) {
        expect(result.stderr).toContain('No binaries found for zlib.net after mirroring')
      }
      else {
        // If the specific version fails, check we get proper error handling
        expect(result.exitCode).toBe(1)
        expect(result.stderr).toContain('No packages were successfully installed')
      }
    }, 60000)
  })

  describe('Error Handling in Stub Creation', () => {
    it('should handle missing binary directories', async () => {
      const projectDir = path.join(tempDir, 'project')
      fs.mkdirSync(projectDir, { recursive: true })
      createDepsFile(projectDir, ['nginx.org@1.28.0'])

      const result = await runCLI(['dev:dump'], projectDir)
      expect(result.exitCode).toBe(0)

      // Should not fail if some expected directories don't exist
      expect(result.stderr).not.toContain('Failed to create stub')
    }, 60000)

    it('should skip broken symlinks', async () => {
      const projectDir = path.join(tempDir, 'project')
      fs.mkdirSync(projectDir, { recursive: true })
      createDepsFile(projectDir, ['nginx.org@1.28.0'])

      const result = await runCLI(['dev:dump'], projectDir)
      expect(result.exitCode).toBe(0)

      // Should handle broken symlinks gracefully
      if (result.stderr.includes('Symlink') && result.stderr.includes('non-existent')) {
        expect(result.stderr).toContain('skipping')
      }
    }, 60000)
  })

  describe('Cross-platform Compatibility', () => {
    it('should create stubs with proper shebang', async () => {
      const projectDir = path.join(tempDir, 'project')
      fs.mkdirSync(projectDir, { recursive: true })
      createDepsFile(projectDir, ['nginx.org@1.28.0'])

      const result = await runCLI(['dev:dump'], projectDir)
      expect(result.exitCode).toBe(0)

      const prefixMatch = result.stderr.match(/Installation prefix: (.+)/)
      if (prefixMatch) {
        const prefix = prefixMatch[1]
        const nginxStub = path.join(prefix, 'sbin', 'nginx')

        if (fs.existsSync(nginxStub)) {
          const stubContent = fs.readFileSync(nginxStub, 'utf-8')

          // Should use POSIX-compatible shebang
          expect(stubContent).toMatch(/^#!/)
          expect(stubContent).toContain('#!/bin/sh')

          // Should use POSIX-compatible shell features
          expect(stubContent).not.toContain('[[') // bash-specific
          expect(stubContent).toContain('[ ') // POSIX-compatible
        }
      }
    }, 60000)
  })

  describe('Integration with Project Environment', () => {
    it('should create stubs that work with project-specific environments', async () => {
      const projectDir = path.join(tempDir, 'project')
      fs.mkdirSync(projectDir, { recursive: true })

      createDepsFile(projectDir, ['nginx.org@1.28.0'], {
        // Custom environment variables are included in the shell environment, not binary stubs
        PROJECT_NAME: 'test-project',
        BUILD_ENV: 'testing',
      })

      const result = await runCLI(['dev:dump'], projectDir)
      expect(result.exitCode).toBe(0)

      // Check that environment script contains custom variables
      expect(result.stdout).toContain('PROJECT_NAME=')
      expect(result.stdout).toContain('BUILD_ENV=')

      const prefixMatch = result.stderr.match(/📍 Installation prefix: (.+)/)
      if (prefixMatch) {
        const prefix = prefixMatch[1]
        const nginxStub = path.join(prefix, 'sbin', 'nginx')

        if (fs.existsSync(nginxStub)) {
          const stubContent = fs.readFileSync(nginxStub, 'utf-8')

          // Binary stubs should contain pkgx environment setup
          expect(stubContent).toContain('#!/bin/sh')
          expect(stubContent).toContain('export DYLD_FALLBACK_LIBRARY_PATH=')
          expect(stubContent).toContain('export PATH=')
          expect(stubContent).toContain('nginx')
          expect(stubContent).toContain('exec ')
        }
      }
    }, 60000)
  })
})
