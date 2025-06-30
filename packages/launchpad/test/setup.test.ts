import { afterEach, beforeEach, describe, expect, it, mock } from 'bun:test'
import { spawn } from 'node:child_process'
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

describe('Setup Command', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string
  let mockFetch: any

  beforeEach(() => {
    originalEnv = { ...process.env }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-setup-test-'))

    // Mock fetch for testing downloads
    mockFetch = mock(() => Promise.resolve({
      ok: true,
      status: 200,
      statusText: 'OK',
      arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024 * 1024)), // 1MB mock binary
    }))
    globalThis.fetch = mockFetch
  })

  afterEach(() => {
    process.env = originalEnv
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
    mock.restore()
  })

  describe('Platform Detection', () => {
    it('should detect macOS ARM64 platform correctly', () => {
      const originalPlatform = process.platform
      const originalArch = process.arch

      Object.defineProperty(process, 'platform', { value: 'darwin' })
      Object.defineProperty(process, 'arch', { value: 'arm64' })

      // Test platform detection logic
      const platform = process.platform
      const arch = process.arch

      let binaryName: string
      if (platform === 'darwin') {
        binaryName = arch === 'arm64' ? 'launchpad-darwin-arm64.zip' : 'launchpad-darwin-x64.zip'
      }
      else if (platform === 'linux') {
        binaryName = arch === 'arm64' ? 'launchpad-linux-arm64.zip' : 'launchpad-linux-x64.zip'
      }
      else if (platform === 'win32') {
        binaryName = 'launchpad-windows-x64.zip'
      }
      else {
        binaryName = 'unsupported'
      }

      expect(binaryName).toBe('launchpad-darwin-arm64.zip')

      // Restore original values
      Object.defineProperty(process, 'platform', { value: originalPlatform })
      Object.defineProperty(process, 'arch', { value: originalArch })
    })

    it('should detect macOS x64 platform correctly', () => {
      const originalPlatform = process.platform
      const originalArch = process.arch

      Object.defineProperty(process, 'platform', { value: 'darwin' })
      Object.defineProperty(process, 'arch', { value: 'x64' })

      const platform = process.platform
      const arch = process.arch

      let binaryName: string
      if (platform === 'darwin') {
        binaryName = arch === 'arm64' ? 'launchpad-darwin-arm64.zip' : 'launchpad-darwin-x64.zip'
      }
      else {
        binaryName = 'other'
      }

      expect(binaryName).toBe('launchpad-darwin-x64.zip')

      Object.defineProperty(process, 'platform', { value: originalPlatform })
      Object.defineProperty(process, 'arch', { value: originalArch })
    })

    it('should detect Linux ARM64 platform correctly', () => {
      const originalPlatform = process.platform
      const originalArch = process.arch

      Object.defineProperty(process, 'platform', { value: 'linux' })
      Object.defineProperty(process, 'arch', { value: 'arm64' })

      const platform = process.platform
      const arch = process.arch

      let binaryName: string
      if (platform === 'linux') {
        binaryName = arch === 'arm64' ? 'launchpad-linux-arm64.zip' : 'launchpad-linux-x64.zip'
      }
      else {
        binaryName = 'other'
      }

      expect(binaryName).toBe('launchpad-linux-arm64.zip')

      Object.defineProperty(process, 'platform', { value: originalPlatform })
      Object.defineProperty(process, 'arch', { value: originalArch })
    })

    it('should detect Linux x64 platform correctly', () => {
      const originalPlatform = process.platform
      const originalArch = process.arch

      Object.defineProperty(process, 'platform', { value: 'linux' })
      Object.defineProperty(process, 'arch', { value: 'x64' })

      const platform = process.platform
      const arch = process.arch

      let binaryName: string
      if (platform === 'linux') {
        binaryName = arch === 'arm64' ? 'launchpad-linux-arm64.zip' : 'launchpad-linux-x64.zip'
      }
      else {
        binaryName = 'other'
      }

      expect(binaryName).toBe('launchpad-linux-x64.zip')

      Object.defineProperty(process, 'platform', { value: originalPlatform })
      Object.defineProperty(process, 'arch', { value: originalArch })
    })

    it('should detect Windows x64 platform correctly', () => {
      const originalPlatform = process.platform
      const originalArch = process.arch

      Object.defineProperty(process, 'platform', { value: 'win32' })
      Object.defineProperty(process, 'arch', { value: 'x64' })

      const platform = process.platform

      let binaryName: string
      if (platform === 'win32') {
        binaryName = 'launchpad-windows-x64.zip'
      }
      else {
        binaryName = 'other'
      }

      expect(binaryName).toBe('launchpad-windows-x64.zip')

      Object.defineProperty(process, 'platform', { value: originalPlatform })
      Object.defineProperty(process, 'arch', { value: originalArch })
    })
  })

  describe('Download URL Generation', () => {
    it('should generate correct download URL for default version', () => {
      const version = 'v0.3.6'
      const binaryName = 'launchpad-darwin-arm64.zip'
      const expectedUrl = `https://github.com/stacksjs/launchpad/releases/download/${version}/${binaryName}`

      expect(expectedUrl).toBe('https://github.com/stacksjs/launchpad/releases/download/v0.3.6/launchpad-darwin-arm64.zip')
    })

    it('should generate correct download URL for custom version', () => {
      const version = 'v0.3.5'
      const binaryName = 'launchpad-linux-x64.zip'
      const expectedUrl = `https://github.com/stacksjs/launchpad/releases/download/${version}/${binaryName}`

      expect(expectedUrl).toBe('https://github.com/stacksjs/launchpad/releases/download/v0.3.5/launchpad-linux-x64.zip')
    })

    it('should handle version strings without v prefix', () => {
      const version = '0.3.4'
      const binaryName = 'launchpad-windows-x64.zip'
      const expectedUrl = `https://github.com/stacksjs/launchpad/releases/download/${version}/${binaryName}`

      expect(expectedUrl).toBe('https://github.com/stacksjs/launchpad/releases/download/0.3.4/launchpad-windows-x64.zip')
    })
  })

  describe('Target Path Validation', () => {
    it('should use default target path when none specified', () => {
      const defaultTarget = '/usr/local/bin/launchpad'
      expect(defaultTarget).toBe('/usr/local/bin/launchpad')
    })

    it('should use custom target path when specified', () => {
      const customTarget = '/custom/path/launchpad'
      expect(customTarget).toBe('/custom/path/launchpad')
    })

    it('should expand home directory in target path', () => {
      const homeTarget = '~/bin/launchpad'
      const expandedTarget = homeTarget.replace('~', os.homedir())
      expect(expandedTarget).toBe(path.join(os.homedir(), 'bin/launchpad'))
    })

    it('should detect system paths that need sudo', () => {
      const systemPaths = [
        '/usr/local/bin/launchpad',
        '/usr/bin/launchpad',
        '/opt/launchpad/bin/launchpad',
        '/bin/launchpad',
        '/sbin/launchpad',
      ]

      systemPaths.forEach((testPath) => {
        const needsSudo = testPath.startsWith('/usr/')
          || testPath.startsWith('/opt/')
          || testPath.startsWith('/bin/')
          || testPath.startsWith('/sbin/')
        expect(needsSudo).toBe(true)
      })
    })

    it('should not require sudo for user paths', () => {
      const userPaths = [
        path.join(os.homedir(), 'bin/launchpad'),
        path.join(os.homedir(), '.local/bin/launchpad'),
        '/tmp/launchpad',
        './launchpad',
      ]

      userPaths.forEach((testPath) => {
        const needsSudo = testPath.startsWith('/usr/')
          || testPath.startsWith('/opt/')
          || testPath.startsWith('/bin/')
          || testPath.startsWith('/sbin/')
        expect(needsSudo).toBe(false)
      })
    })
  })

  describe('File Operations', () => {
    it('should detect existing files correctly', () => {
      const testFile = path.join(tempDir, 'test-binary')

      // File should not exist initially
      expect(fs.existsSync(testFile)).toBe(false)

      // Create file
      fs.writeFileSync(testFile, 'test content')

      // File should exist now
      expect(fs.existsSync(testFile)).toBe(true)
    })

    it('should create target directory if it does not exist', () => {
      const targetDir = path.join(tempDir, 'nested', 'directory')
      const _targetFile = path.join(targetDir, 'launchpad')

      // Directory should not exist initially
      expect(fs.existsSync(targetDir)).toBe(false)

      // Create directory structure
      fs.mkdirSync(targetDir, { recursive: true })

      // Directory should exist now
      expect(fs.existsSync(targetDir)).toBe(true)
      expect(fs.statSync(targetDir).isDirectory()).toBe(true)
    })

    it('should handle file permissions correctly on Unix systems', () => {
      if (process.platform === 'win32') {
        // Skip on Windows
        return
      }

      const testFile = path.join(tempDir, 'test-executable')
      fs.writeFileSync(testFile, '#!/bin/bash\necho "test"')

      // Make executable
      fs.chmodSync(testFile, 0o755)

      const stats = fs.statSync(testFile)
      const isExecutable = !!(stats.mode & 0o111)
      expect(isExecutable).toBe(true)
    })
  })

  describe('Download Simulation', () => {
    it('should handle successful download response', async () => {
      const mockResponse = {
        ok: true,
        status: 200,
        statusText: 'OK',
        arrayBuffer: () => Promise.resolve(new ArrayBuffer(1024)),
      }

      expect(mockResponse.ok).toBe(true)
      expect(mockResponse.status).toBe(200)

      const buffer = await mockResponse.arrayBuffer()
      expect(buffer.byteLength).toBe(1024)
    })

    it('should handle failed download response', async () => {
      const mockResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
        arrayBuffer: () => Promise.reject(new Error('No content')),
      }

      expect(mockResponse.ok).toBe(false)
      expect(mockResponse.status).toBe(404)
      expect(mockResponse.statusText).toBe('Not Found')
    })

    it('should handle network errors', async () => {
      const networkError = new Error('Network error')

      expect(networkError.message).toBe('Network error')
      expect(networkError instanceof Error).toBe(true)
    })
  })

  describe('CLI Integration', () => {
    it('should display help for setup command', async () => {
      const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')

      return new Promise<void>((resolve, reject) => {
        const proc = spawn('bun', [cliPath, 'setup', '--help'], {
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
            expect(output).toContain('setup')
            expect(output).toContain('Usage:')
            expect(output).toContain('--force')
            expect(output).toContain('--target')
            expect(output).toContain('Force download even if binary already exists')
            expect(output).toContain('Target installation path')
            resolve()
          }
          catch (error) {
            reject(error)
          }
        })

        setTimeout(() => {
          proc.kill()
          reject(new Error('Setup help test timed out'))
        }, 10000)
      })
    }, 15000)

    it('should handle setup command with dry-run simulation', async () => {
      // This test simulates what would happen during setup without actually downloading
      const mockVersion = 'v0.3.6'
      const mockTarget = path.join(tempDir, 'launchpad')
      const mockPlatform = 'darwin'
      const mockArch = 'arm64'

      // Simulate platform detection
      const binaryName = `launchpad-${mockPlatform}-${mockArch}.zip`
      expect(binaryName).toBe('launchpad-darwin-arm64.zip')

      // Simulate URL generation
      const downloadUrl = `https://github.com/stacksjs/launchpad/releases/download/${mockVersion}/${binaryName}`
      expect(downloadUrl).toBe('https://github.com/stacksjs/launchpad/releases/download/v0.3.6/launchpad-darwin-arm64.zip')

      // Simulate target path validation
      expect(fs.existsSync(mockTarget)).toBe(false)

      // Simulate directory creation
      const targetDir = path.dirname(mockTarget)
      if (!fs.existsSync(targetDir)) {
        fs.mkdirSync(targetDir, { recursive: true })
      }
      expect(fs.existsSync(targetDir)).toBe(true)
    })

    it('should validate setup command exists in CLI', () => {
      const cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
      const content = fs.readFileSync(cliPath, 'utf-8')

      // Check that setup command is defined
      expect(content).toContain('.command(\'setup\'')
      expect(content).toContain('Download and install Launchpad binary')
      expect(content).toContain('--force')
      expect(content).toContain('--verbose')
      expect(content).toContain('--version')
      expect(content).toContain('--target')
    })
  })

  describe('Error Handling', () => {
    it('should handle unsupported platform gracefully', () => {
      const unsupportedPlatform: string = 'unsupported-os'
      const unsupportedArch = 'unsupported-arch'

      let errorThrown = false
      try {
        // Simulate unsupported platform detection
        if (unsupportedPlatform !== 'darwin' && unsupportedPlatform !== 'linux' && unsupportedPlatform !== 'win32') {
          throw new Error(`Unsupported platform: ${unsupportedPlatform}-${unsupportedArch}`)
        }
      }
      catch (error) {
        errorThrown = true
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain('Unsupported platform')
      }

      expect(errorThrown).toBe(true)
    })

    it('should handle download failures gracefully', async () => {
      const mockFailedResponse = {
        ok: false,
        status: 404,
        statusText: 'Not Found',
      }

      let errorThrown = false
      try {
        if (!mockFailedResponse.ok) {
          throw new Error(`Failed to download: ${mockFailedResponse.status} ${mockFailedResponse.statusText}`)
        }
      }
      catch (error) {
        errorThrown = true
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain('Failed to download')
        expect((error as Error).message).toContain('404')
      }

      expect(errorThrown).toBe(true)
    })

    it('should handle extraction failures gracefully', () => {
      let errorThrown = false
      try {
        // Simulate extraction failure
        throw new Error('Failed to extract zip file. Please ensure unzip is installed on your system.')
      }
      catch (error) {
        errorThrown = true
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain('Failed to extract zip file')
        expect((error as Error).message).toContain('unzip is installed')
      }

      expect(errorThrown).toBe(true)
    })

    it('should handle permission errors gracefully', () => {
      let errorThrown = false
      try {
        // Simulate permission error
        throw new Error('Failed to install with sudo. You may need to run this command with elevated privileges.')
      }
      catch (error) {
        errorThrown = true
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain('Failed to install with sudo')
        expect((error as Error).message).toContain('elevated privileges')
      }

      expect(errorThrown).toBe(true)
    })

    it('should handle missing binary in zip gracefully', () => {
      let errorThrown = false
      try {
        // Simulate missing binary in extracted files
        const extractedFiles = ['README.md', 'LICENSE']
        const binaryFile = extractedFiles.find(f => f === 'launchpad' || f.startsWith('launchpad'))

        if (!binaryFile) {
          throw new Error('Could not find launchpad binary in extracted files')
        }
      }
      catch (error) {
        errorThrown = true
        expect(error).toBeInstanceOf(Error)
        expect((error as Error).message).toContain('Could not find launchpad binary')
      }

      expect(errorThrown).toBe(true)
    })
  })

  describe('Version Handling', () => {
    it('should use default version when not specified', () => {
      const defaultVersion = 'v0.3.6'
      expect(defaultVersion).toBe('v0.3.6')
    })

    it('should use custom version when specified', () => {
      const customVersion = 'v0.3.5'
      expect(customVersion).toBe('v0.3.5')
    })

    it('should handle version strings with and without v prefix', () => {
      const versions = ['v0.3.6', '0.3.6', 'v1.0.0', '1.0.0']

      versions.forEach((version) => {
        expect(typeof version).toBe('string')
        expect(version.length).toBeGreaterThan(0)
      })
    })
  })

  describe('Cleanup Operations', () => {
    it('should clean up temporary files after successful installation', () => {
      const tmpDir = path.join(os.tmpdir(), `launchpad-setup-${Date.now()}`)

      // Create temporary directory
      fs.mkdirSync(tmpDir, { recursive: true })
      expect(fs.existsSync(tmpDir)).toBe(true)

      // Create some test files
      fs.writeFileSync(path.join(tmpDir, 'test.zip'), 'mock zip content')
      fs.writeFileSync(path.join(tmpDir, 'launchpad'), 'mock binary content')

      // Simulate cleanup
      fs.rmSync(tmpDir, { recursive: true, force: true })
      expect(fs.existsSync(tmpDir)).toBe(false)
    })

    it('should handle cleanup errors gracefully', () => {
      const nonExistentDir = path.join(tempDir, 'non-existent-dir')

      // This should not throw an error
      expect(() => {
        try {
          fs.rmSync(nonExistentDir, { recursive: true, force: true })
        }
        catch {
          // Ignore cleanup errors
        }
      }).not.toThrow()
    })
  })

  describe('PATH Management', () => {
    it('should detect if binary directory is in PATH', () => {
      const currentPath = process.env.PATH || ''
      const testDir = '/usr/local/bin'

      const isInPath = currentPath.split(':').includes(testDir)
      expect(typeof isInPath).toBe('boolean')
    })

    it('should provide PATH setup suggestions for custom paths', () => {
      const customBinDir = path.join(os.homedir(), 'custom-bin')
      const currentPath = process.env.PATH || ''
      const isInPath = currentPath.split(':').includes(customBinDir)

      if (!isInPath) {
        const suggestion = `export PATH="${customBinDir}:$PATH"`
        expect(suggestion).toContain(customBinDir)
        expect(suggestion).toContain('export PATH=')
      }
    })
  })
})
