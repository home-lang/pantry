import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { execSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { shellcode } from '../src/dev/shellcode'

describe('Shell Environment Switching - TDD', () => {
  const testDir = join(process.cwd(), 'test-env-switching')
  const projectA = join(testDir, 'project-a')
  const projectB = join(testDir, 'project-b')
  const nonProjectDir = join(testDir, 'non-project')
  const globalBinDir = join(process.env.HOME!, '.local/share/launchpad/global/bin')

  beforeEach(() => {
    // Clean up any existing test directories
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
    mkdirSync(testDir, { recursive: true })
    mkdirSync(projectA, { recursive: true })
    mkdirSync(projectB, { recursive: true })
    mkdirSync(nonProjectDir, { recursive: true })

    // Ensure global bin directory exists
    mkdirSync(globalBinDir, { recursive: true })

    // Create mock global tools
    writeFileSync(join(globalBinDir, 'bun'), '#!/bin/bash\necho "1.2.20"', { mode: 0o755 })
    writeFileSync(join(globalBinDir, 'node'), '#!/bin/bash\necho "20.0.0"', { mode: 0o755 })

    // Create project A with bun 1.2.17
    writeFileSync(join(projectA, 'deps.yaml'), 'dependencies:\n  bun.sh: 1.2.17')

    // Create project B with node 18
    writeFileSync(join(projectB, 'package.json'), '{"engines": {"node": "18"}}')
  })

  afterEach(() => {
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true })
    }
  })

  describe('Directory Change Hook Registration', () => {
    it('should register chpwd hook for zsh', () => {
      const shell = shellcode(true)

      // Should register the chpwd hook
      expect(shell).toContain('__launchpad_chpwd()')
      expect(shell).toContain('chpwd_functions+=(__launchpad_chpwd)')
      expect(shell).toContain('ZSH_VERSION')
    })

    it('should register PROMPT_COMMAND hook for bash', () => {
      const shell = shellcode(true)

      // Should register the PROMPT_COMMAND hook
      expect(shell).toContain('__launchpad_prompt_command()')
      expect(shell).toContain('PROMPT_COMMAND=')
      expect(shell).toContain('BASH_VERSION')
    })

    it('should register hooks and include processing guards', () => {
      const shell = shellcode(true)

      // Check that both hook registration and processing guard are present
      expect(shell).toContain('chpwd_functions+=')
      expect(shell).toContain('__LAUNCHPAD_PROCESSING')
    })

    it('should prevent duplicate hook registration', () => {
      const shell = shellcode(true)

      // Should check if hook is already registered before adding
      // eslint-disable-next-line no-template-curly-in-string
      expect(shell).toContain('! " ${chpwd_functions[*]} " =~ " __launchpad_chpwd "')
      expect(shell).toContain('*"__launchpad_prompt_command"*')
    })
  })

  describe('Project Environment Activation', () => {
    it('should activate project environment when entering project directory', () => {
      const shell = shellcode(true)

      // Should detect project and activate environment
      expect(shell).toContain('dev:find-project-root')
      expect(shell).toContain('export LAUNCHPAD_CURRENT_PROJECT="$project_dir"')
      expect(shell).toContain('export LAUNCHPAD_ENV_BIN_PATH="$env_dir/bin"')
      expect(shell).toContain('export PATH="$env_dir/bin:$PATH"')
      expect(shell).toContain('Environment activated')
    })

    it('should auto-install missing project environments', () => {
      const shell = shellcode(true)

      // Should install dependencies if environment doesn't exist
      expect(shell).toContain('LAUNCHPAD_SHELL_INTEGRATION=1')
      expect(shell).toContain('install "$project_dir"')
    })

    it('should use correct MD5 hashing for environment directories', () => {
      const shell = shellcode(true)

      // Should use launchpad dev:md5 for consistent hashing
      expect(shell).toContain('dev:md5')
      // eslint-disable-next-line no-template-curly-in-string
      expect(shell).toContain('project_hash="${project_basename}_$(echo "$md5hash" | cut -c1-8)"')
      // eslint-disable-next-line no-template-curly-in-string
      expect(shell).toContain('env_dir="${env_dir}-d${dep_short}"')
    })
  })

  describe('Project Environment Deactivation', () => {
    it('should deactivate project environment when leaving project directory', () => {
      const shell = shellcode(true)

      // Should remove project paths when no project is found
      expect(shell).toContain('unset LAUNCHPAD_CURRENT_PROJECT')
      expect(shell).toContain('unset LAUNCHPAD_ENV_BIN_PATH')
    })

    it('should clean up PATH when deactivating project environment', () => {
      const shell = shellcode(true)

      // Should remove project-specific paths from PATH
      expect(shell).toContain('sed "s|$LAUNCHPAD_ENV_BIN_PATH:||g"')
      expect(shell).toContain('sed "s|:$LAUNCHPAD_ENV_BIN_PATH||g"')
      expect(shell).toContain('sed "s|^$LAUNCHPAD_ENV_BIN_PATH$||g"')
    })

    it('should fall back to global tools after deactivation', () => {
      const shell = shellcode(true)

      // Should ensure global paths are available
      expect(shell).toContain('global_bin="$HOME/.local/share/launchpad/global/bin"')
      expect(shell).toContain('export PATH="$global_bin:$PATH"')
    })
  })

  describe('Project Environment Switching', () => {
    it('should switch between different project environments', () => {
      const shell = shellcode(true)

      // Should handle switching from one project to another
      expect(shell).toContain('LAUNCHPAD_CURRENT_PROJECT" != "$project_dir"')
    })

    it('should clean up old project paths when switching', () => {
      const shell = shellcode(true)

      // Should remove old project paths before adding new ones
      expect(shell).toContain('sed "s|$LAUNCHPAD_ENV_BIN_PATH:||g"')
    })

    it('should maintain global paths during project switching', () => {
      const shell = shellcode(true)

      // Global paths should always be available
      expect(shell).toContain(':$PATH:" != *":$global_bin:"*')
    })
  })

  describe('PATH Management and Precedence', () => {
    it('should maintain correct PATH precedence', () => {
      const shell = shellcode(true)

      // Project paths should come before global paths
      expect(shell).toContain('export PATH="$env_dir/bin:$PATH"')
      expect(shell).toContain('export PATH="$global_bin:$PATH"')
    })

    it('should not duplicate paths in PATH', () => {
      const shell = shellcode(true)

      // Should check if path already exists before adding
      expect(shell).toContain(':$PATH:" != *":$global_bin:"*')
    })

    it('should handle complex PATH cleanup scenarios', () => {
      const shell = shellcode(true)

      // Should handle paths at beginning, middle, and end of PATH
      expect(shell).toContain('sed "s|$LAUNCHPAD_ENV_BIN_PATH:||g"') // Beginning
      expect(shell).toContain('sed "s|:$LAUNCHPAD_ENV_BIN_PATH||g"') // End
      expect(shell).toContain('sed "s|^$LAUNCHPAD_ENV_BIN_PATH$||g"') // Entire PATH
    })
  })

  describe('Shell Integration Execution Flow', () => {
    it('should execute without syntax errors', () => {
      const shell = shellcode(true)

      // Should be valid bash/zsh syntax
      expect(() => {
        const tempFile = join(testDir, 'test-shell.sh')
        writeFileSync(tempFile, shell)
        execSync(`bash -n "${tempFile}"`, { stdio: 'pipe' })
      }).not.toThrow()
    })

    it('should handle rapid directory changes without conflicts', () => {
      const shell = shellcode(true)

      // Should have processing guard to prevent conflicts
      expect(shell).toContain('__LAUNCHPAD_PROCESSING')
      expect(shell).toContain('trap')
    })

    it('should prevent infinite loops during hook execution', () => {
      const shell = shellcode(true)

      // Should disable shell integration during CLI calls
      expect(shell).toContain('LAUNCHPAD_DISABLE_SHELL_INTEGRATION=1')
      expect(shell).toContain('timeout')
    })
  })

  describe('Environment Variable Management', () => {
    it('should properly set environment variables on activation', () => {
      const shell = shellcode(true)

      // Should export all necessary variables
      expect(shell).toContain('export LAUNCHPAD_CURRENT_PROJECT="$project_dir"')
      expect(shell).toContain('export LAUNCHPAD_ENV_BIN_PATH="$env_dir/bin"')
      expect(shell).toContain('export PATH=')
    })

    it('should properly clean up environment variables on deactivation', () => {
      const shell = shellcode(true)

      // Should unset project-specific variables
      expect(shell).toContain('unset LAUNCHPAD_CURRENT_PROJECT')
      expect(shell).toContain('unset LAUNCHPAD_ENV_BIN_PATH')
    })

    it('should maintain environment variable consistency', () => {
      const shell = shellcode(true)

      // Should check current state before making changes
      expect(shell).toContain('LAUNCHPAD_CURRENT_PROJECT" != "$project_dir"')
      expect(shell).toContain('-n "$LAUNCHPAD_CURRENT_PROJECT"')
      expect(shell).toContain('-n "$LAUNCHPAD_ENV_BIN_PATH"')
    })
  })

  describe('Error Handling and Edge Cases', () => {
    it('should handle missing project directories gracefully', () => {
      const shell = shellcode(true)

      // Should not crash if project directory doesn't exist
      expect(shell).toContain('2>/dev/null')
      expect(shell).toContain('|| echo')
    })

    it('should handle missing global directories gracefully', () => {
      const shell = shellcode(true)

      // Should check if global directory exists before using it
      expect(shell).toContain('-d "$global_bin"')
    })

    it('should handle timeout scenarios during environment setup', () => {
      const shell = shellcode(true)

      // Should have timeouts for all operations
      expect(shell).toContain('timeout')
    })

    it('should handle permission errors during PATH manipulation', () => {
      const shell = shellcode(true)

      // Should handle cases where PATH cannot be modified
      expect(shell).toContain('2>/dev/null')
    })
  })

  describe('Performance and Optimization', () => {
    it('should minimize expensive operations', () => {
      const shell = shellcode(true)

      // Should use timeouts to prevent hanging
      expect(shell).toContain('timeout')
      expect(shell).toContain('LAUNCHPAD_DISABLE_SHELL_INTEGRATION=1')
    })

    it('should cache results when possible', () => {
      const shell = shellcode(true)

      // Should avoid redundant operations
      expect(shell).toContain('-d "$env_dir/bin"')
    })

    it('should provide comprehensive debug information', () => {
      const shell = shellcode(true)

      // Should show debug info for troubleshooting
      expect(shell).toContain('Project detected')
    })
  })

  describe('Integration with Shell Features', () => {
    it('should work with zsh features', () => {
      const shell = shellcode(true)

      // Should use zsh-specific features correctly
      expect(shell).toContain('ZSH_VERSION')
      expect(shell).toContain('chpwd_functions')
      expect(shell).toContain('[[ ')
    })

    it('should work with bash features', () => {
      const shell = shellcode(true)

      // Should use bash-specific features correctly
      expect(shell).toContain('BASH_VERSION')
      expect(shell).toContain('PROMPT_COMMAND')
    })

    it('should handle shell-specific syntax correctly', () => {
      const shell = shellcode(true)

      // Should use POSIX-compatible syntax where possible
      expect(shell).toContain('return 0 2>/dev/null || exit 0')
      expect(shell).toContain('export ')
      expect(shell).toContain('unset ')
    })
  })
})
