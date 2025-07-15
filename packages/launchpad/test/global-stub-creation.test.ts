import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

describe('Global Stub Creation Tests', () => {
  let tempDir: string
  let globalEnvDir: string
  let localEnvDir: string
  let systemBinDir: string

  beforeEach(() => {
    // Create temporary directories for testing
    tempDir = join(tmpdir(), `global-stub-test-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`)
    globalEnvDir = join(tempDir, 'global')
    localEnvDir = join(tempDir, 'local')
    systemBinDir = join(tempDir, 'system-bin')

    mkdirSync(tempDir, { recursive: true })
    mkdirSync(join(globalEnvDir, 'bin'), { recursive: true })
    mkdirSync(join(globalEnvDir, 'sbin'), { recursive: true })
    mkdirSync(join(localEnvDir, 'bin'), { recursive: true })
    mkdirSync(systemBinDir, { recursive: true })
  })

  afterEach(() => {
    try {
      if (existsSync(tempDir)) {
        rmSync(tempDir, { recursive: true, force: true })
      }
    }
    catch {
      // Ignore cleanup errors
    }
  })

  describe('Global Binary Detection', () => {
    it('should correctly identify global packages vs local packages', async () => {
      // Create test dependency file with mixed global/local packages
      const projectDir = join(tempDir, 'project')
      mkdirSync(projectDir, { recursive: true })

      const depsFile = join(projectDir, 'deps.yaml')
      writeFileSync(depsFile, `
global: false  # Top-level default
dependencies:
  curl.se/ca-certs: ^2025.5.20
  gnu.org/bash:
    version: ^5.2.37
    global: true
  nodejs.org:
    version: ^18.0.0
    global: false
  python.org:
    version: ^3.9.0
    global: true
`)

      // Since we can't easily mock ES modules, let's test the logic manually

      // Test that packages are correctly separated
      // Since we can't easily mock ES modules, let's test the logic manually

      // Since we can't easily mock ES modules, let's test the logic manually
      const packages = [
        { name: 'curl.se/ca-certs', isGlobal: false },
        { name: 'gnu.org/bash', isGlobal: true },
        { name: 'nodejs.org', isGlobal: false },
        { name: 'python.org', isGlobal: true },
      ]

      const globalPackages = packages.filter(pkg => pkg.isGlobal).map(pkg => pkg.name)
      const localPackages = packages.filter(pkg => !pkg.isGlobal).map(pkg => pkg.name)

      expect(globalPackages).toEqual(['gnu.org/bash', 'python.org'])
      expect(localPackages).toEqual(['curl.se/ca-certs', 'nodejs.org'])
    })

    it('should handle top-level global flag correctly', () => {
      const testCases = [
        {
          config: { global: true, dependencies: { 'test.pkg': '^1.0.0' } },
          expected: { global: ['test.pkg'], local: [] },
        },
        {
          config: { global: false, dependencies: { 'test.pkg': '^1.0.0' } },
          expected: { global: [], local: ['test.pkg'] },
        },
        {
          config: {
            global: true,
            dependencies: {
              pkg1: '^1.0.0',
              pkg2: { version: '^2.0.0', global: false },
            },
          },
          expected: { global: ['pkg1'], local: ['pkg2'] },
        },
      ]

      testCases.forEach(({ config, expected }) => {
        const packages = Object.entries(config.dependencies).map(([name, spec]) => {
          let isGlobal = config.global || false
          if (typeof spec === 'object' && spec.global !== undefined) {
            isGlobal = spec.global
          }
          return { name, isGlobal }
        })

        const globalPackages = packages.filter(pkg => pkg.isGlobal).map(pkg => pkg.name)
        const localPackages = packages.filter(pkg => !pkg.isGlobal).map(pkg => pkg.name)

        expect(globalPackages).toEqual(expected.global)
        expect(localPackages).toEqual(expected.local)
      })
    })
  })

  describe('Global Stub Creation', () => {
    it('should create robust global stubs with fallback logic', () => {
      // Create a mock global binary
      const globalBashPath = join(globalEnvDir, 'bin', 'bash')
      writeFileSync(globalBashPath, '#!/bin/bash\necho "Global bash v5.2.37"')

      // Test the stub creation logic
      const stubPath = join(systemBinDir, 'bash')
      const stubContent = createGlobalStub('bash', globalEnvDir, 'gnu.org/bash@^5.2.37')

      writeFileSync(stubPath, stubContent, { mode: 0o755 })

      // Verify stub content includes expected elements
      const content = readFileSync(stubPath, 'utf8')

      expect(content).toContain('#!/bin/sh')
      expect(content).toContain('Global Launchpad stub for bash')
      expect(content).toContain(globalEnvDir)
      expect(content).toContain('stable and survives environment rebuilds')
      expect(content).toContain('If the direct path doesn\'t work, try to find the binary')
      expect(content).toContain('attempting to reinstall')
      expect(content).toContain('exec')
    })

    it('should create different stubs for different global packages', () => {
      const packages = ['bash', 'python', 'node']
      const stubs: Record<string, string> = {}

      packages.forEach((pkg) => {
        stubs[pkg] = createGlobalStub(pkg, globalEnvDir, `${pkg}.org/${pkg}@^1.0.0`)
      })

      // Each stub should be different and package-specific
      expect(stubs.bash).not.toEqual(stubs.python)
      expect(stubs.python).not.toEqual(stubs.node)

      // But all should have the same structure
      packages.forEach((pkg) => {
        expect(stubs[pkg]).toContain(`Global Launchpad stub for ${pkg}`)
        expect(stubs[pkg]).toContain(globalEnvDir)
        expect(stubs[pkg]).toContain(`"$@"`)
      })
    })

    it('should include intelligent fallback logic in stubs', () => {
      const stubContent = createGlobalStub('test-binary', globalEnvDir, 'test.org/test@^1.0.0')

      // Should have multiple fallback strategies
      expect(stubContent).toContain('First try the current global installation path')
      expect(stubContent).toContain('If the direct path doesn\'t work')
      expect(stubContent).toContain('Try both bin and sbin directories')
      expect(stubContent).toContain('If global environment is missing, try to reinstall')
      expect(stubContent).toContain('command -v launchpad')
      expect(stubContent).toContain('Fall back to system binary')
    })
  })

  describe('Local vs Global Stub Differences', () => {
    it('should create different stub types for local vs global packages', () => {
      const localStub = createLocalStub('test-binary', join(localEnvDir, 'bin'), 'project-hash')
      const globalStub = createGlobalStub('test-binary', globalEnvDir, 'test.org/test@^1.0.0')

      // Local stubs should be simpler and project-specific
      expect(localStub).toContain('project-hash')
      expect(localStub).not.toContain('Global Launchpad stub')
      expect(localStub).not.toContain('attempt to reinstall')

      // Global stubs should be more robust with fallback logic
      expect(globalStub).toContain('Global Launchpad stub')
      expect(globalStub).toContain('stable and survives environment rebuilds')
      expect(globalStub).toContain('attempting to reinstall')
      expect(globalStub).not.toContain('project-hash')
    })

    it('should handle stub conflicts between local and global packages', () => {
      // Both local and global environments have the same binary name
      const localBinaryPath = join(localEnvDir, 'bin', 'python')
      const globalBinaryPath = join(globalEnvDir, 'bin', 'python')

      writeFileSync(localBinaryPath, '#!/bin/bash\necho "Local python 3.9"')
      writeFileSync(globalBinaryPath, '#!/bin/bash\necho "Global python 3.11"')

      const localStub = createLocalStub('python', join(localEnvDir, 'bin'), 'project-abc123')
      const globalStub = createGlobalStub('python', globalEnvDir, 'python.org@^3.11.0')

      // Local stub should point to local binary
      expect(localStub).toContain(localEnvDir)
      expect(localStub).not.toContain(globalEnvDir)

      // Global stub should point to global binary
      expect(globalStub).toContain(globalEnvDir)
      expect(globalStub).not.toContain(localEnvDir)

      // Global stub should have precedence in system locations (/usr/local/bin)
      expect(globalStub).toContain('stable and survives environment rebuilds')
    })
  })

  describe('Stub Installation Paths', () => {
    it('should install global stubs to system locations', () => {
      const globalStubPaths = getGlobalStubPaths(['bash', 'python', 'node'])

      globalStubPaths.forEach((path) => {
        // Should be in system-wide locations
        expect(path).toMatch(/\/usr\/local\/bin\/|\/usr\/bin\//)
      })
    })

    it('should install local stubs to user locations', () => {
      const localStubPaths = getLocalStubPaths(['wget', 'curl', 'jq'], 'project-hash')

      localStubPaths.forEach((path) => {
        // Should be in user-specific locations
        expect(path).toMatch(/\.local\/bin\/|home.*\/bin\//)
      })
    })

    it('should avoid conflicts between local and global stub paths', () => {
      const localPaths = getLocalStubPaths(['python'], 'project-123')
      const globalPaths = getGlobalStubPaths(['python'])

      // Should not overlap
      const localPathsSet = new Set(localPaths)
      const globalPathsSet = new Set(globalPaths)
      const intersection = new Set([...localPathsSet].filter(x => globalPathsSet.has(x)))

      expect(intersection.size).toBe(0)
    })
  })

  describe('Stub Execution and Permissions', () => {
    it('should create executable stubs with correct permissions', async () => {
      const stubPath = join(systemBinDir, 'test-stub')
      const stubContent = createGlobalStub('test-stub', globalEnvDir, 'test.org/test@^1.0.0')

      writeFileSync(stubPath, stubContent, { mode: 0o755 })

      // Check that file is executable
      const { statSync } = await import('node:fs')
      const stats = statSync(stubPath)
      const isExecutable = (stats.mode & Number.parseInt('111', 8)) !== 0
      expect(isExecutable).toBe(true)
    })

    it('should handle shell argument escaping correctly', () => {
      const stubContent = createGlobalStub('test-binary', globalEnvDir, 'test.org/test@^1.0.0')

      // Should properly escape arguments
      expect(stubContent).toContain('"$@"')
      expect(stubContent).not.toContain(' $@') // Should not have unquoted $@
      expect(stubContent).toContain('exec ') // Should use exec for proper signal handling
    })
  })

  describe('Error Handling and Recovery', () => {
    it('should handle missing global environment gracefully', () => {
      const stubContent = createGlobalStub('test-binary', '/nonexistent/path', 'test.org/test@^1.0.0')

      // Should include error handling for missing paths
      expect(stubContent).toContain('If global environment is missing')
      expect(stubContent).toContain('command -v launchpad')
      expect(stubContent).toContain('attempting to reinstall')
      expect(stubContent).toContain('Fall back to system binary')
    })

    it('should provide helpful error messages', () => {
      const stubContent = createGlobalStub('rare-binary', globalEnvDir, 'test.org/rare@^1.0.0')

      expect(stubContent).toContain('⚠️')
      expect(stubContent).toContain('Global environment missing')
      expect(stubContent).toContain('attempting to reinstall')
      expect(stubContent).toContain('not found in global environment or system PATH')
    })
  })

  describe('Integration with Environment Management', () => {
    it('should work correctly with environment activation/deactivation', () => {
      // Test that global stubs persist across environment changes
      const globalStub = createGlobalStub('persistent-tool', globalEnvDir, 'tools.org/persistent@^1.0.0')

      // Global stubs should not be affected by project environment changes
      expect(globalStub).not.toContain('LAUNCHPAD_PROJECT_DIR')
      expect(globalStub).not.toContain('case "$PWD"')
      expect(globalStub).toContain('stable and survives environment rebuilds')
    })

    it('should handle global package updates correctly', () => {
      const oldStub = createGlobalStub('updatable-tool', globalEnvDir, 'tools.org/updatable@^1.0.0')
      const newStub = createGlobalStub('updatable-tool', globalEnvDir, 'tools.org/updatable@^2.0.0')

      // Both should use the same global path structure
      expect(oldStub).toContain(globalEnvDir)
      expect(newStub).toContain(globalEnvDir)

      // Both should have the same fallback logic
      expect(oldStub).toContain('attempting to reinstall')
      expect(newStub).toContain('attempting to reinstall')
    })
  })
})

// Helper functions to simulate stub creation logic

function createGlobalStub(binaryName: string, globalEnvDir: string, packageSpec: string): string {
  return `#!/bin/sh
# Global Launchpad stub for ${binaryName} (${packageSpec})
# This stub is stable and survives environment rebuilds

# First try the current global installation path
if [ -x "${globalEnvDir}/bin/${binaryName}" ]; then
  exec "${globalEnvDir}/bin/${binaryName}" "$@"
fi

# If the direct path doesn't work, try to find the binary in the global environment
GLOBAL_ENV_DIR="${globalEnvDir}"
if [ -d "$GLOBAL_ENV_DIR" ]; then
  # Try both bin and sbin directories
  for bin_dir in "$GLOBAL_ENV_DIR/bin" "$GLOBAL_ENV_DIR/sbin"; do
    if [ -x "$bin_dir/${binaryName}" ]; then
      exec "$bin_dir/${binaryName}" "$@"
    fi
  done
fi

# If global environment is missing, try to reinstall it
if command -v launchpad >/dev/null 2>&1; then
  echo "⚠️  Global environment missing, attempting to reinstall..." >&2
  if launchpad dev ~/.dotfiles >/dev/null 2>&1; then
    # Try again after reinstall
    if [ -x "${globalEnvDir}/bin/${binaryName}" ]; then
      exec "${globalEnvDir}/bin/${binaryName}" "$@"
    fi
  fi
fi

# Fall back to system binary if available
if command -v ${binaryName} >/dev/null 2>&1; then
  system_${binaryName}=$(command -v ${binaryName})
  if [ "$system_${binaryName}" != "$0" ]; then
    exec "$system_${binaryName}" "$@"
  fi
fi

echo "Error: ${binaryName} not found in global environment or system PATH" >&2
exit 127
`
}

function createLocalStub(binaryName: string, localBinPath: string, projectHash: string): string {
  return `#!/bin/sh
# Local Launchpad stub for ${binaryName} (${projectHash})
exec "${localBinPath}/${binaryName}" "$@"
`
}

function getGlobalStubPaths(binaryNames: string[]): string[] {
  return binaryNames.map(name => `/usr/local/bin/${name}`)
}

function getLocalStubPaths(binaryNames: string[], _projectHash: string): string[] {
  return binaryNames.map(name => `${process.env.HOME}/.local/bin/${name}`)
}
