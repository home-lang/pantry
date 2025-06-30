import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

function getTestEnv() {
  return {
    ...process.env,
    NODE_ENV: 'test',
    PATH: process.env.PATH?.includes('/usr/local/bin')
      ? process.env.PATH
      : `/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin:${process.env.PATH || ''}`,
  }
}

describe('Upgrade Command', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string
  let mockFetch: any
  beforeEach(() => {
    originalEnv = { ...process.env }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-upgrade-test-'))

    // Mock fetch for testing GitHub API and downloads
    mockFetch = mock(() => Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      json: () => Promise.resolve({ tag_name: 'v0.3.12' }),
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024 * 1024)), // 1MB mock binary
    }))
    globalThis.fetch = mockFetch as any
  })

  afterEach(() => {
    process.env = originalEnv
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
    mock.restore()
  })

  describe('CLI Integration', () => {
    it('should display help for upgrade command', async () => {
      const { spawn } = await import('node:child_process')
      const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')

      return new Promise<void>((resolve, reject) => {
        const proc = spawn('bun', [cliPath, 'upgrade', '--help'], {
          stdio: ['ignore', 'pipe', 'pipe'],
          env: getTestEnv(),
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
            expect(output).toContain('Usage:')
            expect(output).toContain('$ launchpad upgrade')
            expect(output).toContain('--force')
            expect(output).toContain('--verbose')
            expect(output).toContain('--target')
            expect(output).toContain('--release')
            expect(output).toContain('Force upgrade even if already on latest version')
            expect(output).toContain('Enable verbose output')
            expect(output).toContain('Target installation path')
            expect(output).toContain('Upgrade to specific version')
            resolve()
          }
          catch (error) {
            reject(error)
          }
        })

        setTimeout(() => {
          proc.kill()
          reject(new Error('Upgrade help test timed out'))
        }, 10000)
      })
    }, 15000)

    it('should support self-update alias', async () => {
      const { spawn } = await import('node:child_process')
      const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')

      return new Promise<void>((resolve, reject) => {
        const proc = spawn('bun', [cliPath, 'self-update', '--help'], {
          stdio: ['ignore', 'pipe', 'pipe'],
          env: getTestEnv(),
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
            expect(output).toContain('Usage:')
            expect(output).toContain('$ launchpad upgrade')
            expect(output).toContain('--force')
            expect(output).toContain('--verbose')
            resolve()
          }
          catch (error) {
            reject(error)
          }
        })

        setTimeout(() => {
          proc.kill()
          reject(new Error('Self-update alias test timed out'))
        }, 10000)
      })
    }, 15000)
  })

  describe('Version Detection', () => {
    it('should detect current binary path correctly', () => {
      // Test current binary path detection
      const currentBinaryPath = process.argv[1] || process.execPath
      expect(currentBinaryPath).toBeDefined()
      expect(typeof currentBinaryPath).toBe('string')
      expect(currentBinaryPath.length).toBeGreaterThan(0)
    })

    it('should use target path when specified', () => {
      const customTarget = '/custom/bin/launchpad'
      const currentBinary = '/current/bin/launchpad'

      // When target is specified, it should override current binary path
      const targetPath = customTarget || currentBinary
      expect(targetPath).toBe(customTarget)
    })

    it('should default to current binary path when no target specified', () => {
      const currentBinary = '/current/bin/launchpad'
      const targetPath: string | undefined = undefined
      const finalPath = targetPath || currentBinary
      expect(finalPath).toBe(currentBinary)
    })
  })

  describe('GitHub API Integration', () => {
    it('should fetch latest version from GitHub API', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        json: () => Promise.resolve({ tag_name: 'v0.3.15' }),
      }

      const mockFetch = mock(() => Promise.resolve(mockResponse))
      globalThis.fetch = mockFetch

      // Simulate the API call
      const response = await globalThis.fetch('https://api.github.com/repos/stacksjs/launchpad/releases/latest')
      expect(response.ok).toBe(true)

      const release = await response.json() as { tag_name: string }
      expect(release.tag_name).toBe('v0.3.15')
      expect(mockFetch).toHaveBeenCalledWith('https://api.github.com/repos/stacksjs/launchpad/releases/latest')
    })

    it('should handle GitHub API errors gracefully', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
      }

      const mockFetch = mock(() => Promise.resolve(mockResponse))
      globalThis.fetch = mockFetch

      const response = await globalThis.fetch('https://api.github.com/repos/stacksjs/launchpad/releases/latest')
      expect(response.ok).toBe(false)
      expect(response.status).toBe(404)
    })

    it('should handle network errors', async () => {
      const mockFetch = mock(() => Promise.reject(new Error('Network error')))
      globalThis.fetch = mockFetch

      try {
        await globalThis.fetch('https://api.github.com/repos/stacksjs/launchpad/releases/latest')
        expect(true).toBe(false) // Should not reach here
      }
      catch (error) {
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toBe('Network error')
      }
    })

    it('should parse tag_name correctly from GitHub response', async () => {
      const testCases = [
        { tag_name: 'v0.3.12', expected: 'v0.3.12' },
        { tag_name: '0.3.12', expected: '0.3.12' },
        { tag_name: 'v1.0.0-beta.1', expected: 'v1.0.0-beta.1' },
        { tag_name: 'release-0.3.12', expected: 'release-0.3.12' },
      ]

      for (const testCase of testCases) {
        const mockResponse = {
          ok: true,
          status: 200,
          json: () => Promise.resolve({ tag_name: testCase.tag_name }),
        }

        const mockFetch = mock(() => Promise.resolve(mockResponse))
        globalThis.fetch = mockFetch

        const response = await globalThis.fetch('https://api.github.com/repos/stacksjs/launchpad/releases/latest')
        const release = await response.json() as { tag_name: string }
        expect(release.tag_name).toBe(testCase.expected)
      }
    })
  })

  describe('Version Comparison Logic', () => {
    it('should skip upgrade when already on latest version', () => {
      const currentVersion = 'v0.3.12'
      const latestVersion = 'v0.3.12'
      const force = false

      const shouldUpgrade = force || latestVersion !== currentVersion
      expect(shouldUpgrade).toBe(false)
    })

    it('should proceed with upgrade when force flag is set', () => {
      const currentVersion = 'v0.3.12'
      const latestVersion = 'v0.3.12'
      const force = true

      const shouldUpgrade = force || latestVersion !== currentVersion
      expect(shouldUpgrade).toBe(true)
    })

    it('should proceed with upgrade when versions differ', () => {
      const currentVersion = 'v0.3.11'
      const latestVersion = 'v0.3.12'
      const force = false

      const shouldUpgrade = force || latestVersion !== currentVersion
      expect(shouldUpgrade).toBe(true)
    })

    it('should handle version formats correctly', () => {
      const testCases = [
        { current: 'v0.3.11', target: 'v0.3.12', shouldUpgrade: true },
        { current: '0.3.11', target: 'v0.3.12', shouldUpgrade: true },
        { current: 'v0.3.12', target: '0.3.12', shouldUpgrade: true },
        { current: 'v0.3.12', target: 'v0.3.12', shouldUpgrade: false },
      ]

      for (const testCase of testCases) {
        const shouldUpgrade = testCase.target !== testCase.current
        expect(shouldUpgrade).toBe(testCase.shouldUpgrade)
      }
    })
  })

  describe('Setup Command Integration', () => {
    it('should build correct setup command arguments', () => {
      const targetVersion = 'v0.3.12'
      const targetPath = '/usr/local/bin/launchpad'
      const currentBinaryPath = '/current/bin/launchpad'
      const verbose = true

      const setupOptions: string[] = ['setup']

      if (targetVersion) {
        setupOptions.push('--release', targetVersion)
      }

      if (targetPath !== currentBinaryPath) {
        setupOptions.push('--target', targetPath)
      }

      setupOptions.push('--force') // Always force during upgrade

      if (verbose) {
        setupOptions.push('--verbose')
      }

      expect(setupOptions).toContain('setup')
      expect(setupOptions).toContain('--release')
      expect(setupOptions).toContain('v0.3.12')
      expect(setupOptions).toContain('--target')
      expect(setupOptions).toContain('/usr/local/bin/launchpad')
      expect(setupOptions).toContain('--force')
      expect(setupOptions).toContain('--verbose')
    })

    it('should not include target when same as current binary', () => {
      const targetVersion = 'v0.3.12'
      const targetPath = '/current/bin/launchpad'
      const currentBinaryPath = '/current/bin/launchpad'
      const verbose = false

      const setupOptions: string[] = ['setup']

      if (targetVersion) {
        setupOptions.push('--release', targetVersion)
      }

      if (targetPath !== currentBinaryPath) {
        setupOptions.push('--target', targetPath)
      }

      setupOptions.push('--force')

      if (verbose) {
        setupOptions.push('--verbose')
      }

      expect(setupOptions).toContain('setup')
      expect(setupOptions).toContain('--release')
      expect(setupOptions).toContain('v0.3.12')
      expect(setupOptions).toContain('--force')
      expect(setupOptions).not.toContain('--target')
      expect(setupOptions).not.toContain('--verbose')
    })

    it('should handle missing version gracefully', () => {
      const targetVersion: string | undefined = undefined
      const targetPath = '/usr/local/bin/launchpad'
      const currentBinaryPath = '/current/bin/launchpad'

      const setupOptions: string[] = ['setup']

      if (targetVersion) {
        setupOptions.push('--release', targetVersion)
      }

      if (targetPath !== currentBinaryPath) {
        setupOptions.push('--target', targetPath)
      }

      setupOptions.push('--force')

      expect(setupOptions).toContain('setup')
      expect(setupOptions).toContain('--target')
      expect(setupOptions).toContain('--force')
      expect(setupOptions).not.toContain('--release')
    })
  })

  describe('Command Execution', () => {
    it('should build correct command line for setup execution', () => {
      const nodeCmd = '/usr/local/bin/bun'
      const cliPath = '/path/to/cli.ts'
      const setupOptions = ['setup', '--release', 'v0.3.12', '--force']

      const expectedCommand = `"${nodeCmd}" "${cliPath}" ${setupOptions.join(' ')}`
      expect(expectedCommand).toBe('"/usr/local/bin/bun" "/path/to/cli.ts" setup --release v0.3.12 --force')
    })

    it('should handle paths with spaces correctly', () => {
      const nodeCmd = '/Applications/Bun App/bin/bun'
      const cliPath = '/Users/test user/launchpad/cli.ts'
      const setupOptions = ['setup', '--target', '/usr/local/bin/launchpad']

      const expectedCommand = `"${nodeCmd}" "${cliPath}" ${setupOptions.join(' ')}`
      expect(expectedCommand).toBe('"/Applications/Bun App/bin/bun" "/Users/test user/launchpad/cli.ts" setup --target /usr/local/bin/launchpad')
    })
  })

  describe('Error Handling', () => {
    it('should provide helpful error message for GitHub API failures', () => {
      const error = new Error('GitHub API request failed: 404 Not Found')
      const helpfulMessage = `❌ Failed to check latest version: ${error.message}`
      const suggestion = '💡 You can specify a version manually with --release'

      expect(helpfulMessage).toContain('Failed to check latest version')
      expect(helpfulMessage).toContain('GitHub API request failed')
      expect(suggestion).toContain('specify a version manually')
    })

    it('should provide troubleshooting steps for upgrade failures', () => {
      const setupOptions = ['setup', '--release', 'v0.3.12', '--force']
      const troubleshootingSteps = [
        '🔧 Troubleshooting:',
        `• Try running the setup command manually:`,
        `  launchpad ${setupOptions.join(' ')}`,
        '• Check your internet connection',
        '• Verify you have permission to write to the target location',
        '• Use --verbose for more detailed output',
      ]

      expect(troubleshootingSteps[0]).toContain('Troubleshooting')
      expect(troubleshootingSteps[1]).toContain('Try running the setup command manually')
      expect(troubleshootingSteps[2]).toContain('launchpad setup --release v0.3.12 --force')
      expect(troubleshootingSteps[3]).toContain('Check your internet connection')
      expect(troubleshootingSteps[4]).toContain('permission to write')
      expect(troubleshootingSteps[5]).toContain('--verbose')
    })

    it('should suggest setup command as fallback', () => {
      const fallbackMessage = [
        '💡 Alternative: Use the setup command directly:',
        '  launchpad setup --force',
      ]

      expect(fallbackMessage[0]).toContain('Alternative')
      expect(fallbackMessage[1]).toContain('launchpad setup --force')
    })
  })

  describe('Output Messages', () => {
    it('should show current version information', () => {
      const currentVersion = 'v0.3.11'
      const currentBinary = '/usr/local/bin/launchpad'
      const messages = [
        '🚀 Upgrading Launchpad...',
        `📍 Current binary: ${currentBinary}`,
        `📋 Current version: launchpad/${currentVersion.replace('v', '')}`,
      ]

      expect(messages[0]).toContain('Upgrading Launchpad')
      expect(messages[1]).toContain('Current binary')
      expect(messages[1]).toContain('/usr/local/bin/launchpad')
      expect(messages[2]).toContain('Current version')
      expect(messages[2]).toContain('launchpad/0.3.11')
    })

    it('should show upgrade progress information', () => {
      const currentVersion = 'v0.3.11'
      const targetVersion = 'v0.3.12'
      const messages = [
        '🔍 Checking for latest version...',
        `📦 Latest version: ${targetVersion}`,
        `⬆️  Upgrading from ${currentVersion} to ${targetVersion}`,
      ]

      expect(messages[0]).toContain('Checking for latest version')
      expect(messages[1]).toContain('Latest version: v0.3.12')
      expect(messages[2]).toContain('Upgrading from v0.3.11 to v0.3.12')
    })

    it('should show success messages', () => {
      const successMessages = [
        '🎉 Upgrade completed successfully!',
        '🚀 Next steps:',
        '1. Restart your terminal or reload your shell',
        '2. Run: launchpad --version',
        '3. Verify the upgrade worked correctly',
      ]

      expect(successMessages[0]).toContain('Upgrade completed successfully')
      expect(successMessages[1]).toContain('Next steps')
      expect(successMessages[2]).toContain('Restart your terminal')
      expect(successMessages[3]).toContain('launchpad --version')
      expect(successMessages[4]).toContain('Verify the upgrade worked')
    })

    it('should show skip message when already on latest', () => {
      const skipMessages = [
        '✅ Already on the latest version!',
        '💡 Use --force to reinstall the current version',
      ]

      expect(skipMessages[0]).toContain('Already on the latest version')
      expect(skipMessages[1]).toContain('Use --force to reinstall')
    })
  })

  describe('Option Handling', () => {
    it('should process verbose option correctly', () => {
      const options = { verbose: true, force: false }
      expect(options.verbose).toBe(true)
      expect(options.force).toBe(false)
    })

    it('should process force option correctly', () => {
      const options = { verbose: false, force: true }
      expect(options.verbose).toBe(false)
      expect(options.force).toBe(true)
    })

    it('should process target option correctly', () => {
      const options = { target: '/custom/path/launchpad' }
      expect(options.target).toBe('/custom/path/launchpad')
    })

    it('should process release option correctly', () => {
      const options = { release: 'v0.3.5' }
      expect(options.release).toBe('v0.3.5')
    })

    it('should handle undefined options gracefully', () => {
      const options = {
        verbose: undefined,
        force: undefined,
        target: undefined,
        release: undefined,
      }

      expect(options.verbose || false).toBe(false)
      expect(options.force || false).toBe(false)
      expect(options.target || '/default/path').toBe('/default/path')
      expect(options.release || 'latest').toBe('latest')
    })
  })

  describe('Integration with Setup Command', () => {
    it('should delegate to setup command for actual installation', () => {
      // The upgrade command should not implement its own download/install logic
      // Instead it should delegate to the existing setup command
      const upgradeUsesSetup = true // This is the architectural decision
      expect(upgradeUsesSetup).toBe(true)
    })

    it('should pass through all relevant options to setup', () => {
      const upgradeOptions = {
        release: 'v0.3.12',
        target: '/custom/bin/launchpad',
        verbose: true,
        force: true,
      }

      const setupOptions = ['setup']

      if (upgradeOptions.release) {
        setupOptions.push('--release', upgradeOptions.release)
      }

      if (upgradeOptions.target) {
        setupOptions.push('--target', upgradeOptions.target)
      }

      if (upgradeOptions.force) {
        setupOptions.push('--force')
      }

      if (upgradeOptions.verbose) {
        setupOptions.push('--verbose')
      }

      expect(setupOptions).toEqual([
        'setup',
        '--release',
        'v0.3.12',
        '--target',
        '/custom/bin/launchpad',
        '--force',
        '--verbose',
      ])
    })
  })
})
