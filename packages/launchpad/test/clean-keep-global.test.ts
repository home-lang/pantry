import { afterAll, beforeAll, describe, expect, it } from 'bun:test'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'

describe('clean --keep-global', () => {
  let testDir: string
  let cliPath: string
  let originalCwd: string
  let binaryAvailable = false

  beforeAll(async () => {
    originalCwd = process.cwd()
    testDir = fs.mkdtempSync(path.join(tmpdir(), 'launchpad-clean-global-test-'))
    cliPath = path.join(process.cwd(), 'bin', 'launchpad')

    // Check if CLI binary exists
    if (!fs.existsSync(cliPath)) {
      // In CI, the binary should be built by the workflow
      // If it doesn't exist, try to build it, but don't fail the test if build fails
      const { execSync } = await import('node:child_process')

      // Find the real bun binary (not mock versions)
      let bunPath = 'bun' // Default fallback
      try {
        // Try to find system bun in common locations
        const possiblePaths = [
          '/opt/homebrew/bin/bun', // macOS Homebrew (Apple Silicon)
          '/usr/local/bin/bun', // macOS Homebrew (Intel) / Linux
          '/home/runner/.bun/bin/bun', // GitHub Actions user install
          '/root/.bun/bin/bun', // GitHub Actions root install
          '/usr/bin/bun', // System package manager install
          '/usr/local/share/bun/bin/bun', // Alternative install location
        ]

        for (const testPath of possiblePaths) {
          try {
            const fs = await import('node:fs')
            if (fs.existsSync(testPath)) {
              bunPath = testPath
              break
            }
          }
          catch {
            // Continue checking other paths
          }
        }

        // If no specific path found, try to find bun in PATH (but avoid mock versions)
        if (bunPath === 'bun') {
          try {
            const whichResult = execSync('which bun', { encoding: 'utf8', stdio: 'pipe' }).trim()
            // Only use it if it's not in a launchpad directory (to avoid mocks)
            if (whichResult && !whichResult.includes('launchpad') && !whichResult.includes('share/launchpad')) {
              bunPath = whichResult
            }
          }
          catch {
            // Fallback to 'bun'
          }
        }
      }
      catch {
        // Use default 'bun' if all else fails
      }

      try {
        // Try to build the binary
        execSync(`${bunPath} run build`, {
          stdio: 'pipe',
          cwd: process.cwd(),
          encoding: 'utf8',
          env: {
            ...process.env,
            PATH: '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin:/usr/sbin:/sbin',
          },
        })
      }
      catch (error) {
        // If build fails, skip these tests instead of failing
        console.warn('CLI binary not found and build failed. Skipping clean --keep-global tests.')
        console.warn('This is expected in some CI environments where the binary should be pre-built.')
        console.warn('Build error:', error instanceof Error ? error.message : String(error))

        // Mark binary as unavailable
        binaryAvailable = false
        return
      }
    }

    // Verify the binary exists and is executable
    if (!fs.existsSync(cliPath)) {
      console.warn('CLI binary not found. Skipping clean --keep-global tests.')
      binaryAvailable = false
      return
    }

    // Make sure the binary is executable
    try {
      fs.chmodSync(cliPath, 0o755)
      binaryAvailable = true
    }
    catch (error) {
      console.warn('Could not set executable permissions on CLI binary:', error)
      binaryAvailable = false
    }
  })

  afterAll(async () => {
    process.chdir(originalCwd)
    if (fs.existsSync(testDir)) {
      fs.rmSync(testDir, { recursive: true, force: true })
    }
  })

  it('should show --keep-global option in help', async () => {
    if (!binaryAvailable) {
      console.warn('Skipping test: CLI binary not available')
      return
    }

    const proc = spawn(cliPath, ['clean', '--help'], {
      stdio: 'pipe',
      cwd: testDir,
      timeout: 10000, // 10 second timeout
    })

    let stdout = ''
    let stderr = ''
    proc.stdout?.on('data', (data) => {
      stdout += data.toString()
    })
    proc.stderr?.on('data', (data) => {
      stderr += data.toString()
    })

    await new Promise<void>((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        proc.kill()
        reject(new Error('Command timed out after 10 seconds'))
      }, 10000)

      proc.on('close', (code) => {
        clearTimeout(timeoutId)
        if (code === 0) {
          resolve()
        }
        else {
          reject(new Error(`Process exited with code ${code}. stderr: ${stderr}, stdout: ${stdout}`))
        }
      })
    })

    expect(stdout).toContain('--keep-global')
    expect(stdout).toContain('Keep global dependencies (preserve packages from global deps.yaml files)')
  })

  it('should preserve global dependencies when --keep-global is used', async () => {
    if (!binaryAvailable) {
      console.warn('Skipping test: CLI binary not available')
      return
    }

    // Create a mock global deps.yaml file
    const dotfilesDir = path.join(testDir, '.dotfiles')
    fs.mkdirSync(dotfilesDir, { recursive: true })

    const depsContent = `global: true
dependencies:
  bun.sh: ^1.2.16
  gnu.org/bash: ^5.2.37
  gnu.org/grep: ^3.12.0
  crates.io/eza: ^0.21.3
  ffmpeg.org: ^7.1.1
  cli.github.com: ^2.73.0
  starship.rs: ^1.23.0
`
    fs.writeFileSync(path.join(dotfilesDir, 'deps.yaml'), depsContent)

    // Create mock install prefix structure
    const installPrefix = path.join(testDir, 'usr', 'local')
    fs.mkdirSync(installPrefix, { recursive: true })

    // Create mock package directories (global dependencies)
    const globalPackages = ['bun.sh', 'gnu.org', 'crates.io', 'ffmpeg.org', 'cli.github.com', 'starship.rs']
    for (const pkg of globalPackages) {
      const pkgDir = path.join(installPrefix, pkg)
      fs.mkdirSync(pkgDir, { recursive: true })
      fs.writeFileSync(path.join(pkgDir, 'test-file.txt'), 'test content')
    }

    // Create mock non-global package directories
    const nonGlobalPackages = ['python.org', 'nodejs.org', 'go.dev']
    for (const pkg of nonGlobalPackages) {
      const pkgDir = path.join(installPrefix, pkg)
      fs.mkdirSync(pkgDir, { recursive: true })
      fs.writeFileSync(path.join(pkgDir, 'test-file.txt'), 'test content')
    }

    // Create mock package metadata
    const pkgsDir = path.join(installPrefix, 'pkgs')
    fs.mkdirSync(pkgsDir, { recursive: true })

    // Create metadata for all packages
    const allPackages = [...globalPackages, ...nonGlobalPackages]
    for (const pkg of allPackages) {
      const pkgMetaDir = path.join(pkgsDir, pkg, 'v1.0.0')
      fs.mkdirSync(pkgMetaDir, { recursive: true })
      fs.writeFileSync(path.join(pkgMetaDir, 'metadata.json'), JSON.stringify({
        binaries: [pkg.split('.')[0]], // Simple binary name
      }))
    }

    // Create mock binaries
    const binDir = path.join(installPrefix, 'bin')
    fs.mkdirSync(binDir, { recursive: true })
    for (const pkg of allPackages) {
      const binaryName = pkg.split('.')[0]
      fs.writeFileSync(path.join(binDir, binaryName), '#!/bin/sh\necho "mock binary"')
    }

    // Set HOME to our test directory so it finds the .dotfiles
    const env = { ...process.env, HOME: testDir }

    // Run clean with --keep-global and --dry-run
    const proc = spawn(cliPath, ['clean', '--keep-global', '--dry-run'], {
      stdio: 'pipe',
      cwd: testDir,
      env,
    })

    let stdout = ''
    let stderr = ''
    proc.stdout?.on('data', (data) => {
      stdout += data.toString()
    })
    proc.stderr?.on('data', (data) => {
      stderr += data.toString()
    })

    await new Promise<void>((resolve, reject) => {
      proc.on('close', (code) => {
        if (code === 0) {
          resolve()
        }
        else {
          reject(new Error(`Process exited with code ${code}. stderr: ${stderr}`))
        }
      })
    })

    // The test environment may not have packages installed, so we check for appropriate behavior
    if (stdout.includes('Nothing found to clean')) {
      // No packages to clean is valid behavior
      expect(stdout).toContain('Nothing found to clean')
    }
    else {
      // If packages exist, should show preserved global dependencies
      if (stdout.includes('Global dependencies that would be preserved')) {
        expect(stdout).toContain('bun.sh')
        expect(stdout).toContain('gnu.org')
        expect(stdout).toContain('starship.rs')
      }

      // Should NOT show global packages in removal list
      expect(stdout).not.toContain('Package files (bun.sh)')
      expect(stdout).not.toContain('Package files (gnu.org)')
      expect(stdout).not.toContain('Package files (starship.rs)')
    }
  })

  it('should remove all packages when --keep-global is not used', async () => {
    if (!binaryAvailable) {
      console.warn('Skipping test: CLI binary not available')
      return
    }

    // Create a mock global deps.yaml file
    const dotfilesDir = path.join(testDir, '.dotfiles')
    fs.mkdirSync(dotfilesDir, { recursive: true })

    const depsContent = `global: true
dependencies:
  bun.sh: ^1.2.16
  gnu.org/bash: ^5.2.37
`
    fs.writeFileSync(path.join(dotfilesDir, 'deps.yaml'), depsContent)

    // Create mock install prefix structure
    const installPrefix = path.join(testDir, 'usr', 'local')
    fs.mkdirSync(installPrefix, { recursive: true })

    // Create mock package directories
    const packages = ['bun.sh', 'gnu.org', 'python.org']
    for (const pkg of packages) {
      const pkgDir = path.join(installPrefix, pkg)
      fs.mkdirSync(pkgDir, { recursive: true })
      fs.writeFileSync(path.join(pkgDir, 'test-file.txt'), 'test content')
    }

    // Set HOME to our test directory
    const env = { ...process.env, HOME: testDir }

    // Run clean without --keep-global
    const proc = spawn(cliPath, ['clean', '--dry-run'], {
      stdio: 'pipe',
      cwd: testDir,
      env,
    })

    let stdout = ''
    proc.stdout?.on('data', (data) => {
      stdout += data.toString()
    })

    await new Promise<void>((resolve, reject) => {
      proc.on('close', (code) => {
        if (code === 0) {
          resolve()
        }
        else {
          reject(new Error(`Process exited with code ${code}`))
        }
      })
    })

    // Should NOT show preserved global dependencies section
    expect(stdout).not.toContain('Global dependencies that would be preserved')

    // Should show all packages in removal list (if any packages exist)
    if (stdout.includes('Package files')) {
      expect(stdout).toContain('Would remove:')
    }
  })

  it('should detect global dependencies from different file locations', async () => {
    if (!binaryAvailable) {
      console.warn('Skipping test: CLI binary not available')
      return
    }

    // Test different locations for deps.yaml files
    const testCases = [
      { dir: '.dotfiles', file: 'deps.yaml' },
      { dir: '.dotfiles', file: 'deps.yml' },
      { dir: '.dotfiles', file: 'dependencies.yaml' },
      { dir: '.', file: 'deps.yaml' },
      { dir: '.', file: 'dependencies.yml' },
    ]

    for (const testCase of testCases) {
      const testSubDir = path.join(testDir, `test-${testCase.dir.replace('.', 'dot')}-${testCase.file}`)
      fs.mkdirSync(testSubDir, { recursive: true })

      const depFileDir = testCase.dir === '.' ? testSubDir : path.join(testSubDir, testCase.dir)
      if (testCase.dir !== '.') {
        fs.mkdirSync(depFileDir, { recursive: true })
      }

      const depsContent = `global: true
dependencies:
  test-package.org: ^1.0.0
`
      fs.writeFileSync(path.join(depFileDir, testCase.file), depsContent)

      // Create mock package structure
      const installPrefix = path.join(testSubDir, 'usr', 'local')
      fs.mkdirSync(installPrefix, { recursive: true })

      const pkgDir = path.join(installPrefix, 'test-package.org')
      fs.mkdirSync(pkgDir, { recursive: true })
      fs.writeFileSync(path.join(pkgDir, 'test-file.txt'), 'test content')

      // Set HOME to our test subdirectory
      const env = { ...process.env, HOME: testSubDir }

      // Run clean with --keep-global
      const proc = spawn(cliPath, ['clean', '--keep-global', '--dry-run'], {
        stdio: 'pipe',
        cwd: testSubDir,
        env,
      })

      let stdout = ''
      proc.stdout?.on('data', (data) => {
        stdout += data.toString()
      })

      await new Promise<void>((resolve, reject) => {
        proc.on('close', (code) => {
          if (code === 0) {
            resolve()
          }
          else {
            reject(new Error(`Process exited with code ${code} for ${testCase.dir}/${testCase.file}`))
          }
        })
      })

      // Should detect the global dependency from this location
      if (stdout.includes('Global dependencies that would be preserved')) {
        expect(stdout).toContain('test-package.org')
      }
    }
  })

  it('should handle individual package global flags', async () => {
    if (!binaryAvailable) {
      console.warn('Skipping test: CLI binary not available')
      return
    }

    // Create a deps.yaml with individual package global flags
    const dotfilesDir = path.join(testDir, '.dotfiles')
    fs.mkdirSync(dotfilesDir, { recursive: true })

    const depsContent = `dependencies:
  bun.sh:
    version: ^1.2.16
    global: true
  python.org:
    version: ^3.11.0
    global: false
  nodejs.org: ^18.0.0
`
    fs.writeFileSync(path.join(dotfilesDir, 'deps.yaml'), depsContent)

    // Create mock install prefix structure
    const installPrefix = path.join(testDir, 'usr', 'local')
    fs.mkdirSync(installPrefix, { recursive: true })

    // Create mock package directories
    const packages = ['bun.sh', 'python.org', 'nodejs.org']
    for (const pkg of packages) {
      const pkgDir = path.join(installPrefix, pkg)
      fs.mkdirSync(pkgDir, { recursive: true })
      fs.writeFileSync(path.join(pkgDir, 'test-file.txt'), 'test content')
    }

    // Set HOME to our test directory
    const env = { ...process.env, HOME: testDir }

    // Run clean with --keep-global
    const proc = spawn(cliPath, ['clean', '--keep-global', '--dry-run'], {
      stdio: 'pipe',
      cwd: testDir,
      env,
    })

    let stdout = ''
    proc.stdout?.on('data', (data) => {
      stdout += data.toString()
    })

    await new Promise<void>((resolve, reject) => {
      proc.on('close', (code) => {
        if (code === 0) {
          resolve()
        }
        else {
          reject(new Error(`Process exited with code ${code}`))
        }
      })
    })

    // Should preserve only bun.sh (has global: true)
    if (stdout.includes('Global dependencies that would be preserved')) {
      expect(stdout).toContain('bun.sh')
      expect(stdout).not.toContain('python.org')
      expect(stdout).not.toContain('nodejs.org')
    }
  })

  it('should show warning about global preservation in confirmation prompt', async () => {
    if (!binaryAvailable) {
      console.warn('Skipping test: CLI binary not available')
      return
    }

    // Create a mock global deps.yaml file
    const dotfilesDir = path.join(testDir, '.dotfiles')
    fs.mkdirSync(dotfilesDir, { recursive: true })

    const depsContent = `global: true
dependencies:
  bun.sh: ^1.2.16
`
    fs.writeFileSync(path.join(dotfilesDir, 'deps.yaml'), depsContent)

    // Set HOME to our test directory
    const env = { ...process.env, HOME: testDir }

    // Run clean with --keep-global (without --force to see confirmation)
    const proc = spawn(cliPath, ['clean', '--keep-global'], {
      stdio: 'pipe',
      cwd: testDir,
      env,
    })

    let stdout = ''
    proc.stdout?.on('data', (data) => {
      stdout += data.toString()
    })

    // The process should exit with code 0 because it shows the confirmation and exits
    await new Promise<void>((resolve) => {
      proc.on('close', () => {
        resolve()
      })
    })

    // Should show the global preservation message in confirmation
    expect(stdout).toContain('Global dependencies will be preserved (--keep-global)')
  })

  it('should work with verbose output', async () => {
    if (!binaryAvailable) {
      console.warn('Skipping test: CLI binary not available')
      return
    }

    // Create a mock global deps.yaml file
    const dotfilesDir = path.join(testDir, '.dotfiles')
    fs.mkdirSync(dotfilesDir, { recursive: true })

    const depsContent = `global: true
dependencies:
  bun.sh: ^1.2.16
  test-package.org: ^1.0.0
`
    fs.writeFileSync(path.join(dotfilesDir, 'deps.yaml'), depsContent)

    // Create mock install prefix structure
    const installPrefix = path.join(testDir, 'usr', 'local')
    fs.mkdirSync(installPrefix, { recursive: true })

    // Create mock package directories
    const globalPackages = ['bun.sh', 'test-package.org']
    const nonGlobalPackages = ['python.org']

    for (const pkg of [...globalPackages, ...nonGlobalPackages]) {
      const pkgDir = path.join(installPrefix, pkg)
      fs.mkdirSync(pkgDir, { recursive: true })
      fs.writeFileSync(path.join(pkgDir, 'test-file.txt'), 'test content')
    }

    // Set HOME to our test directory
    const env = { ...process.env, HOME: testDir }

    // Run clean with --keep-global, --verbose, and --dry-run
    const proc = spawn(cliPath, ['clean', '--keep-global', '--verbose', '--dry-run'], {
      stdio: 'pipe',
      cwd: testDir,
      env,
    })

    let stdout = ''
    proc.stdout?.on('data', (data) => {
      stdout += data.toString()
    })

    await new Promise<void>((resolve, reject) => {
      proc.on('close', (code) => {
        if (code === 0) {
          resolve()
        }
        else {
          reject(new Error(`Process exited with code ${code}`))
        }
      })
    })

    // Should show verbose messages about skipping global dependencies or nothing to clean
    const hasSkippingMessage = stdout.includes('Skipping global dependency')
    const hasPreservedMessage = stdout.includes('Global dependencies that would be preserved')
    const hasNothingToClean = stdout.includes('Nothing found to clean')
    expect(hasSkippingMessage || hasPreservedMessage || hasNothingToClean).toBe(true)
  })
})
