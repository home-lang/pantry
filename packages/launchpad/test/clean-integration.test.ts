/* eslint-disable no-console */
import { afterEach, beforeEach, describe, expect, test } from 'bun:test'
import fs from 'node:fs'
import path from 'node:path'

describe('Clean Command Integration Test', () => {
  let tempDir: string
  let cliPath: string

  beforeEach(() => {
    // Create temporary directory for test
    tempDir = fs.mkdtempSync(path.join(import.meta.dirname, 'clean-integration-'))

    // Find CLI path
    cliPath = path.resolve(import.meta.dirname, '../bin/cli.ts')

    // Ensure CLI exists
    if (!fs.existsSync(cliPath)) {
      throw new Error(`CLI not found at ${cliPath}`)
    }
  })

  afterEach(() => {
    // Clean up temporary directory
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
  })

  // Helper to check if binary exists
  function binaryExists(name: string): boolean {
    return fs.existsSync(path.join(tempDir, 'bin', name))
  }

  // Helper to check if package metadata exists
  function packageMetadataExists(domain: string, version: string): boolean {
    return fs.existsSync(path.join(tempDir, 'pkgs', domain, `v${version}`, 'metadata.json'))
  }

  // Helper to manually create a mock package installation for testing
  function createMockInstallation(domain: string, version: string, binaries: string[]) {
    // Create bin directory and binaries
    const binDir = path.join(tempDir, 'bin')
    fs.mkdirSync(binDir, { recursive: true })

    for (const binary of binaries) {
      const binaryPath = path.join(binDir, binary)
      fs.writeFileSync(binaryPath, `#!/bin/bash\necho "Mock ${binary} from ${domain} v${version}"\n`)
      fs.chmodSync(binaryPath, 0o755)
    }

    // Create package metadata
    const pkgDir = path.join(tempDir, 'pkgs', domain, `v${version}`)
    fs.mkdirSync(pkgDir, { recursive: true })

    const metadata = {
      domain,
      version,
      installedAt: new Date().toISOString(),
      binaries,
      installPath: binDir,
    }

    fs.writeFileSync(
      path.join(pkgDir, 'metadata.json'),
      JSON.stringify(metadata, null, 2),
    )
  }

  test('clean command should remove both metadata and binaries installed by launchpad', async () => {
    // Create mock installations
    createMockInstallation('nodejs.org', '20.0.0', ['node', 'npm', 'npx'])
    createMockInstallation('python.org', '3.11.0', ['python', 'pip'])

    // Create a non-Launchpad binary that should NOT be removed
    const binDir = path.join(tempDir, 'bin')
    const systemBinary = path.join(binDir, 'system-tool')
    fs.writeFileSync(systemBinary, '#!/bin/bash\necho "System tool"\n')
    fs.chmodSync(systemBinary, 0o755)

    // Verify initial state
    expect(binaryExists('node')).toBe(true)
    expect(binaryExists('npm')).toBe(true)
    expect(binaryExists('npx')).toBe(true)
    expect(binaryExists('python')).toBe(true)
    expect(binaryExists('pip')).toBe(true)
    expect(binaryExists('system-tool')).toBe(true)
    expect(packageMetadataExists('nodejs.org', '20.0.0')).toBe(true)
    expect(packageMetadataExists('python.org', '3.11.0')).toBe(true)

    // Run clean command with --force flag
    const { spawn } = Bun
    const proc = spawn(['bun', 'run', cliPath, 'clean', '--force'], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, LAUNCHPAD_PREFIX: tempDir },
    })

    const timeoutPromise = new Promise((_, reject) => {
      setTimeout(() => reject(new Error('Clean command timed out after 10 seconds')), 10000)
    })

    const [output, stderr, exitCode] = await Promise.race([
      Promise.all([
        new Response(proc.stdout).text(),
        new Response(proc.stderr).text(),
        proc.exited,
      ]),
      timeoutPromise,
    ]) as [string, string, number]

    console.log('Clean stdout:', output)
    console.log('Clean stderr:', stderr)
    console.log('Clean exit code:', exitCode)

    if (exitCode !== 0) {
      throw new Error(`Clean command failed with exit code ${exitCode}. Stdout: ${output}. Stderr: ${stderr}`)
    }

    // Verify cleanup results
    expect(exitCode).toBe(0)

    // Launchpad-managed binaries should be removed
    expect(binaryExists('node')).toBe(false)
    expect(binaryExists('npm')).toBe(false)
    expect(binaryExists('npx')).toBe(false)
    expect(binaryExists('python')).toBe(false)
    expect(binaryExists('pip')).toBe(false)

    // Non-Launchpad binary should remain
    expect(binaryExists('system-tool')).toBe(true)

    // Package metadata should be removed
    expect(packageMetadataExists('nodejs.org', '20.0.0')).toBe(false)
    expect(packageMetadataExists('python.org', '3.11.0')).toBe(false)

    // pkgs directory should be removed entirely
    expect(fs.existsSync(path.join(tempDir, 'pkgs'))).toBe(false)
  })

  test('clean command should work correctly when no packages are installed', async () => {
    // Create bin directory with only non-Launchpad tools
    const binDir = path.join(tempDir, 'bin')
    fs.mkdirSync(binDir, { recursive: true })

    const systemTools = ['system-tool-1', 'system-tool-2']
    for (const tool of systemTools) {
      const toolPath = path.join(binDir, tool)
      fs.writeFileSync(toolPath, '#!/bin/bash\necho "System tool"\n')
      fs.chmodSync(toolPath, 0o755)
    }

    // Create empty pkgs directory
    fs.mkdirSync(path.join(tempDir, 'pkgs'), { recursive: true })

    // Run clean command
    const { spawn } = Bun
    const proc = spawn(['bun', 'run', cliPath, 'clean', '--force'], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, LAUNCHPAD_PREFIX: tempDir },
    })

    const [output, stderr, exitCode] = await Promise.race([
      Promise.all([
        new Response(proc.stdout).text(),
        new Response(proc.stderr).text(),
        proc.exited,
      ]),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 10000),
      ),
    ]) as [string, string, number]

    console.log('Clean (empty) stdout:', output)
    console.log('Clean (empty) stderr:', stderr)

    // Should succeed even with no Launchpad packages
    expect(exitCode).toBe(0)

    // System tools should remain untouched
    for (const tool of systemTools) {
      expect(fs.existsSync(path.join(binDir, tool))).toBe(true)
    }

    // pkgs directory should be removed (even if empty)
    expect(fs.existsSync(path.join(tempDir, 'pkgs'))).toBe(false)
  })

  test('clean dry-run should show what would be removed without actually removing', async () => {
    // Create mock installations
    createMockInstallation('nodejs.org', '20.0.0', ['node', 'npm'])
    createMockInstallation('bun.sh', '1.2.0', ['bun'])

    // Verify initial state
    expect(binaryExists('node')).toBe(true)
    expect(binaryExists('npm')).toBe(true)
    expect(binaryExists('bun')).toBe(true)
    expect(packageMetadataExists('nodejs.org', '20.0.0')).toBe(true)
    expect(packageMetadataExists('bun.sh', '1.2.0')).toBe(true)

    // Run clean command with --dry-run flag
    const { spawn } = Bun
    const proc = spawn(['bun', 'run', cliPath, 'clean', '--dry-run'], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, LAUNCHPAD_PREFIX: tempDir },
    })

    const [output, stderr, exitCode] = await Promise.race([
      Promise.all([
        new Response(proc.stdout).text(),
        new Response(proc.stderr).text(),
        proc.exited,
      ]),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 10000),
      ),
    ]) as [string, string, number]

    console.log('Clean dry-run stdout:', output)
    console.log('Clean dry-run stderr:', stderr)

    expect(exitCode).toBe(0)

    // Output should mention what would be removed
    expect(output.includes('Would remove') || output.includes('would')).toBe(true)

    // Nothing should actually be removed
    expect(binaryExists('node')).toBe(true)
    expect(binaryExists('npm')).toBe(true)
    expect(binaryExists('bun')).toBe(true)
    expect(packageMetadataExists('nodejs.org', '20.0.0')).toBe(true)
    expect(packageMetadataExists('bun.sh', '1.2.0')).toBe(true)
  })

  test('clean should handle missing binaries gracefully', async () => {
    // Create mock installation
    createMockInstallation('nodejs.org', '20.0.0', ['node', 'npm', 'npx'])

    // Manually remove one binary to simulate partial cleanup
    fs.unlinkSync(path.join(tempDir, 'bin', 'npm'))

    // Verify initial state
    expect(binaryExists('node')).toBe(true)
    expect(binaryExists('npm')).toBe(false) // Already removed
    expect(binaryExists('npx')).toBe(true)
    expect(packageMetadataExists('nodejs.org', '20.0.0')).toBe(true)

    // Run clean command
    const { spawn } = Bun
    const proc = spawn(['bun', 'run', cliPath, 'clean', '--force'], {
      cwd: process.cwd(),
      stdio: ['ignore', 'pipe', 'pipe'],
      env: { ...process.env, LAUNCHPAD_PREFIX: tempDir },
    })

    const [output, stderr, exitCode] = await Promise.race([
      Promise.all([
        new Response(proc.stdout).text(),
        new Response(proc.stderr).text(),
        proc.exited,
      ]),
      new Promise((_, reject) =>
        setTimeout(() => reject(new Error('Timeout')), 10000),
      ),
    ]) as [string, string, number]

    console.log('Clean (missing binary) stdout:', output)
    console.log('Clean (missing binary) stderr:', stderr)

    // Should succeed even with missing binaries
    expect(exitCode).toBe(0)

    // All remaining binaries should be removed
    expect(binaryExists('node')).toBe(false)
    expect(binaryExists('npm')).toBe(false) // Was already gone
    expect(binaryExists('npx')).toBe(false)

    // Package metadata should be removed
    expect(packageMetadataExists('nodejs.org', '20.0.0')).toBe(false)
  })
})
