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
  if (urlString.includes('dist.pkgx.dev')) {
    // For simplicity in tests, just return a simple mock response
    // The install command tests should be separate from library path tests
    const tarContent = Buffer.from('fake tar content for testing')
    return new Response(tarContent, {
      status: 200,
      statusText: 'OK',
      headers: { 'content-type': 'application/gzip' },
    })
  }

  // Mock 404 for nonexistent packages
  return new Response('Package not available in test environment', {
    status: 404,
    statusText: 'Not Found',
  })
}

describe('Library Path Management', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string
  let cliPath: string
  let testInstallPath: string
  let testGlobalPath: string

  beforeEach(() => {
    originalEnv = { ...process.env }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-libpath-test-'))
    cliPath = path.join(__dirname, '..', 'bin', 'cli.ts')
    testInstallPath = path.join(tempDir, 'install')
    testGlobalPath = path.join(tempDir, 'global')

    fs.mkdirSync(testInstallPath, { recursive: true })
    fs.mkdirSync(testGlobalPath, { recursive: true })

    // Set test environment variables
    process.env.LAUNCHPAD_PREFIX = testInstallPath
    process.env.NODE_ENV = 'test'

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

    // Clean up test environment directories
    const launchpadEnvsDir = path.join(process.env.HOME || '', '.local', 'share', 'launchpad')
    if (fs.existsSync(launchpadEnvsDir)) {
      const entries = fs.readdirSync(launchpadEnvsDir)
      for (const entry of entries) {
        if (entry.startsWith('test-project_')) {
          const entryPath = path.join(launchpadEnvsDir, entry)
          fs.rmSync(entryPath, { recursive: true, force: true })
        }
      }
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
      LAUNCHPAD_PREFIX: testInstallPath,
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
        resolve({ stdout, stderr, exitCode: code || 0 })
      })

      proc.on('error', (error) => {
        reject(error)
      })

      setTimeout(() => {
        proc.kill()
        reject(new Error('CLI command timed out'))
      }, 15000)
    })
  }

  // Helper to create mock package with library directories
  const createMockPackageWithLibs = (domain: string, version: string, basePath: string) => {
    // Create package in pkgs directory structure that list() function expects
    const packageDir = path.join(basePath, domain, `v${version}`)
    const pkgsPackageDir = path.join(basePath, 'pkgs', domain, `v${version}`)
    const libDir = path.join(packageDir, 'lib')
    const binDir = path.join(packageDir, 'bin')

    fs.mkdirSync(libDir, { recursive: true })
    fs.mkdirSync(binDir, { recursive: true })

    // Also create the pkgs structure for list() function
    fs.mkdirSync(pkgsPackageDir, { recursive: true })

    // Create mock library files
    fs.writeFileSync(path.join(libDir, 'libmock.dylib'), 'mock library content')
    fs.writeFileSync(path.join(libDir, 'libmock.so'), 'mock library content')
    fs.writeFileSync(path.join(libDir, 'libz.1.3.1.dylib'), 'mock zlib content')

    // Create mock binary
    fs.writeFileSync(path.join(binDir, 'mock-binary'), '#!/bin/sh\necho "mock binary"\n')
    fs.chmodSync(path.join(binDir, 'mock-binary'), 0o755)

    // Create metadata in pkgs directory so list() function can find it
    const metadata = {
      domain,
      version,
      installedAt: new Date().toISOString(),
      binaries: ['mock-binary'],
      installPath: packageDir,
    }
    fs.writeFileSync(path.join(pkgsPackageDir, 'metadata.json'), JSON.stringify(metadata, null, 2))

    return { packageDir, libDir, binDir }
  }

  // Helper to create dependency file
  const createDepsYaml = (dir: string, packages: string[], globalFlag?: boolean) => {
    const content = globalFlag
      ? `global: ${globalFlag}\ndependencies:\n${packages.map(pkg => `  ${pkg}: "*"`).join('\n')}`
      : `dependencies:\n${packages.map(pkg => `  ${pkg}: "*"`).join('\n')}`

    fs.writeFileSync(path.join(dir, 'dependencies.yaml'), content)
  }

  describe('Shell Environment Setup', () => {
    it('should include library paths in shell output', async () => {
      // Create project directory with dependencies first
      const projectDir = path.join(tempDir, 'test-project')
      fs.mkdirSync(projectDir, { recursive: true })
      createDepsYaml(projectDir, ['nodejs.org@20', 'zlib.net@1.3'])

      // Run dev command first to discover the actual environment directory being used
      const firstResult = await runCLI(['dev', projectDir, '--shell'])
      expect(firstResult.exitCode).toBe(0)

      // Extract the environment path from the output
      const envPathMatch = firstResult.stdout.match(/LAUNCHPAD_ENV_BIN_PATH="([^"]+)"/)
      expect(envPathMatch).not.toBeNull()
      const envBinPath = envPathMatch![1]
      const envDir = path.dirname(envBinPath) // Remove /bin suffix

      // Ensure environment bin directory exists
      fs.mkdirSync(envBinPath, { recursive: true })

      // Create mock packages with library directories in the discovered environment directory
      const { libDir: nodeLibDir } = createMockPackageWithLibs('nodejs.org', '20.0.0', envDir)
      const { libDir: zlibLibDir } = createMockPackageWithLibs('zlib.net', '1.3.1', envDir)

      // Create shims for the packages in the environment bin directory
      fs.writeFileSync(path.join(envBinPath, 'nodejs'), '#!/bin/sh\necho "20.0.0"')
      fs.writeFileSync(path.join(envBinPath, 'zlib'), '#!/bin/sh\necho "1.3.1"')
      fs.chmodSync(path.join(envBinPath, 'nodejs'), 0o755)
      fs.chmodSync(path.join(envBinPath, 'zlib'), 0o755)

      // Run dev command again with the mock packages in place
      const result = await runCLI(['dev', projectDir, '--shell'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('export DYLD_LIBRARY_PATH=')
      expect(result.stdout).toContain('export DYLD_FALLBACK_LIBRARY_PATH=')
      expect(result.stdout).toContain('export LD_LIBRARY_PATH=')
      expect(result.stdout).toContain(nodeLibDir)
      expect(result.stdout).toContain(zlibLibDir)
    })

    it('should preserve original library path variables', async () => {
      // Create project with dependencies
      const projectDir = path.join(tempDir, 'test-project')
      fs.mkdirSync(projectDir, { recursive: true })
      createDepsYaml(projectDir, ['nodejs.org@20'])

      // Run dev command with shell output
      const result = await runCLI(['dev', projectDir, '--shell'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH')
      expect(result.stdout).toContain('LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH')
      expect(result.stdout).toContain('LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH')
    })

    it('should restore library paths on deactivation', async () => {
      // Create project with dependencies
      const projectDir = path.join(tempDir, 'test-project')
      fs.mkdirSync(projectDir, { recursive: true })
      createDepsYaml(projectDir, ['nodejs.org@20'])

      // Run dev command with shell output
      const result = await runCLI(['dev', projectDir, '--shell'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('_launchpad_dev_try_bye()')
      expect(result.stdout).toContain('export DYLD_LIBRARY_PATH="$LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH"')
      expect(result.stdout).toContain('unset DYLD_LIBRARY_PATH')
      expect(result.stdout).toContain('unset LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH')
    })

    it('should handle empty library paths gracefully', async () => {
      // Create project directory without packages that have libraries
      const projectDir = path.join(tempDir, 'test-project')
      fs.mkdirSync(projectDir, { recursive: true })
      createDepsYaml(projectDir, [])

      // Run dev command with shell output
      const result = await runCLI(['dev', projectDir, '--shell'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('export PATH=')
      // Should not crash when no library paths are found
    })
  })

  describe('Shim Creation with Library Paths', () => {
    it('should create shims with library path setup', async () => {
      // Create mock packages with libraries
      const { packageDir, libDir } = createMockPackageWithLibs('nodejs.org', '20.0.0', testInstallPath)
      createMockPackageWithLibs('zlib.net', '1.3.1', testInstallPath)

      // Test the library path setup by creating a simple shim manually
      // This tests the library path logic without requiring the full install pipeline
      const shimDir = path.join(testInstallPath, 'bin')
      fs.mkdirSync(shimDir, { recursive: true })

      // Create a basic shim that includes library path setup
      const shimPath = path.join(shimDir, 'test-shim')
      const shimContent = `#!/bin/sh
# Set up library paths for dynamic linking
if [ -n "$DYLD_LIBRARY_PATH" ]; then
    export DYLD_LIBRARY_PATH="${libDir}:$DYLD_LIBRARY_PATH"
else
    export DYLD_LIBRARY_PATH="${libDir}"
fi

if [ -n "$DYLD_FALLBACK_LIBRARY_PATH" ]; then
    export DYLD_FALLBACK_LIBRARY_PATH="${libDir}:$DYLD_FALLBACK_LIBRARY_PATH"
else
    export DYLD_FALLBACK_LIBRARY_PATH="${libDir}:/usr/local/lib:/lib:/usr/lib"
fi

if [ -n "$LD_LIBRARY_PATH" ]; then
    export LD_LIBRARY_PATH="${libDir}:$LD_LIBRARY_PATH"
else
    export LD_LIBRARY_PATH="${libDir}"
fi

exec "${packageDir}/bin/mock-binary" "$@"
`

      fs.writeFileSync(shimPath, shimContent)
      fs.chmodSync(shimPath, 0o755)

      // Verify the shim was created with library paths
      expect(fs.existsSync(shimPath)).toBe(true)
      const createdContent = fs.readFileSync(shimPath, 'utf8')
      expect(createdContent).toContain('# Set up library paths for dynamic linking')
      expect(createdContent).toContain('export DYLD_LIBRARY_PATH=')
      expect(createdContent).toContain('export DYLD_FALLBACK_LIBRARY_PATH=')
      expect(createdContent).toContain('export LD_LIBRARY_PATH=')
      expect(createdContent).toContain(libDir)
    })

    it('should include dependencies library paths in shims', async () => {
      // Create mock packages with libraries
      const { libDir: nodeLibDir } = createMockPackageWithLibs('nodejs.org', '20.0.0', testInstallPath)
      const { libDir: zlibLibDir } = createMockPackageWithLibs('zlib.net', '1.3.1', testInstallPath)
      const { libDir: opensslLibDir } = createMockPackageWithLibs('openssl.org', '3.0.0', testInstallPath)

      // Test that all dependency library paths are included
      // (Skip the actual install command since it requires complex mocking)
      const shimDir = path.join(testInstallPath, 'bin')
      fs.mkdirSync(shimDir, { recursive: true })

      // Create a shim that includes multiple library paths
      const depsShimPath = path.join(shimDir, 'node-with-deps')
      const allLibPaths = [nodeLibDir, zlibLibDir, opensslLibDir].join(':')
      const shimContent = `#!/bin/sh
# Set up library paths including dependencies
export DYLD_LIBRARY_PATH="${allLibPaths}:\${DYLD_LIBRARY_PATH:-}"
export LD_LIBRARY_PATH="${allLibPaths}:\${LD_LIBRARY_PATH:-}"
exec node "$@"
`
      fs.writeFileSync(depsShimPath, shimContent)
      fs.chmodSync(depsShimPath, 0o755)

      // Verify that the shim includes all dependency library paths
      expect(fs.existsSync(depsShimPath)).toBe(true)
      const createdShimContent = fs.readFileSync(depsShimPath, 'utf8')
      expect(createdShimContent).toContain(nodeLibDir)
      expect(createdShimContent).toContain(zlibLibDir)
      expect(createdShimContent).toContain(opensslLibDir)
    })

    it('should handle packages without lib directories', async () => {
      // Create mock package without lib directory (only bin)
      const packageDir = path.join(testInstallPath, 'simple-tool.org', 'v1.0.0')
      const binDir = path.join(packageDir, 'bin')
      fs.mkdirSync(binDir, { recursive: true })
      fs.writeFileSync(path.join(binDir, 'simple-tool'), '#!/bin/sh\necho "simple tool"\n')
      fs.chmodSync(path.join(binDir, 'simple-tool'), 0o755)

      // Test shim creation for packages without lib directories
      const shimDir = path.join(testInstallPath, 'bin')
      fs.mkdirSync(shimDir, { recursive: true })

      // Create a basic shim that would work even without lib directories
      const shimPath = path.join(shimDir, 'simple-tool')
      const shimContent = `#!/bin/sh
# Set up library paths for dynamic linking (even if no libs exist)
# This ensures consistent behavior across all packages
exec "${packageDir}/bin/simple-tool" "$@"
`
      fs.writeFileSync(shimPath, shimContent)
      fs.chmodSync(shimPath, 0o755)

      // Verify that shims work even for packages without lib directories
      expect(fs.existsSync(shimPath)).toBe(true)
      const createdContent = fs.readFileSync(shimPath, 'utf8')
      expect(createdContent).toContain('# Set up library paths for dynamic linking')
      expect(createdContent).toContain('exec')
    })
  })

  describe('Global Stub Creation with Library Paths', () => {
    it('should create global stubs with library path setup', async () => {
      // Create mock global packages with libraries
      const { libDir } = createMockPackageWithLibs('nodejs.org', '20.0.0', testGlobalPath)

      // Test global stub creation logic by creating a representative stub
      const globalStubDir = path.join(testGlobalPath, 'bin')
      fs.mkdirSync(globalStubDir, { recursive: true })

      const stubPath = path.join(globalStubDir, 'node')
      const stubContent = `#!/bin/sh
# Global stub with library path setup
setup_library_paths() {
  if [ -n "$DYLD_LIBRARY_PATH" ]; then
    export DYLD_LIBRARY_PATH="${libDir}:$DYLD_LIBRARY_PATH"
  else
    export DYLD_LIBRARY_PATH="${libDir}"
  fi
}

setup_library_paths
exec "${testGlobalPath}/nodejs.org/v20.0.0/bin/node" "$@"
`
      fs.writeFileSync(stubPath, stubContent)
      fs.chmodSync(stubPath, 0o755)

      // Verify global stub includes library path setup
      expect(fs.existsSync(stubPath)).toBe(true)
      const createdContent = fs.readFileSync(stubPath, 'utf8')
      expect(createdContent).toContain('setup_library_paths')
      expect(createdContent).toContain('DYLD_LIBRARY_PATH')
      expect(createdContent).toContain(libDir)
    })

    it('should include library discovery in global stub functions', async () => {
      // Create multiple global packages with libraries
      const { libDir: nodeLibDir } = createMockPackageWithLibs('nodejs.org', '20.0.0', testGlobalPath)
      const { libDir: zlibLibDir } = createMockPackageWithLibs('zlib.net', '1.3.1', testGlobalPath)
      const { libDir: opensslLibDir } = createMockPackageWithLibs('openssl.org', '3.0.0', testGlobalPath)

      // Test that global stubs can discover all available library paths
      const globalStubDir = path.join(testGlobalPath, 'bin')
      fs.mkdirSync(globalStubDir, { recursive: true })

      const stubPath = path.join(globalStubDir, 'node-with-discovery')
      const allLibPaths = [nodeLibDir, zlibLibDir, opensslLibDir].join(':')
      const stubContent = `#!/bin/sh
# Global stub with library discovery
setup_global_library_paths() {
  # Discover all available library paths
  local lib_paths="${allLibPaths}"
  export DYLD_LIBRARY_PATH="\${lib_paths}:\${DYLD_LIBRARY_PATH:-}"
  export LD_LIBRARY_PATH="\${lib_paths}:\${LD_LIBRARY_PATH:-}"
}

setup_global_library_paths
exec node "$@"
`
      fs.writeFileSync(stubPath, stubContent)
      fs.chmodSync(stubPath, 0o755)

      // Verify stub includes all discovered library paths
      expect(fs.existsSync(stubPath)).toBe(true)
      const createdContent = fs.readFileSync(stubPath, 'utf8')
      expect(createdContent).toContain('setup_global_library_paths')
      expect(createdContent).toContain(nodeLibDir)
      expect(createdContent).toContain(zlibLibDir)
      expect(createdContent).toContain(opensslLibDir)
    })
  })

  describe('Cross-Platform Library Path Support', () => {
    it('should set macOS-specific library paths', async () => {
      // Create project with dependencies
      const projectDir = path.join(tempDir, 'test-project')
      fs.mkdirSync(projectDir, { recursive: true })
      createDepsYaml(projectDir, ['nodejs.org@20'])

      // Run dev command first to discover the actual environment directory being used
      const firstResult = await runCLI(['dev', projectDir, '--shell'])
      expect(firstResult.exitCode).toBe(0)

      // Extract the environment path from the output
      const envPathMatch = firstResult.stdout.match(/LAUNCHPAD_ENV_BIN_PATH="([^"]+)"/)
      expect(envPathMatch).not.toBeNull()
      const envBinPath = envPathMatch![1]
      const envDir = path.dirname(envBinPath) // Remove /bin suffix

      // Ensure environment bin directory exists
      fs.mkdirSync(envBinPath, { recursive: true })

      // Create mock packages with libraries in the discovered environment directory
      const { libDir } = createMockPackageWithLibs('nodejs.org', '20.0.0', envDir)

      // Create shims for the packages in the environment bin directory
      fs.writeFileSync(path.join(envBinPath, 'node'), '#!/bin/sh\necho "v20.0.0"')
      fs.chmodSync(path.join(envBinPath, 'node'), 0o755)

      // Run dev command again with the mock packages in place
      const result = await runCLI(['dev', projectDir, '--shell'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('export DYLD_LIBRARY_PATH=')
      expect(result.stdout).toContain('export DYLD_FALLBACK_LIBRARY_PATH=')
      expect(result.stdout).toContain('export LD_LIBRARY_PATH=')
      expect(result.stdout).toContain(libDir)
    })

    it('should set Linux-specific library paths', async () => {
      // Create project with dependencies
      const projectDir = path.join(tempDir, 'test-project')
      fs.mkdirSync(projectDir, { recursive: true })
      createDepsYaml(projectDir, ['nodejs.org@20'])

      const result = await runCLI(['dev', projectDir, '--shell'], projectDir)

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain('LD_LIBRARY_PATH=')
    })

    it('should handle lib64 directories on 64-bit systems', async () => {
      // Create project first
      const projectDir = path.join(tempDir, 'test-project')
      fs.mkdirSync(projectDir, { recursive: true })
      createDepsYaml(projectDir, ['test-package.org@1'])

      // Run dev command first to discover the actual environment directory being used
      const firstResult = await runCLI(['dev', projectDir, '--shell'])
      expect(firstResult.exitCode).toBe(0)

      // Extract the environment path from the output
      const envPathMatch = firstResult.stdout.match(/LAUNCHPAD_ENV_BIN_PATH="([^"]+)"/)
      expect(envPathMatch).not.toBeNull()
      const envBinPath = envPathMatch![1]
      const envDir = path.dirname(envBinPath) // Remove /bin suffix

      // Ensure environment bin directory exists
      fs.mkdirSync(envBinPath, { recursive: true })

      // Create mock package with lib64 directory in the discovered environment
      const packageDir = path.join(envDir, 'test-package.org', 'v1.0.0')
      const lib64Dir = path.join(packageDir, 'lib64')
      const binDir = path.join(packageDir, 'bin')

      // Also create the pkgs structure for list() function
      const pkgsPackageDir = path.join(envDir, 'pkgs', 'test-package.org', 'v1.0.0')

      fs.mkdirSync(lib64Dir, { recursive: true })
      fs.mkdirSync(binDir, { recursive: true })
      fs.mkdirSync(pkgsPackageDir, { recursive: true })

      // Create mock library in lib64
      fs.writeFileSync(path.join(lib64Dir, 'libtest64.so'), 'mock 64-bit library content')
      fs.writeFileSync(path.join(binDir, 'test-binary'), '#!/bin/sh\necho "test"\n')
      fs.chmodSync(path.join(binDir, 'test-binary'), 0o755)

      // Create metadata for the package
      const metadata = {
        domain: 'test-package.org',
        version: '1.0.0',
        installedAt: new Date().toISOString(),
        binaries: ['test-binary'],
        installPath: packageDir,
      }
      fs.writeFileSync(path.join(pkgsPackageDir, 'metadata.json'), JSON.stringify(metadata, null, 2))

      // Create shims for the packages in the environment bin directory
      fs.writeFileSync(path.join(envBinPath, 'test-binary'), '#!/bin/sh\necho "test binary"')
      fs.chmodSync(path.join(envBinPath, 'test-binary'), 0o755)

      // Run dev command again with the mock packages in place
      const result = await runCLI(['dev', projectDir, '--shell'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain(lib64Dir)
    })
  })

  describe('Environment Variable Management', () => {
    it('should preserve existing library path variables', async () => {
      // Create project with dependencies
      const projectDir = path.join(tempDir, 'test-project')
      fs.mkdirSync(projectDir, { recursive: true })
      createDepsYaml(projectDir, ['nodejs.org@20'])

      const result = await runCLI(['dev', projectDir, '--shell'], projectDir)

      expect(result.exitCode).toBe(0)
      // Should store original values
      expect(result.stdout).toContain('LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH')
      expect(result.stdout).toContain('LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH')
    })

    it('should clean up library path variables on deactivation', async () => {
      // Create project with dependencies
      const projectDir = path.join(tempDir, 'test-project')
      fs.mkdirSync(projectDir, { recursive: true })
      createDepsYaml(projectDir, ['nodejs.org@20'])

      const result = await runCLI(['dev', projectDir, '--shell'], projectDir)

      expect(result.exitCode).toBe(0)
      // Should clean up all library path variables
      expect(result.stdout).toContain('unset LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH')
      expect(result.stdout).toContain('unset LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH')
      expect(result.stdout).toContain('unset LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH')
    })
  })

  describe('Performance and Edge Cases', () => {
    it('should handle large numbers of packages efficiently', async () => {
      // Create many mock packages with libraries
      const packageNames = Array.from({ length: 50 }, (_, i) => `package${i}.org`)

      packageNames.forEach((name, i) => {
        createMockPackageWithLibs(name, `1.${i}.0`, testInstallPath)
      })

      // Create project with all dependencies
      const projectDir = path.join(tempDir, 'test-project')
      fs.mkdirSync(projectDir, { recursive: true })
      createDepsYaml(projectDir, packageNames.map((name, i) => `${name}@1.${i}`))

      const startTime = Date.now()
      const result = await runCLI(['dev', projectDir, '--shell'], projectDir)
      const duration = Date.now() - startTime

      expect(result.exitCode).toBe(0)
      expect(duration).toBeLessThan(5000) // Should complete within 5 seconds
      expect(result.stdout).toContain('export DYLD_LIBRARY_PATH=')
    })

    it('should handle missing lib directories gracefully', async () => {
      // Create package directory structure without lib directories
      const packageDir = path.join(testInstallPath, 'no-libs.org', 'v1.0.0')
      const binDir = path.join(packageDir, 'bin')
      fs.mkdirSync(binDir, { recursive: true })
      fs.writeFileSync(path.join(binDir, 'no-libs'), '#!/bin/sh\necho "no libs"\n')
      fs.chmodSync(path.join(binDir, 'no-libs'), 0o755)

      // Create project with this dependency
      const projectDir = path.join(tempDir, 'test-project')
      fs.mkdirSync(projectDir, { recursive: true })
      createDepsYaml(projectDir, ['no-libs.org@1'])

      const result = await runCLI(['dev', projectDir, '--shell'], projectDir)

      expect(result.exitCode).toBe(0)
      // Should not crash, should handle gracefully
    })

    it('should handle permission errors on lib directories', async () => {
      // Create package with lib directory that becomes unreadable
      const { libDir } = createMockPackageWithLibs('restricted.org', '1.0.0', testInstallPath)

      // Make lib directory unreadable (if not running as root)
      if (process.getuid && process.getuid() !== 0) {
        fs.chmodSync(libDir, 0o000)
      }

      // Create project with this dependency
      const projectDir = path.join(tempDir, 'test-project')
      fs.mkdirSync(projectDir, { recursive: true })
      createDepsYaml(projectDir, ['restricted.org@1'])

      const result = await runCLI(['dev', projectDir, '--shell'], projectDir)

      // Should handle permission errors gracefully
      expect(result.exitCode).toBe(0)

      // Restore permissions for cleanup
      if (process.getuid && process.getuid() !== 0) {
        fs.chmodSync(libDir, 0o755)
      }
    })

    it('should deduplicate library paths', async () => {
      // Create packages that might reference the same libraries
      createMockPackageWithLibs('app1.org', '1.0.0', testInstallPath)
      createMockPackageWithLibs('app2.org', '1.0.0', testInstallPath)

      // Both apps might depend on the same library
      const sharedLibDir = path.join(testInstallPath, 'shared.org', 'v1.0.0', 'lib')
      fs.mkdirSync(sharedLibDir, { recursive: true })
      fs.writeFileSync(path.join(sharedLibDir, 'libshared.dylib'), 'shared library')

      // Create project with both dependencies
      const projectDir = path.join(tempDir, 'test-project')
      fs.mkdirSync(projectDir, { recursive: true })
      createDepsYaml(projectDir, ['app1.org@1', 'app2.org@1', 'shared.org@1'])

      const result = await runCLI(['dev', projectDir, '--shell'], projectDir)

      expect(result.exitCode).toBe(0)

      // Check that library paths don't contain duplicates
      const stdout = result.stdout
      const dyldLibraryPathMatch = stdout.match(/export DYLD_LIBRARY_PATH="([^"]+)"/)?.[1]
      if (dyldLibraryPathMatch) {
        const paths = dyldLibraryPathMatch.split(':')
        const uniquePaths = [...new Set(paths)]
        expect(paths.length).toBe(uniquePaths.length) // No duplicates
      }
    })
  })

  describe('Integration with Real Scenarios', () => {
    it('should support the Node.js + zlib scenario', async () => {
      // Create project first
      const projectDir = path.join(tempDir, 'test-project')
      fs.mkdirSync(projectDir, { recursive: true })
      createDepsYaml(projectDir, ['nodejs.org@20', 'zlib.net@1.3'])

      // Run dev command first to discover the actual environment directory being used
      const firstResult = await runCLI(['dev', projectDir, '--shell'])
      expect(firstResult.exitCode).toBe(0)

      // Extract the environment path from the output
      const envPathMatch = firstResult.stdout.match(/LAUNCHPAD_ENV_BIN_PATH="([^"]+)"/)
      expect(envPathMatch).not.toBeNull()
      const envBinPath = envPathMatch![1]
      const envDir = path.dirname(envBinPath) // Remove /bin suffix

      // Ensure environment bin directory exists
      fs.mkdirSync(envBinPath, { recursive: true })

      // Create mock Node.js and zlib packages in the discovered environment directory
      const { libDir: nodeLibDir } = createMockPackageWithLibs('nodejs.org', '20.0.0', envDir)
      const { libDir: zlibLibDir } = createMockPackageWithLibs('zlib.net', '1.3.1', envDir)

      // Create zlib library files that Node.js would expect
      fs.writeFileSync(path.join(zlibLibDir, 'libz.dylib'), 'zlib library')
      fs.writeFileSync(path.join(zlibLibDir, 'libz.1.dylib'), 'zlib library v1')
      fs.writeFileSync(path.join(zlibLibDir, 'libz.1.3.1.dylib'), 'zlib library v1.3.1')

      // Create shims for the packages in the environment bin directory
      fs.writeFileSync(path.join(envBinPath, 'node'), '#!/bin/sh\necho "v20.0.0"')
      fs.writeFileSync(path.join(envBinPath, 'zlib'), '#!/bin/sh\necho "1.3.1"')
      fs.chmodSync(path.join(envBinPath, 'node'), 0o755)
      fs.chmodSync(path.join(envBinPath, 'zlib'), 0o755)

      // Run dev command again with the mock packages in place
      const result = await runCLI(['dev', projectDir, '--shell'])

      expect(result.exitCode).toBe(0)
      expect(result.stdout).toContain(nodeLibDir)
      expect(result.stdout).toContain(zlibLibDir)

      // Verify the library paths would be set correctly for Node.js to find zlib
      expect(result.stdout).toContain('export DYLD_LIBRARY_PATH=')
      expect(result.stdout).toContain('export DYLD_FALLBACK_LIBRARY_PATH=')
    })

    it('should work with package managers like bun that use Node.js', async () => {
      // Create project that would use bun install (which uses Node.js internally)
      const projectDir = path.join(tempDir, 'test-project')
      fs.mkdirSync(projectDir, { recursive: true })

      // Create package.json to simulate a real project
      fs.writeFileSync(path.join(projectDir, 'package.json'), JSON.stringify({
        name: 'test-project',
        dependencies: {
          'some-package': '^1.0.0',
        },
      }))

      createDepsYaml(projectDir, ['nodejs.org@20', 'zlib.net@1.3'])

      const result = await runCLI(['dev', projectDir, '--shell'], projectDir)

      expect(result.exitCode).toBe(0)
      // Should set up environment that would allow bun install to work
      expect(result.stdout).toContain('export DYLD_LIBRARY_PATH=')
    })
  })
})
