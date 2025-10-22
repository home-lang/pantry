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

  describe('__lp_add_unique_colon_path function', () => {
    it('should generate correct shell code for library path setup', async () => {
      // Import the shellcode function
      const { shellcode } = await import('../src/dev/shellcode')

      const generatedShellCode = shellcode()

      // Check that the function is defined
      expect(generatedShellCode).toContain('__lp_add_unique_colon_path()')
      expect(generatedShellCode).toContain('local __var_name="$1"')
      expect(generatedShellCode).toContain('local __lp_libs=()')
    })

    it('should include library path discovery logic', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should search for version directories and library paths
      expect(generatedShellCode).toContain('find "$env_dir')
      expect(generatedShellCode).toContain('-maxdepth 2 -type d -name \'v*\'')
      expect(generatedShellCode).toContain('for dom in curl.se openssl.org zlib.net')
    })

    it('should set up all three library path variables', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should use eval to export library paths dynamically
      expect(generatedShellCode).toContain('eval "export $')
      expect(generatedShellCode).toContain('__lp_add_unique_colon_path DYLD_LIBRARY_PATH')
      expect(generatedShellCode).toContain('__lp_add_unique_colon_path DYLD_FALLBACK_LIBRARY_PATH')
      expect(generatedShellCode).toContain('__lp_add_unique_colon_path LD_LIBRARY_PATH')
    })

    it('should handle library paths with uniqueness checking', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should check for duplicates before adding paths
      expect(generatedShellCode).toContain('case ":$__cur:" in')
      expect(generatedShellCode).toContain('*":$__val:"*) : ;;')
      expect(generatedShellCode).toContain('# already present')
    })

    it('should include domain-specific library scanning', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should scan specific domains for library directories
      expect(generatedShellCode).toContain('gnu.org/readline')
      expect(generatedShellCode).toContain('for dom in')
    })
  })

  describe('Shell Integration Hooks', () => {
    it('should include library path setup in environment activation', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should include library path setup within environment activation
      expect(generatedShellCode).toContain('local __lp_libs=()')
      expect(generatedShellCode).toContain('# Collect candidate lib dirs')
    })

    it('should include library path processing in project environment activation', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should process library paths when activating project environments
      expect(generatedShellCode).toContain('for libdir in "$')
    })

    it('should handle library path management efficiently', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should include efficient library path logic
      expect(generatedShellCode).toContain('# Export DYLD and LD paths')
      expect(generatedShellCode).toContain('if [[ -d "$libdir" ]]; then')
    })

    it('should handle global and environment-specific library paths', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should handle both global and environment-specific library paths
      expect(generatedShellCode).toContain('# Global-level libs')
      expect(generatedShellCode).toContain('local __lp_global=')
    })
  })

  describe('Library Path Deduplication', () => {
    it('should avoid duplicate paths in library path variables', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should use the unique path function to avoid duplicates
      expect(generatedShellCode).toContain('__lp_add_unique_colon_path')
      expect(generatedShellCode).toContain('*":$__val:"*) : ;;')
    })
  })

  describe('Error Handling in Shell Integration', () => {
    it('should handle missing environment directories gracefully', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should check if directories exist before processing
      expect(generatedShellCode).toContain('if [[ -d "$libdir" ]]; then')
      expect(generatedShellCode).toContain('if [[ -d "$env_dir/bin" ]]; then')
    })

    it('should handle conditional library path setting', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should only set library paths if we have values to set
      expect(generatedShellCode).toContain('if [[ -z "$__val" ]]; then return 0; fi')
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

      // Should use efficient find commands with limited depth
      expect(generatedShellCode).toContain('-maxdepth 2')
      expect(generatedShellCode).toContain('2>/dev/null')
    })

    it('should avoid redundant filesystem checks', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should use find with directory checks that are efficient
      expect(generatedShellCode).toContain('find ')
      expect(generatedShellCode).toContain('-type d')
      expect(generatedShellCode).toContain('2>/dev/null')
    })
  })

  describe('Environment Variable Precedence', () => {
    it('should handle existing library paths correctly', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should use eval to handle library path exports dynamically
      expect(generatedShellCode).toContain('eval "export $')
      expect(generatedShellCode).toContain('if [[ -n "$__cur" ]]; then')
    })

    it('should handle empty original values gracefully', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should handle case where original values are empty
      expect(generatedShellCode).toContain('else')
      expect(generatedShellCode).toContain('eval "export $')
    })
  })

  describe('Global vs Local Environment Handling', () => {
    it('should handle both global and local environments', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Should handle both global and project-specific environments
      expect(generatedShellCode).toContain('__lp_global')
      expect(generatedShellCode).toContain('Global-level libs')

      // Should handle project-specific environments
      expect(generatedShellCode).toContain('.local/share/launchpad/envs')
    })

    it('should maintain separation between global and local library paths', async () => {
      const { shellcode } = await import('../src/dev/shellcode')
      const generatedShellCode = shellcode()

      // Both global and local should use the same library path function
      expect(generatedShellCode).toContain('# Global-level libs')
      expect(generatedShellCode).toContain('# Env-level libs')
      expect(generatedShellCode).toContain('__lp_add_unique_colon_path')
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
      expect(generatedShellCode).toContain('__lp_add_unique_colon_path DYLD_LIBRARY_PATH')
      expect(generatedShellCode).toContain('__lp_add_unique_colon_path LD_LIBRARY_PATH')
      expect(generatedShellCode).toContain('# Export DYLD and LD paths')
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
      expect(generatedShellCode).toContain('# Global-level libs')
      expect(generatedShellCode).toContain('local __lp_global=')
    })
  })
})
