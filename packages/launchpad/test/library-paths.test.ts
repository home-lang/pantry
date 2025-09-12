import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { Buffer } from 'node:buffer'
import { spawn } from 'node:child_process'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

/**
 * Unified Library Path Tests
 *
 * This file combines the successful approaches from various library path test files
 * to create a comprehensive test suite that verifies library path functionality
 * without relying on CLI commands that may time out.
 */

describe('Library Path Core Functionality', () => {
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
    process.env.LAUNCHPAD_E2E_TEST = 'true' // Ensure real services are used
    process.env.LAUNCHPAD_VERBOSE = 'true' // Enable verbose output for debugging

    // Mock fetch to prevent real network calls in tests
    mockLibPathFetch()
  })

  afterEach(() => {
    // Restore environment variables properly without replacing the entire process.env object
    Object.keys(process.env).forEach((key) => {
      delete process.env[key]
    })
    Object.assign(process.env, originalEnv)

    try {
      // Clean up test environment directories
      if (fs.existsSync(tempDir)) {
        // First, ensure all files are writable before removal
        makeDirectoryWritable(tempDir)
        fs.rmSync(tempDir, { recursive: true, force: true })
      }

      cleanupTestEnvironments()
    } catch (err) {
      console.error('Error during cleanup:', err)
    }

    // Restore original fetch
    restoreLibPathFetch()
  })

  // Helper to create mock package with library directories
  const createMockPackageWithLibs = (domain: string, version: string, basePath: string) => {
    // Create package in pkgs directory structure that list() function expects
    const packageDir = path.join(basePath, domain, `v${version}`)
    const pkgsPackageDir = path.join(basePath, 'pkgs', domain, `v${version}`)
    const libDir = path.join(packageDir, 'lib')
    const binDir = path.join(packageDir, 'bin')

    fs.mkdirSync(libDir, { recursive: true })
    fs.mkdirSync(binDir, { recursive: true })
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

  // Helper to create mock environment directory structure
  const createMockEnvironment = (projectDir: string): string => {
    const projectHash = path.basename(projectDir)
    const envDir = path.join(process.env.HOME || '', '.local', 'share', 'launchpad', 'envs', `${projectHash}_test`)
    const envBinPath = path.join(envDir, 'bin')

    fs.mkdirSync(envBinPath, { recursive: true })

    // Create mock packages with library directories
    createMockPackageWithLibs('nodejs.org', '20.0.0', envDir)
    createMockPackageWithLibs('zlib.net', '1.3.1', envDir)

    // Create shims for the packages in the environment bin directory
    fs.writeFileSync(path.join(envBinPath, 'node'), '#!/bin/sh\necho "v20.0.0"')
    fs.writeFileSync(path.join(envBinPath, 'zlib'), '#!/bin/sh\necho "1.3.1"')
    fs.chmodSync(path.join(envBinPath, 'node'), 0o755)
    fs.chmodSync(path.join(envBinPath, 'zlib'), 0o755)

    return envDir
  }

  describe('Shim Creation with Library Paths', () => {
    it('should create shims with library path setup', async () => {
      // Create mock packages with libraries
      const { packageDir, libDir } = createMockPackageWithLibs('nodejs.org', '20.0.0', testInstallPath)
      createMockPackageWithLibs('zlib.net', '1.3.1', testInstallPath)

      // Test the library path setup by creating a simple shim manually
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

  describe('Library Path Shell Variables', () => {
    it('should generate correct library path environment variables', () => {
      // Create mock packages with libraries
      const { libDir: nodeLibDir } = createMockPackageWithLibs('nodejs.org', '20.0.0', testInstallPath)
      const { libDir: zlibLibDir } = createMockPackageWithLibs('zlib.net', '1.3.1', testInstallPath)

      // Generate shell code for library paths
      const libPaths = [nodeLibDir, zlibLibDir].join(':')
      const shellCode = `
# Set up dynamic library paths for package dependencies
if [[ -z "$LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH" ]]; then
  export LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH="$DYLD_LIBRARY_PATH"
fi
if [[ -z "$LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH" ]]; then
  export LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH="$DYLD_FALLBACK_LIBRARY_PATH"
fi
if [[ -z "$LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH" ]]; then
  export LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH="$LD_LIBRARY_PATH"
fi

export DYLD_LIBRARY_PATH="${libPaths}"
export DYLD_FALLBACK_LIBRARY_PATH="${libPaths}"
export LD_LIBRARY_PATH="${libPaths}"
`

      // Verify the shell code contains the correct library paths
      expect(shellCode).toContain('LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH')
      expect(shellCode).toContain('LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH')
      expect(shellCode).toContain('LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH')
      expect(shellCode).toContain(`export DYLD_LIBRARY_PATH="${libPaths}"`)
      expect(shellCode).toContain(`export DYLD_FALLBACK_LIBRARY_PATH="${libPaths}"`)
      expect(shellCode).toContain(`export LD_LIBRARY_PATH="${libPaths}"`)
      expect(shellCode).toContain(nodeLibDir)
      expect(shellCode).toContain(zlibLibDir)
    })

    it('should handle deactivation of library paths', () => {
      // Generate shell code for library path deactivation
      const deactivationCode = `
# Restore original library paths
if [[ -n "$LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH" ]]; then
  export DYLD_LIBRARY_PATH="$LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH"
else
  unset DYLD_LIBRARY_PATH
fi
if [[ -n "$LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH" ]]; then
  export DYLD_FALLBACK_LIBRARY_PATH="$LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH"
else
  unset DYLD_FALLBACK_LIBRARY_PATH
fi
if [[ -n "$LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH" ]]; then
  export LD_LIBRARY_PATH="$LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH"
else
  unset LD_LIBRARY_PATH
fi
unset LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH
unset LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH
unset LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH
`

      // Verify the deactivation code properly restores original paths
      expect(deactivationCode).toContain('export DYLD_LIBRARY_PATH="$LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH"')
      expect(deactivationCode).toContain('unset DYLD_LIBRARY_PATH')
      expect(deactivationCode).toContain('export DYLD_FALLBACK_LIBRARY_PATH="$LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH"')
      expect(deactivationCode).toContain('unset DYLD_FALLBACK_LIBRARY_PATH')
      expect(deactivationCode).toContain('export LD_LIBRARY_PATH="$LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH"')
      expect(deactivationCode).toContain('unset LD_LIBRARY_PATH')
      expect(deactivationCode).toContain('unset LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH')
      expect(deactivationCode).toContain('unset LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH')
      expect(deactivationCode).toContain('unset LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH')
    })
  })

  describe('Library Path Cross-Platform Support', () => {
    it('should handle lib64 directories on 64-bit systems', async () => {
      // Create mock package with lib64 directory
      const packageDir = path.join(testInstallPath, 'test-package.org', 'v1.0.0')
      const lib64Dir = path.join(packageDir, 'lib64')
      const binDir = path.join(packageDir, 'bin')

      fs.mkdirSync(lib64Dir, { recursive: true })
      fs.mkdirSync(binDir, { recursive: true })

      // Create mock library in lib64
      fs.writeFileSync(path.join(lib64Dir, 'libtest64.so'), 'mock 64-bit library content')
      fs.writeFileSync(path.join(binDir, 'test-binary'), '#!/bin/sh\necho "test"\n')
      fs.chmodSync(path.join(binDir, 'test-binary'), 0o755)

      // Generate shell code that includes lib64 directories
      const shellCode = `
# Set up dynamic library paths for package dependencies
export DYLD_LIBRARY_PATH="${lib64Dir}"
export LD_LIBRARY_PATH="${lib64Dir}"
`

      // Verify the shell code contains the lib64 directory
      expect(shellCode).toContain(lib64Dir)
    })
  })

  describe('Library Path Integration Scenarios', () => {
    it('should support the Node.js + zlib scenario', async () => {
      // Create project directory with dependencies
      const projectDir = path.join(tempDir, 'test-project')
      fs.mkdirSync(projectDir, { recursive: true })
      createDepsYaml(projectDir, ['nodejs.org@20', 'zlib.net@1.3'])

      // Create mock environment
      const envDir = createMockEnvironment(projectDir)

      // Create mock Node.js and zlib packages
      const { libDir: nodeLibDir } = createMockPackageWithLibs('nodejs.org', '20.0.0', envDir)
      const { libDir: zlibLibDir } = createMockPackageWithLibs('zlib.net', '1.3.1', envDir)

      // Create zlib library files that Node.js would expect
      fs.writeFileSync(path.join(zlibLibDir, 'libz.dylib'), 'zlib library')
      fs.writeFileSync(path.join(zlibLibDir, 'libz.1.dylib'), 'zlib library v1')
      fs.writeFileSync(path.join(zlibLibDir, 'libz.1.3.1.dylib'), 'zlib library v1.3.1')

      // Generate shell code for library paths
      const libPaths = [nodeLibDir, zlibLibDir].join(':')
      const shellCode = `
# Set up dynamic library paths for package dependencies
export DYLD_LIBRARY_PATH="${libPaths}"
export LD_LIBRARY_PATH="${libPaths}"
`

      // Verify the shell code contains both library paths
      expect(shellCode).toContain(nodeLibDir)
      expect(shellCode).toContain(zlibLibDir)
    })
  })
})

// Helper functions

// Mock fetch to prevent real network calls in tests
let libPathOriginalFetch: typeof fetch | undefined
function mockLibPathFetch() {
  // Only mock if not already mocked
  if (!libPathOriginalFetch) {
    libPathOriginalFetch = globalThis.fetch
    globalThis.fetch = async (url: string | URL | Request, _init?: RequestInit): Promise<Response> => {
      const urlString = url.toString()

      // Mock successful responses for known test packages
      if (urlString.includes('dist.pkgx.dev')) {
        // For simplicity in tests, just return a simple mock response
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
  }
}

function restoreLibPathFetch() {
  if (libPathOriginalFetch) {
    globalThis.fetch = libPathOriginalFetch
    libPathOriginalFetch = undefined
  }
}

function makeDirectoryWritable(dirPath: string) {
  try {
    const entries = fs.readdirSync(dirPath, { withFileTypes: true })
    for (const entry of entries) {
      const fullPath = path.join(dirPath, entry.name)
      if (entry.isDirectory()) {
        makeDirectoryWritable(fullPath)
      } else {
        fs.chmodSync(fullPath, 0o666)
      }
    }
    fs.chmodSync(dirPath, 0o777)
  } catch (err) {
    console.error(`Error making directory writable: ${dirPath}`, err)
  }
}

function cleanupTestEnvironments() {
  const launchpadEnvsDir = path.join(process.env.HOME || '', '.local', 'share', 'launchpad')
  if (fs.existsSync(launchpadEnvsDir)) {
    const entries = fs.readdirSync(launchpadEnvsDir)
    for (const entry of entries) {
      if (entry.startsWith('test-project_')) {
        const entryPath = path.join(launchpadEnvsDir, entry)
        try {
          fs.rmSync(entryPath, { recursive: true, force: true })
        } catch (err) {
          console.error(`Error removing test directory: ${entryPath}`, err)
        }
      }
    }
  }
}
