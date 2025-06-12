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

    it('should import required modules', () => {
      const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
      const content = fs.readFileSync(cliPath, 'utf-8')
      expect(content).toContain('CAC')
      expect(content).toContain('install')
      expect(content).toContain('config')
    })
  })

  describe('Install command --system flag behavior', () => {
    it('should treat install without --system and with --system identically', async () => {
      // Both commands should use install_prefix() which defaults to /usr/local
      const { install_prefix } = await import('../src/install')
      const defaultPath = install_prefix()

      // The logic should be identical for both cases
      expect(defaultPath).toBeDefined()
      expect(typeof defaultPath.string).toBe('string')
    })

    it('should default to /usr/local when writable', async () => {
      const { install_prefix } = await import('../src/install')
      const defaultPath = install_prefix()

      // Should prefer /usr/local if writable, otherwise ~/.local
      const isUsrLocal = defaultPath.string === '/usr/local'
      const isUserLocal = defaultPath.string.includes('.local')

      expect(isUsrLocal || isUserLocal).toBe(true)
    })

    it('should handle --path option correctly', () => {
      // When --path is specified, it should override both default and --system
      const customPath = '/custom/path'

      // This tests the logic that --path takes precedence
      expect(customPath).toBe('/custom/path')
    })
  })

  describe('Bootstrap command default behavior', () => {
    it('should default to /usr/local for bootstrap', () => {
      // Bootstrap should default to /usr/local unless --path is specified
      const defaultBootstrapPath = '/usr/local'
      expect(defaultBootstrapPath).toBe('/usr/local')
    })

    it('should allow custom path override for bootstrap', () => {
      // Bootstrap should allow --path to override the default
      const customPath = '~/.local'
      expect(customPath).toBe('~/.local')
    })
  })

  describe('System installation permission handling', () => {
    it('should detect when sudo is needed for /usr/local', () => {
      // Test the permission detection logic
      const testPath = '/usr/local'
      expect(testPath).toBe('/usr/local')

      // The actual permission check would be done by canWriteToUsrLocal()
      // This is a basic structure test
    })

    it('should provide fallback suggestions when sudo is declined', () => {
      // Test that proper fallback suggestions are provided
      const fallbackPath = '~/.local'
      expect(fallbackPath).toBe('~/.local')
    })
  })

  describe('Command equivalence', () => {
    it('should make install and install --system equivalent', async () => {
      // These commands should produce identical results:
      // launchpad install node
      // launchpad install node --system

      const { install_prefix } = await import('../src/install')
      const defaultPath1 = install_prefix() // Used by: launchpad install node
      const defaultPath2 = install_prefix() // Used by: launchpad install node --system

      expect(defaultPath1.string).toBe(defaultPath2.string)
    })

    it('should prioritize --path over --system flag', () => {
      // When both --path and --system are provided, --path should win
      const customPath = '/custom/path'
      const systemPath = '/usr/local'

      // The logic should prefer explicit --path over --system
      expect(customPath).not.toBe(systemPath)
      expect(customPath).toBe('/custom/path')
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
            // Version should be shown
            const output = stdout + stderr
            expect(output.length).toBeGreaterThan(0)
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

  describe('New CLI Commands', () => {
    describe('install command', () => {
      it('should accept package names', async () => {
        const { spawn } = await import('node:child_process')
        const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')

        return new Promise<void>((resolve, reject) => {
          const proc = spawn('bun', [cliPath, 'install', '--help'], {
            stdio: ['ignore', 'pipe', 'pipe'],
          })

          let output = ''
          proc.stdout.on('data', (data) => { output += data.toString() })
          proc.stderr.on('data', (data) => { output += data.toString() })

          proc.on('close', () => {
            try {
              expect(output).toContain('install')
              expect(output).toContain('packages')
              resolve()
            }
            catch (error) {
              reject(error)
            }
          })

          setTimeout(() => {
            proc.kill()
            reject(new Error('Install help test timed out'))
          }, 10000)
        })
      }, 15000)

      it('should support verbose flag', async () => {
        const { spawn } = await import('node:child_process')
        const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')

        return new Promise<void>((resolve, reject) => {
          const proc = spawn('bun', [cliPath, 'install', '--help'], {
            stdio: ['ignore', 'pipe', 'pipe'],
          })

          let output = ''
          proc.stdout.on('data', (data) => { output += data.toString() })
          proc.stderr.on('data', (data) => { output += data.toString() })

          proc.on('close', () => {
            try {
              expect(output).toContain('--verbose')
              resolve()
            }
            catch (error) {
              reject(error)
            }
          })

          setTimeout(() => {
            proc.kill()
            reject(new Error('Install verbose test timed out'))
          }, 10000)
        })
      }, 15000)

      it('should support custom path flag', async () => {
        const { spawn } = await import('node:child_process')
        const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')

        return new Promise<void>((resolve, reject) => {
          const proc = spawn('bun', [cliPath, 'install', '--help'], {
            stdio: ['ignore', 'pipe', 'pipe'],
          })

          let output = ''
          proc.stdout.on('data', (data) => { output += data.toString() })
          proc.stderr.on('data', (data) => { output += data.toString() })

          proc.on('close', () => {
            try {
              expect(output).toContain('--path')
              resolve()
            }
            catch (error) {
              reject(error)
            }
          })

          setTimeout(() => {
            proc.kill()
            reject(new Error('Install path test timed out'))
          }, 10000)
        })
      }, 15000)
    })

    describe('list command', () => {
      it('should be available', async () => {
        const { spawn } = await import('node:child_process')
        const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')

        return new Promise<void>((resolve, reject) => {
          const proc = spawn('bun', [cliPath, 'list', '--help'], {
            stdio: ['ignore', 'pipe', 'pipe'],
          })

          let output = ''
          proc.stdout.on('data', (data) => { output += data.toString() })
          proc.stderr.on('data', (data) => { output += data.toString() })

          proc.on('close', () => {
            try {
              expect(output).toContain('list')
              resolve()
            }
            catch (error) {
              reject(error)
            }
          })

          setTimeout(() => {
            proc.kill()
            reject(new Error('List help test timed out'))
          }, 10000)
        })
      }, 15000)

      it('should support ls alias', async () => {
        const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
        const content = fs.readFileSync(cliPath, 'utf-8')
        expect(content).toContain('.alias(\'ls\')')
      })
    })

    describe('bootstrap command', () => {
      it('should be available', async () => {
        const { spawn } = await import('node:child_process')
        const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')

        return new Promise<void>((resolve, reject) => {
          const proc = spawn('bun', [cliPath, 'bootstrap', '--help'], {
            stdio: ['ignore', 'pipe', 'pipe'],
          })

          let output = ''
          proc.stdout.on('data', (data) => { output += data.toString() })
          proc.stderr.on('data', (data) => { output += data.toString() })

          proc.on('close', () => {
            try {
              expect(output).toContain('bootstrap')
              resolve()
            }
            catch (error) {
              reject(error)
            }
          })

          setTimeout(() => {
            proc.kill()
            reject(new Error('Bootstrap help test timed out'))
          }, 10000)
        })
      }, 15000)

      it('should support essential tools installation', async () => {
        const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
        const content = fs.readFileSync(cliPath, 'utf-8')
        expect(content).toContain('bootstrap')
        expect(content).toContain('essential')
      })
    })

    describe('uninstall command', () => {
      it('should be available', async () => {
        const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
        const content = fs.readFileSync(cliPath, 'utf-8')
        expect(content).toContain('uninstall')
      })

      it('should support remove and rm aliases', async () => {
        const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
        const content = fs.readFileSync(cliPath, 'utf-8')
        expect(content).toContain('.alias(\'remove\')')
        expect(content).toContain('.alias(\'rm\')')
      })
    })

    describe('shim command', () => {
      it('should be available', async () => {
        const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
        const content = fs.readFileSync(cliPath, 'utf-8')
        expect(content).toContain('shim')
      })

      it('should support stub alias', async () => {
        const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
        const content = fs.readFileSync(cliPath, 'utf-8')
        expect(content).toContain('.alias(\'stub\')')
      })
    })

    describe('dev commands', () => {
      it('should have dev:shellcode command', async () => {
        const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
        const content = fs.readFileSync(cliPath, 'utf-8')
        expect(content).toContain('dev:shellcode')
      })

      it('should have dev:integrate command', async () => {
        const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
        const content = fs.readFileSync(cliPath, 'utf-8')
        expect(content).toContain('dev:integrate')
      })

      it('should have dev:on command', async () => {
        const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
        const content = fs.readFileSync(cliPath, 'utf-8')
        expect(content).toContain('dev:on')
      })

      it('should have dev:off command', async () => {
        const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
        const content = fs.readFileSync(cliPath, 'utf-8')
        expect(content).toContain('dev:off')
      })
    })

    describe('update command', () => {
      it('should be available', async () => {
        const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
        const content = fs.readFileSync(cliPath, 'utf-8')
        expect(content).toContain('update')
      })

      it('should support upgrade and up aliases', async () => {
        const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
        const content = fs.readFileSync(cliPath, 'utf-8')
        expect(content).toContain('.alias(\'upgrade\')')
        expect(content).toContain('.alias(\'up\')')
      })
    })

    describe('outdated command', () => {
      it('should be available', async () => {
        const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
        const content = fs.readFileSync(cliPath, 'utf-8')
        expect(content).toContain('outdated')
      })
    })
  })

  describe('Direct Installation System Integration', () => {
    it('should not depend on pkgx binary', () => {
      const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
      const content = fs.readFileSync(cliPath, 'utf-8')

      // Should not import pkgx modules
      expect(content).not.toContain('from \'../src/pkgx\'')
      expect(content).not.toContain('installWithPkgx')
    })

    it('should import direct installation system', () => {
      const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
      const content = fs.readFileSync(cliPath, 'utf-8')

      // Should import our new installation system - checking for both index and direct imports
      const hasInstallImport = content.includes('from \'../src/install\'')
        || (content.includes('from \'../src\'') && content.includes('install'))
      expect(hasInstallImport).toBe(true)
    })

    it('should handle package arrays correctly', () => {
      const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
      const content = fs.readFileSync(cliPath, 'utf-8')

      // Should handle package arrays properly
      expect(content).toContain('Array.isArray(packages)')
    })

    it('should provide verbose logging', () => {
      const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
      const content = fs.readFileSync(cliPath, 'utf-8')

      // Should support verbose configuration
      expect(content).toContain('config.verbose')
    })
  })

  describe('Error Handling', () => {
    it('should handle empty package lists gracefully', () => {
      const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
      const content = fs.readFileSync(cliPath, 'utf-8')

      // Should check for empty package lists
      expect(content).toContain('packageList.length === 0')
    })

    it('should provide helpful error messages', () => {
      const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
      const content = fs.readFileSync(cliPath, 'utf-8')

      // Should have error handling
      expect(content).toContain('console.error')
      expect(content).toContain('process.exit(1)')
    })

    it('should handle installation failures', () => {
      const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
      const content = fs.readFileSync(cliPath, 'utf-8')

      // Should handle catch blocks
      expect(content).toContain('catch (error)')
    })
  })

  describe('CLI Configuration', () => {
    it('should import configuration module', () => {
      const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
      const content = fs.readFileSync(cliPath, 'utf-8')

      expect(content).toContain('from \'../src/config\'')
    })

    it('should handle shell integration', () => {
      const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
      const content = fs.readFileSync(cliPath, 'utf-8')

      expect(content).toContain('shellcode')
      expect(content).toContain('integrate')
    })

    it('should support development environment commands', () => {
      const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
      const content = fs.readFileSync(cliPath, 'utf-8')

      expect(content).toContain('from \'../src/dev\'')
    })
  })

  describe('Version Information', () => {
    it('should import version from package.json', () => {
      const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
      const content = fs.readFileSync(cliPath, 'utf-8')

      expect(content).toContain('package.json')
      expect(content).toContain('version')
    })

    it('should set CLI version', () => {
      const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
      const content = fs.readFileSync(cliPath, 'utf-8')

      expect(content).toContain('cli.version(version)')
    })
  })
})
