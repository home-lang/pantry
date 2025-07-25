import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

describe('Shell Integration Library Paths', () => {
  let originalEnv: NodeJS.ProcessEnv
  let tempDir: string
  let testInstallPath: string

  beforeEach(() => {
    originalEnv = { ...process.env }
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'launchpad-shell-libpath-test-'))
    testInstallPath = path.join(tempDir, 'install')

    fs.mkdirSync(testInstallPath, { recursive: true })

    // Set test environment variables
    process.env.LAUNCHPAD_PREFIX = testInstallPath
    process.env.NODE_ENV = 'test'
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
  })

  // Helper to create mock environment with library directories
  const createMockEnvironment = (envDir: string, packages: Array<{ domain: string, version: string, hasLibs?: boolean }>) => {
    for (const { domain, version, hasLibs = true } of packages) {
      const packageDir = path.join(envDir, domain, `v${version}`)

      if (hasLibs) {
        const libDir = path.join(packageDir, 'lib')
        const lib64Dir = path.join(packageDir, 'lib64')
        fs.mkdirSync(libDir, { recursive: true })
        fs.mkdirSync(lib64Dir, { recursive: true })

        // Create mock library files
        fs.writeFileSync(path.join(libDir, `lib${domain.split('.')[0]}.dylib`), 'mock library')
        fs.writeFileSync(path.join(lib64Dir, `lib${domain.split('.')[0]}.so`), 'mock library 64')
      }

      const binDir = path.join(packageDir, 'bin')
      fs.mkdirSync(binDir, { recursive: true })
      fs.writeFileSync(path.join(binDir, domain.split('.')[0]), '#!/bin/sh\necho "mock binary"\n')
      fs.chmodSync(path.join(binDir, domain.split('.')[0]), 0o755)
    }
  }

  describe('__launchpad_update_library_paths function', () => {
    it('should generate correct shell code for library path setup', async () => {
      // Import the shellcode function
      const { shellcode } = await import('../src/dev/shellcode')

      const generatedShellCode = shellcode()

      // Check that the function is defined
      expect(generatedShellCode).toContain('__launchpad_update_library_paths()')
      expect(generatedShellCode).toContain('local env_dir="$1"')
      expect(generatedShellCode).toContain('local lib_paths=""')
    })

    it('should include library path discovery logic', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should scan for lib and lib64 directories
      expect(generatedShellCode).toContain('for lib_dir in "$env_dir/lib" "$env_dir/lib64"')
      // Current implementation uses find instead of glob expansion for robustness
      expect(generatedShellCode).toContain('find "$env_dir" -maxdepth 1 -type d -print0')
      expect(generatedShellCode).toContain('find "$domain_dir" -maxdepth 1 -name "v*" -type d')
    })

    it('should set up all three library path variables', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should set DYLD_LIBRARY_PATH for macOS
      expect(generatedShellCode).toContain('export DYLD_LIBRARY_PATH=')
      expect(generatedShellCode).toContain('export DYLD_FALLBACK_LIBRARY_PATH=')
      // Should set LD_LIBRARY_PATH for Linux
      expect(generatedShellCode).toContain('export LD_LIBRARY_PATH=')
    })

    it('should preserve original library path values', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      expect(generatedShellCode).toContain('LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH')
      expect(generatedShellCode).toContain('LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH')
      expect(generatedShellCode).toContain('LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH')
    })

    it('should include macOS fallback paths', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      expect(generatedShellCode).toContain(':/usr/local/lib:/lib:/usr/lib')
    })
  })

  describe('Shell Integration Hooks', () => {
    it('should call library path setup in global dependency setup', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should call library path setup for global dependencies
      expect(generatedShellCode).toContain('__launchpad_setup_global_deps()')
      expect(generatedShellCode).toContain('__launchpad_update_library_paths "$global_env_dir"')
    })

    it('should call library path setup in project environment activation', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should call library path setup when activating project environments
      expect(generatedShellCode).toContain('__launchpad_update_library_paths "$env_dir"')
    })

    it('should restore library paths on deactivation', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should restore original library paths when deactivating
      expect(generatedShellCode).toContain('# Restore original library paths')
      expect(generatedShellCode).toContain('export DYLD_LIBRARY_PATH="$LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH"')
      expect(generatedShellCode).toContain('unset DYLD_LIBRARY_PATH')
      expect(generatedShellCode).toContain('unset LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH')
    })

    it('should clean up library path variables completely', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should unset all library path tracking variables
      expect(generatedShellCode).toContain('unset LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH')
      expect(generatedShellCode).toContain('unset LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH')
      expect(generatedShellCode).toContain('unset LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH')
    })
  })

  describe('Library Path Deduplication', () => {
    it('should avoid duplicate paths in library path variables', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should check for duplicates before adding paths
      expect(generatedShellCode).toContain('if [[ ":$lib_paths:" != *":$lib_dir:"* ]]')
    })
  })

  describe('Error Handling in Shell Integration', () => {
    it('should handle missing environment directories gracefully', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should check if directories exist before processing
      expect(generatedShellCode).toContain('if [[ -d "$lib_dir" ]]')
      expect(generatedShellCode).toContain('if [[ -d "$env_dir" ]]')
    })

    it('should handle conditional library path setting', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should only set library paths if we have paths to set
      expect(generatedShellCode).toContain('if [[ -n "$lib_paths" ]]')
    })
  })

  describe('Bash vs Zsh Compatibility', () => {
    it('should work with both bash and zsh syntax', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should use POSIX-compatible syntax
      expect(generatedShellCode).toContain('[[ -n "$ZSH_VERSION" ]]')
      expect(generatedShellCode).toContain('[[ -n "$BASH_VERSION" ]]')

      // Should use portable array/variable syntax
      expect(generatedShellCode).not.toContain('declare -a') // bash-specific
      expect(generatedShellCode).not.toContain('typeset -a') // zsh-specific
    })
  })

  describe('Performance Optimizations', () => {
    it('should use efficient directory scanning', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should filter out known non-package directories early
      const excludedDirs = ['bin', 'sbin', 'lib', 'lib64', 'share', 'include', 'etc', 'pkgs', '.tmp', '.cache']
      for (const dir of excludedDirs) {
        // Current implementation uses basename comparison for filtering
        expect(generatedShellCode).toContain(`"$domain_name" != "${dir}"`)
      }
    })

    it('should avoid redundant filesystem checks', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should check directory existence before processing version directories
      // (domain_dir check is unnecessary since find only returns directories)
      expect(generatedShellCode).toContain('[[ -d "$version_dir"')
      // Should also use find which is more efficient than glob expansion
      expect(generatedShellCode).toContain('find "$env_dir" -maxdepth 1 -type d -print0')
    })
  })

  describe('Environment Variable Precedence', () => {
    it('should handle existing library paths correctly', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should append to existing paths, not replace them
      expect(generatedShellCode).toContain('if [[ -n "$LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH" ]]')
      expect(generatedShellCode).toContain('export DYLD_LIBRARY_PATH="$lib_paths:$LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH"')
      expect(generatedShellCode).toContain('export DYLD_LIBRARY_PATH="$lib_paths"')
    })

    it('should handle empty original values gracefully', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should handle case where original values are empty (updated to match current implementation)
      expect(generatedShellCode).toContain('else\n            export DYLD_LIBRARY_PATH="$lib_paths"')
      expect(generatedShellCode).toContain('else\n            export LD_LIBRARY_PATH="$lib_paths"')
    })
  })

  describe('Global vs Local Environment Handling', () => {
    it('should handle both global and local environments', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should set up global dependencies
      expect(generatedShellCode).toContain('__launchpad_setup_global_deps()')
      expect(generatedShellCode).toContain('__launchpad_ensure_global_path()')

      // Should handle project-specific environments
      expect(generatedShellCode).toContain('$HOME/.local/share/launchpad/launchpad_$project_hash')
    })

    it('should maintain separation between global and local library paths', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Both global and local should use the same library path function
      expect(generatedShellCode).toContain('__launchpad_update_library_paths "$global_env_dir"')
      expect(generatedShellCode).toContain('__launchpad_update_library_paths "$env_dir"')
    })
  })

  describe('Command Hash Refresh', () => {
    it('should refresh command hash after library path setup', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should clear command hash table after updating paths
      expect(generatedShellCode).toContain('hash -r 2>/dev/null || true')
    })
  })

  describe('Real-world Integration Scenarios', () => {
    it('should support Node.js requiring zlib scenario in shell integration', async () => {
      // Create mock environment with Node.js and zlib
      const envDir = path.join(testInstallPath, 'test-env')
      createMockEnvironment(envDir, [
        { domain: 'nodejs.org', version: '20.0.0' },
        { domain: 'zlib.net', version: '1.3.1' },
        { domain: 'openssl.org', version: '3.0.0' },
      ])

      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should generate shell code that would properly set up library paths
      expect(generatedShellCode).toContain('__launchpad_update_library_paths')
      expect(generatedShellCode).toContain('export DYLD_LIBRARY_PATH=')
      expect(generatedShellCode).toContain('export LD_LIBRARY_PATH=')
    })

    it('should handle mixed global and local dependencies', async () => {
      // Create both global and local environments
      const globalEnvDir = path.join(testInstallPath, 'global')
      const localEnvDir = path.join(testInstallPath, 'local')

      createMockEnvironment(globalEnvDir, [
        { domain: 'nodejs.org', version: '20.0.0' },
        { domain: 'zlib.net', version: '1.3.1' },
      ])

      createMockEnvironment(localEnvDir, [
        { domain: 'project-tool.org', version: '1.0.0' },
      ])

      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should handle both global and local library paths
      expect(generatedShellCode).toContain('__launchpad_setup_global_deps')
      expect(generatedShellCode).toContain('__launchpad_ensure_global_path')
    })
  })
})
