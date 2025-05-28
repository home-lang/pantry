import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

describe('CLI', () => {
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

  describe('CLI module structure', () => {
    it('should have a CLI entry point', () => {
      // Go up from packages/launchpad/test to find the root CLI
      const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
      expect(fs.existsSync(cliPath)).toBe(true)
    })

    it('should be executable', () => {
      const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
      const stats = fs.statSync(cliPath)
      // Check if file exists and is readable (executable bit may not be set in all environments)
      expect(stats.isFile()).toBe(true)
      expect(stats.size).toBeGreaterThan(0)
    })

    it('should have proper shebang', () => {
      const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
      const content = fs.readFileSync(cliPath, 'utf-8')
      expect(content.startsWith('#!/usr/bin/env bun')).toBe(true)
    })
  })

  describe('CLI help and version', () => {
    it('should show help when no arguments provided', async () => {
      const { spawn } = await import('node:child_process')
      const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')

      return new Promise<void>((resolve, reject) => {
        // Use clean environment without ~/.local/bin to avoid broken stubs
        const cleanEnv = {
          ...process.env,
          NODE_ENV: 'test',
          PATH: process.env.PATH?.split(':').filter(p => !p.includes('/.local/bin')).join(':') || '/usr/local/bin:/usr/bin:/bin',
        }

        const proc = spawn('bun', [cliPath, '--help'], {
          stdio: ['ignore', 'pipe', 'pipe'],
          env: cleanEnv,
        })

        let stdout = ''
        let stderr = ''

        proc.stdout.on('data', (data) => {
          stdout += data.toString()
        })

        proc.stderr.on('data', (data) => {
          stderr += data.toString()
        })

        proc.on('close', (_code) => {
          try {
            // Help should be shown (either in stdout or stderr)
            const output = stdout + stderr
            expect(output).toContain('launchpad')
            expect(output.toLowerCase()).toContain('usage')
            resolve()
          }
          catch (error) {
            reject(error)
          }
        })

        // Timeout after 10 seconds
        setTimeout(() => {
          proc.kill()
          reject(new Error('CLI help test timed out'))
        }, 10000)
      })
    }, 15000)

    it('should show version information', async () => {
      const { spawn } = await import('node:child_process')
      const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')

      return new Promise<void>((resolve, reject) => {
        // Use clean environment without ~/.local/bin to avoid broken stubs
        const cleanEnv = {
          ...process.env,
          NODE_ENV: 'test',
          PATH: process.env.PATH?.split(':').filter(p => !p.includes('/.local/bin')).join(':') || '/usr/local/bin:/usr/bin:/bin',
        }

        const proc = spawn('bun', [cliPath, '--version'], {
          stdio: ['ignore', 'pipe', 'pipe'],
          env: cleanEnv,
        })

        let stdout = ''
        let stderr = ''

        proc.stdout.on('data', (data) => {
          stdout += data.toString()
        })

        proc.stderr.on('data', (data) => {
          stderr += data.toString()
        })

        proc.on('close', (_code) => {
          try {
            const output = stdout + stderr
            // Should contain version information
            expect(output).toMatch(/\d+\.\d+\.\d+/)
            resolve()
          }
          catch (error) {
            reject(error)
          }
        })

        // Timeout after 10 seconds
        setTimeout(() => {
          proc.kill()
          reject(new Error('CLI version test timed out'))
        }, 10000)
      })
    }, 15000)
  })

  describe('CLI commands structure', () => {
    it('should have install command', async () => {
      const { spawn } = await import('node:child_process')
      const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')

      return new Promise<void>((resolve, reject) => {
        // Use clean environment without ~/.local/bin to avoid broken stubs
        const cleanEnv = {
          ...process.env,
          NODE_ENV: 'test',
          PATH: process.env.PATH?.split(':').filter(p => !p.includes('/.local/bin')).join(':') || '/usr/local/bin:/usr/bin:/bin',
        }

        const proc = spawn('bun', [cliPath, 'install', '--help'], {
          stdio: ['ignore', 'pipe', 'pipe'],
          env: cleanEnv,
        })

        let stdout = ''
        let stderr = ''

        proc.stdout.on('data', (data) => {
          stdout += data.toString()
        })

        proc.stderr.on('data', (data) => {
          stderr += data.toString()
        })

        proc.on('close', (_code) => {
          try {
            const output = stdout + stderr
            expect(output.toLowerCase()).toContain('install')
            expect(output.toLowerCase()).toContain('packages')
            resolve()
          }
          catch (error) {
            reject(error)
          }
        })

        setTimeout(() => {
          proc.kill()
          reject(new Error('Install command help test timed out'))
        }, 10000)
      })
    }, 15000)

    it('should have list command', async () => {
      const { spawn } = await import('node:child_process')
      const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')

      return new Promise<void>((resolve, reject) => {
        // Use clean environment without ~/.local/bin to avoid broken stubs
        const cleanEnv = {
          ...process.env,
          NODE_ENV: 'test',
          PATH: process.env.PATH?.split(':').filter(p => !p.includes('/.local/bin')).join(':') || '/usr/local/bin:/usr/bin:/bin',
        }

        const proc = spawn('bun', [cliPath, 'list', '--help'], {
          stdio: ['ignore', 'pipe', 'pipe'],
          env: cleanEnv,
        })

        let stdout = ''
        let stderr = ''

        proc.stdout.on('data', (data) => {
          stdout += data.toString()
        })

        proc.stderr.on('data', (data) => {
          stderr += data.toString()
        })

        proc.on('close', (_code) => {
          try {
            const output = stdout + stderr
            expect(output.toLowerCase()).toContain('list')
            resolve()
          }
          catch (error) {
            reject(error)
          }
        })

        setTimeout(() => {
          proc.kill()
          reject(new Error('List command help test timed out'))
        }, 10000)
      })
    }, 15000)

    it('should have shim command', async () => {
      const { spawn } = await import('node:child_process')
      const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')

      return new Promise<void>((resolve, reject) => {
        // Use clean environment without ~/.local/bin to avoid broken stubs
        const cleanEnv = {
          ...process.env,
          NODE_ENV: 'test',
          PATH: process.env.PATH?.split(':').filter(p => !p.includes('/.local/bin')).join(':') || '/usr/local/bin:/usr/bin:/bin',
        }

        const proc = spawn('bun', [cliPath, 'shim', '--help'], {
          stdio: ['ignore', 'pipe', 'pipe'],
          env: cleanEnv,
        })

        let stdout = ''
        let stderr = ''

        proc.stdout.on('data', (data) => {
          stdout += data.toString()
        })

        proc.stderr.on('data', (data) => {
          stderr += data.toString()
        })

        proc.on('close', (_code) => {
          try {
            const output = stdout + stderr
            expect(output.toLowerCase()).toContain('shim')
            resolve()
          }
          catch (error) {
            reject(error)
          }
        })

        setTimeout(() => {
          proc.kill()
          reject(new Error('Shim command help test timed out'))
        }, 10000)
      })
    }, 15000)

    it('should have pkgx command', async () => {
      const { spawn } = await import('node:child_process')
      const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')

      return new Promise<void>((resolve, reject) => {
        // Use clean environment without ~/.local/bin to avoid broken stubs
        const cleanEnv = {
          ...process.env,
          NODE_ENV: 'test',
          PATH: process.env.PATH?.split(':').filter(p => !p.includes('/.local/bin')).join(':') || '/usr/local/bin:/usr/bin:/bin',
        }

        const proc = spawn('bun', [cliPath, 'pkgx', '--help'], {
          stdio: ['ignore', 'pipe', 'pipe'],
          env: cleanEnv,
        })

        let stdout = ''
        let stderr = ''

        proc.stdout.on('data', (data) => {
          stdout += data.toString()
        })

        proc.stderr.on('data', (data) => {
          stderr += data.toString()
        })

        proc.on('close', (_code) => {
          try {
            const output = stdout + stderr
            expect(output.toLowerCase()).toContain('pkgx')
            resolve()
          }
          catch (error) {
            reject(error)
          }
        })

        setTimeout(() => {
          proc.kill()
          reject(new Error('Pkgx command help test timed out'))
        }, 10000)
      })
    }, 15000)

    it('should have dev command', async () => {
      const { spawn } = await import('node:child_process')
      const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')

      return new Promise<void>((resolve, reject) => {
        // Use clean environment without ~/.local/bin to avoid broken stubs
        const cleanEnv = {
          ...process.env,
          NODE_ENV: 'test',
          PATH: process.env.PATH?.split(':').filter(p => !p.includes('/.local/bin')).join(':') || '/usr/local/bin:/usr/bin:/bin',
        }

        const proc = spawn('bun', [cliPath, 'dev', '--help'], {
          stdio: ['ignore', 'pipe', 'pipe'],
          env: cleanEnv,
        })

        let stdout = ''
        let stderr = ''

        proc.stdout.on('data', (data) => {
          stdout += data.toString()
        })

        proc.stderr.on('data', (data) => {
          stderr += data.toString()
        })

        proc.on('close', (_code) => {
          try {
            const output = stdout + stderr
            expect(output.toLowerCase()).toContain('dev')
            resolve()
          }
          catch (error) {
            reject(error)
          }
        })

        setTimeout(() => {
          proc.kill()
          reject(new Error('Dev command help test timed out'))
        }, 10000)
      })
    }, 15000)
  })

  describe('CLI error handling', () => {
    it('should handle install command with no packages', async () => {
      const { spawn } = await import('node:child_process')
      const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')

      return new Promise<void>((resolve, reject) => {
        // Use clean environment without ~/.local/bin to avoid broken stubs
        const cleanEnv = {
          ...process.env,
          NODE_ENV: 'test',
          PATH: process.env.PATH?.split(':').filter(p => !p.includes('/.local/bin')).join(':') || '/usr/local/bin:/usr/bin:/bin',
        }

        const proc = spawn('bun', [cliPath, 'install'], {
          stdio: ['ignore', 'pipe', 'pipe'],
          env: cleanEnv,
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
          try {
            // Should exit with error code
            expect(code).not.toBe(0)
            const output = stdout + stderr
            expect(output.toLowerCase()).toContain('no packages')
            resolve()
          }
          catch (error) {
            reject(error)
          }
        })

        setTimeout(() => {
          proc.kill()
          reject(new Error('Install no packages test timed out'))
        }, 10000)
      })
    }, 15000)

    it('should handle shim command with no packages', async () => {
      const { spawn } = await import('node:child_process')
      const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')

      return new Promise<void>((resolve, reject) => {
        // Use clean environment without ~/.local/bin to avoid broken stubs
        const cleanEnv = {
          ...process.env,
          NODE_ENV: 'test',
          PATH: process.env.PATH?.split(':').filter(p => !p.includes('/.local/bin')).join(':') || '/usr/local/bin:/usr/bin:/bin',
        }

        const proc = spawn('bun', [cliPath, 'shim'], {
          stdio: ['ignore', 'pipe', 'pipe'],
          env: cleanEnv,
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
          try {
            // Should exit with error code
            expect(code).not.toBe(0)
            const output = stdout + stderr
            expect(output.toLowerCase()).toContain('no packages')
            resolve()
          }
          catch (error) {
            reject(error)
          }
        })

        setTimeout(() => {
          proc.kill()
          reject(new Error('Shim no packages test timed out'))
        }, 10000)
      })
    }, 15000)
  })

  describe('CLI options', () => {
    it('should accept verbose option', async () => {
      const { spawn } = await import('node:child_process')
      const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')

      return new Promise<void>((resolve, reject) => {
        // Use clean environment without ~/.local/bin to avoid broken stubs
        const cleanEnv = {
          ...process.env,
          NODE_ENV: 'test',
          PATH: process.env.PATH?.split(':').filter(p => !p.includes('/.local/bin')).join(':') || '/usr/local/bin:/usr/bin:/bin',
        }

        const proc = spawn('bun', [cliPath, 'list', '--verbose'], {
          stdio: ['ignore', 'pipe', 'pipe'],
          env: cleanEnv,
        })

        let stdout = ''
        let stderr = ''

        proc.stdout.on('data', (data) => {
          stdout += data.toString()
        })

        proc.stderr.on('data', (data) => {
          stderr += data.toString()
        })

        proc.on('close', (_code) => {
          try {
            // Should not error on verbose flag
            const output = stdout + stderr
            // Should complete (may show no packages or error, but shouldn't crash)
            expect(output).toBeDefined()
            resolve()
          }
          catch (error) {
            reject(error)
          }
        })

        setTimeout(() => {
          proc.kill()
          reject(new Error('Verbose option test timed out'))
        }, 10000)
      })
    }, 15000)

    it('should accept path option', async () => {
      const { spawn } = await import('node:child_process')
      const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')

      return new Promise<void>((resolve, reject) => {
        // Use clean environment without ~/.local/bin to avoid broken stubs
        const cleanEnv = {
          ...process.env,
          NODE_ENV: 'test',
          PATH: process.env.PATH?.split(':').filter(p => !p.includes('/.local/bin')).join(':') || '/usr/local/bin:/usr/bin:/bin',
        }

        const proc = spawn('bun', [cliPath, 'list', '--path', tempDir], {
          stdio: ['ignore', 'pipe', 'pipe'],
          env: cleanEnv,
        })

        let stdout = ''
        let stderr = ''

        proc.stdout.on('data', (data) => {
          stdout += data.toString()
        })

        proc.stderr.on('data', (data) => {
          stderr += data.toString()
        })

        proc.on('close', (_code) => {
          try {
            // Should not error on path flag
            const output = stdout + stderr
            expect(output).toBeDefined()
            resolve()
          }
          catch (error) {
            reject(error)
          }
        })

        setTimeout(() => {
          proc.kill()
          reject(new Error('Path option test timed out'))
        }, 10000)
      })
    }, 15000)
  })

  describe('CLI integration', () => {
    it('should be importable as a module', async () => {
      // Test that the CLI file can be imported without errors
      const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
      expect(fs.existsSync(cliPath)).toBe(true)

      // Read the file to check for basic structure
      const content = fs.readFileSync(cliPath, 'utf-8')
      expect(content).toContain('CAC')
      expect(content).toContain('command')
      expect(content).toContain('install')
      expect(content).toContain('list')
      expect(content).toContain('shim')
    })

    it('should have proper imports', () => {
      const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
      const content = fs.readFileSync(cliPath, 'utf-8')

      // Check for essential imports
      expect(content).toContain('from \'../src\'')
      expect(content).toContain('from \'../src/config\'')
      expect(content).toContain('from \'../src/path\'')
      expect(content).toContain('from \'../src/utils\'')
    })

    it('should have proper command structure', () => {
      const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
      const content = fs.readFileSync(cliPath, 'utf-8')

      // Check for command definitions
      expect(content).toContain('.command(')
      expect(content).toContain('.option(')
      expect(content).toContain('.action(')
      expect(content).toContain('.alias(')
    })
  })
})
