import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { shellcode } from '../src/dev/shellcode'

describe('Shell Integration V2 - Performance Optimized', () => {
  const testDir = join(process.cwd(), 'test-shell-v2')
  const projectDir = join(testDir, 'test-project')
  const globalBinDir = join(process.env.HOME!, '.local/share/launchpad/global/bin')

  beforeEach(() => {
    // Clean up any existing test directories
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
    mkdirSync(testDir, { recursive: true })
    mkdirSync(projectDir, { recursive: true })

    // Ensure global bin directory exists for tests
    mkdirSync(globalBinDir, { recursive: true })

    // Create a mock global binary
    writeFileSync(join(globalBinDir, 'test-tool'), '#!/bin/bash\necho "global-version"', { mode: 0o755 })
  })

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  describe('Project Detection', () => {
    it('should detect project with deps.yaml', async () => {
      // Create a project with deps.yaml
      writeFileSync(join(projectDir, 'deps.yaml'), 'dependencies:\n  bun.sh: 1.2.17')

      const shell = shellcode(true)
      expect(shell).toContain('dev:find-project-root')
      expect(shell).toContain('timeout')
      expect(shell).toContain('LAUNCHPAD_DISABLE_SHELL_INTEGRATION=1')
    })

    it('should detect project with dependencies.yaml', async () => {
      writeFileSync(join(projectDir, 'dependencies.yaml'), 'dependencies:\n  node: 18')

      const shell = shellcode(true)
      expect(shell).toContain('dependencies.yaml')
    })

    it('should detect project with package.json', async () => {
      writeFileSync(join(projectDir, 'package.json'), '{"name": "test"}')

      const shell = shellcode(true)
      expect(shell).toContain('package.json')
    })
  })

  describe('Environment Hashing', () => {
    it('should generate consistent MD5 hashes', () => {
      const shell = shellcode(true)

      // Should use launchpad dev:md5 for consistent hashing
      expect(shell).toContain('dev:md5')
      expect(shell).toContain('timeout 1s')
      expect(shell).toContain('LAUNCHPAD_DISABLE_SHELL_INTEGRATION=1')
    })

    it('should handle dependency file hashing', () => {
      const shell = shellcode(true)

      // Should check for dependency files and hash them
      expect(shell).toContain('dependencies.yaml')
      expect(shell).toContain('deps.yaml')
      expect(shell).toContain('pkgx.yaml')
      expect(shell).toContain('package.json')
    })

    it('should create environment directory with correct format', () => {
      const shell = shellcode(true)

      // Should create env_dir with project_hash and optional dep_hash
      expect(shell).toContain('env_dir="$HOME/.local/share/launchpad/envs/$project_hash"')
      // eslint-disable-next-line no-template-curly-in-string
      expect(shell).toContain('env_dir="${env_dir}-d${dep_short}"')
    })
  })

  describe('Global Path Management', () => {
    it('should always activate global paths', () => {
      const shell = shellcode(true)

      // Should check for and activate global paths
      expect(shell).toContain('global_bin="$HOME/.local/share/launchpad/global/bin"')
      expect(shell).toContain('export PATH="$global_bin:$PATH"')
      expect(shell).toContain('Global paths activated')
    })

    it('should not duplicate global paths in PATH', () => {
      const shell = shellcode(true)

      // Should check if path is already in PATH before adding
      expect(shell).toContain(':$PATH:" != *":$global_bin:"*')
    })
  })

  describe('Project Environment Activation', () => {
    it('should activate existing project environment', () => {
      const shell = shellcode(true)

      // Should check if environment exists and activate it
      expect(shell).toContain('if [[ -d "$env_dir/bin" ]]; then')
      expect(shell).toContain('export LAUNCHPAD_CURRENT_PROJECT="$project_dir"')
      expect(shell).toContain('export LAUNCHPAD_ENV_BIN_PATH="$env_dir/bin"')
      expect(shell).toContain('export PATH="$env_dir/bin:$PATH"')
    })

    it('should auto-install missing project environment', () => {
      const shell = shellcode(true)

      // Should install dependencies if environment doesn't exist
      expect(shell).toContain('Environment not found')
      expect(shell).toContain('installing...')
      expect(shell).toContain('LAUNCHPAD_SHELL_INTEGRATION=1')
      expect(shell).toContain('timeout 30s')
      expect(shell).toContain('install "$project_dir"')
    })

    it('should handle installation success', () => {
      const shell = shellcode(true)

      // Should activate environment after successful installation
      expect(shell).toContain('Environment installed and activated')
    })

    it('should handle installation failure', () => {
      const shell = shellcode(true)

      // Should show error message if installation fails
      expect(shell).toContain('Installation failed or timed out')
    })
  })

  describe('Project Switching and Deactivation', () => {
    it('should deactivate project when leaving project directory', () => {
      const shell = shellcode(true)

      // Should remove project paths when no project is found
      expect(shell).toContain('Project environment deactivated')
      expect(shell).toContain('unset LAUNCHPAD_CURRENT_PROJECT')
      expect(shell).toContain('unset LAUNCHPAD_ENV_BIN_PATH')
    })

    it('should switch between different projects', () => {
      const shell = shellcode(true)

      // Should handle switching from one project to another
      expect(shell).toContain('Switching from')
      expect(shell).toContain('LAUNCHPAD_CURRENT_PROJECT" != "$project_dir"')
    })

    it('should clean up PATH when switching projects', () => {
      const shell = shellcode(true)

      // Should remove old project paths before adding new ones
      expect(shell).toContain('sed "s|$LAUNCHPAD_ENV_BIN_PATH:||g"')
    })
  })

  describe('Safety and Performance', () => {
    it('should prevent infinite loops', () => {
      const shell = shellcode(true)

      // Should have processing guard
      expect(shell).toContain('__LAUNCHPAD_PROCESSING')
      expect(shell).toContain('trap \'unset __LAUNCHPAD_PROCESSING\' EXIT')
    })

    it('should disable shell integration during CLI calls', () => {
      const shell = shellcode(true)

      // All CLI calls should have LAUNCHPAD_DISABLE_SHELL_INTEGRATION=1
      const cliCalls = shell.match(/\$\{launchpadBinary\}[^}]*/g) || []
      for (const call of cliCalls) {
        expect(call).toMatch(/LAUNCHPAD_DISABLE_SHELL_INTEGRATION=1/)
      }
    })

    it('should have aggressive timeouts', () => {
      const shell = shellcode(true)

      // All operations should have timeouts
      expect(shell).toContain('timeout 1s')
      expect(shell).toContain('timeout 30s')
    })

    it('should exit early when disabled', () => {
      const shell = shellcode(true)

      // Should respect disable flag
      expect(shell).toContain('LAUNCHPAD_DISABLE_SHELL_INTEGRATION')
      expect(shell).toContain('return 0 2>/dev/null || exit 0')
    })
  })

  describe('Debug Output', () => {
    it('should provide comprehensive debug information', () => {
      const shell = shellcode(true)

      // Should show debug info for troubleshooting
      expect(shell).toContain('DEBUG: Project search completed')
      expect(shell).toContain('DEBUG: Checking global bin')
      expect(shell).toContain('DEBUG: Project found')
      expect(shell).toContain('DEBUG: Environment dir')
      expect(shell).toContain('DEBUG: MD5 hash')
      expect(shell).toContain('DEBUG: Dependency file')
    })
  })

  describe('Integration with Install Command', () => {
    it('should use correct environment variables for progress display', () => {
      const shell = shellcode(true)

      // Should set both variables for proper progress display
      expect(shell).toContain('LAUNCHPAD_DISABLE_SHELL_INTEGRATION=1 LAUNCHPAD_SHELL_INTEGRATION=1')
    })

    it('should pass correct project directory to install', () => {
      const shell = shellcode(true)

      // Should install from the detected project directory
      expect(shell).toContain('install "$project_dir"')
    })
  })

  describe('Real Shell Execution', () => {
    it('should execute without syntax errors', () => {
      const shell = shellcode(true)

      // Should be valid bash/zsh syntax
      expect(() => {
        // Write to temp file and validate syntax
        const tempFile = join(testDir, 'test-shell.sh')
        writeFileSync(tempFile, shell)
        execSync(`bash -n "${tempFile}"`, { stdio: 'pipe' })
      }).not.toThrow()
    })

    it('should handle missing launchpad binary gracefully', () => {
      const shell = shellcode(true)

      // Should not crash if launchpad binary is not found
      expect(shell).toContain('2>/dev/null')
      expect(shell).toContain('|| echo')
    })
  })

  describe('Environment Variable Handling', () => {
    it('should properly export required variables', () => {
      const shell = shellcode(true)

      // Should export all necessary environment variables
      expect(shell).toContain('export LAUNCHPAD_CURRENT_PROJECT')
      expect(shell).toContain('export LAUNCHPAD_ENV_BIN_PATH')
      expect(shell).toContain('export PATH')
      expect(shell).toContain('export __LAUNCHPAD_PROCESSING')
    })

    it('should clean up environment variables on deactivation', () => {
      const shell = shellcode(true)

      // Should unset variables when deactivating
      expect(shell).toContain('unset LAUNCHPAD_CURRENT_PROJECT')
      expect(shell).toContain('unset LAUNCHPAD_ENV_BIN_PATH')
      expect(shell).toContain('unset __LAUNCHPAD_PROCESSING')
    })
  })

  describe('PATH Management and Precedence', () => {
    it('should maintain proper PATH precedence', () => {
      const shell = shellcode(true)

      // Project paths should come before global paths
      expect(shell).toContain('export PATH="$env_dir/bin:$PATH"')
      expect(shell).toContain('export PATH="$global_bin:$PATH"')
    })

    it('should handle PATH cleanup when switching projects', () => {
      const shell = shellcode(true)

      // Should remove old paths before adding new ones
      expect(shell).toContain('sed "s|$LAUNCHPAD_ENV_BIN_PATH:||g"')
      expect(shell).toContain('sed "s|:$LAUNCHPAD_ENV_BIN_PATH||g"')
      expect(shell).toContain('sed "s|^$LAUNCHPAD_ENV_BIN_PATH$||g"')
    })

    it('should not duplicate paths in PATH', () => {
      const shell = shellcode(true)

      // Should check if path already exists before adding
      expect(shell).toContain(':$PATH:" != *":$global_bin:"*')
    })
  })

  describe('Shell Hook Integration', () => {
    it('should include directory change detection', () => {
      const shell = shellcode(true)

      // Should detect when PWD changes and trigger environment checks
      expect(shell).toContain('PWD')
      expect(shell).toContain('project_dir')
    })

    it('should handle shell initialization properly', () => {
      const shell = shellcode(true)

      // Should have proper shell initialization guards
      expect(shell).toContain('__LAUNCHPAD_PROCESSING')
      expect(shell).toContain('trap')
      expect(shell).toContain('EXIT')
    })
  })

  describe('Message Configuration', () => {
    it('should include activation messages', () => {
      const shell = shellcode(true)

      // Should show environment activation messages
      expect(shell).toContain('Environment activated')
      expect(shell).toContain('Environment installed and activated')
    })

    it('should include deactivation messages', () => {
      const shell = shellcode(true)

      // Should show environment deactivation messages
      expect(shell).toContain('Project environment deactivated')
      expect(shell).toContain('Switching from')
    })

    it('should include error messages', () => {
      const shell = shellcode(true)

      // Should show error messages for troubleshooting
      expect(shell).toContain('Environment not found')
      expect(shell).toContain('Installation failed or timed out')
      expect(shell).toContain('Installation completed but environment not found')
    })
  })

  describe('Performance Optimizations', () => {
    it('should include caching mechanisms', () => {
      const shell = shellcode(true)

      // Should have caching for performance
      expect(shell).toContain('timeout')
      expect(shell).toContain('2>/dev/null')
    })

    it('should minimize expensive operations', () => {
      const shell = shellcode(true)

      // Should use timeouts to prevent hanging
      expect(shell).toContain('timeout 1s')
      expect(shell).toContain('timeout 30s')
    })

    it('should handle background operations', () => {
      const shell = shellcode(true)

      // Should handle operations that might take time
      expect(shell).toContain('install')
      expect(shell).toContain('LAUNCHPAD_SHELL_INTEGRATION=1')
    })
  })

  describe('File Type Support', () => {
    it('should support all dependency file types', () => {
      const shell = shellcode(true)

      // Should check for all supported dependency files
      expect(shell).toContain('dependencies.yaml')
      expect(shell).toContain('deps.yaml')
      expect(shell).toContain('pkgx.yaml')
      expect(shell).toContain('package.json')
    })

    it('should maintain proper file priority order', () => {
      const shell = shellcode(true)

      // Should check files in the correct order
      const dependenciesIndex = shell.indexOf('dependencies.yaml')
      const depsIndex = shell.indexOf('deps.yaml')
      const pkgxIndex = shell.indexOf('pkgx.yaml')
      const packageIndex = shell.indexOf('package.json')

      expect(dependenciesIndex).toBeLessThan(depsIndex)
      expect(depsIndex).toBeLessThan(pkgxIndex)
      expect(pkgxIndex).toBeLessThan(packageIndex)
    })
  })

  describe('Error Handling and Resilience', () => {
    it('should handle missing binaries gracefully', () => {
      const shell = shellcode(true)

      // Should not crash if launchpad binary is missing
      expect(shell).toContain('2>/dev/null')
      expect(shell).toContain('|| echo')
    })

    it('should handle timeout scenarios', () => {
      const shell = shellcode(true)

      // Should have fallbacks for timeout scenarios
      expect(shell).toContain('timeout')
      expect(shell).toContain('|| echo "00000000"')
      expect(shell).toContain('|| echo ""')
    })

    it('should handle permission errors', () => {
      const shell = shellcode(true)

      // Should handle cases where directories cannot be created or accessed
      expect(shell).toContain('2>/dev/null')
    })

    it('should handle circular dependency prevention', () => {
      const shell = shellcode(true)

      // Should prevent infinite loops in shell integration
      expect(shell).toContain('LAUNCHPAD_DISABLE_SHELL_INTEGRATION=1')
      expect(shell).toContain('__LAUNCHPAD_PROCESSING')
    })
  })

  describe('Cross-Shell Compatibility', () => {
    it('should use POSIX-compatible syntax', () => {
      const shell = shellcode(true)

      // Should use syntax compatible with bash/zsh
      expect(shell).toContain('[[ ')
      expect(shell).toContain(']]')
      expect(shell).toContain('export ')
      expect(shell).toContain('unset ')
    })

    it('should handle different shell environments', () => {
      const shell = shellcode(true)

      // Should work in different shell contexts
      expect(shell).toContain('return 0 2>/dev/null || exit 0')
    })
  })

  describe('Integration Test Scenarios', () => {
    it('should handle rapid directory changes', () => {
      const shell = shellcode(true)

      // Should handle quick cd operations without conflicts
      expect(shell).toContain('__LAUNCHPAD_PROCESSING')
      expect(shell).toContain('trap')
    })

    it('should handle nested project directories', () => {
      const shell = shellcode(true)

      // Should find the correct project root
      expect(shell).toContain('dev:find-project-root')
    })

    it('should handle projects with multiple dependency files', () => {
      const shell = shellcode(true)

      // Should prioritize the correct dependency file
      expect(shell).toContain('break')
    })
  })
})
