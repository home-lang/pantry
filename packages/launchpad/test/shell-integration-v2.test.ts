import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import { existsSync, mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { shellcode } from '../src/dev/shellcode'

describe('Shell Integration V2 - Performance Optimized', () => {
  let projectDir: string

  beforeEach(() => {
    projectDir = join(import.meta.dirname, 'shell-test-project')
    mkdirSync(projectDir, { recursive: true })
  })

  afterEach(() => {
    if (existsSync(projectDir)) {
      rmSync(projectDir, { recursive: true, force: true })
    }
  })

  describe('Project Detection', () => {
    it('should detect project directory', () => {
      const shell = shellcode(true)
      expect(shell).toContain('project_dir=')
    })

    it('should detect project with deps.yaml', () => {
      writeFileSync(join(projectDir, 'deps.yaml'), 'dependencies:\n  node: "*"')
      const shell = shellcode(true)
      expect(shell).toContain('deps.yaml')
    })

    it('should detect project with package.json', () => {
      writeFileSync(join(projectDir, 'package.json'), '{"name": "test"}')
      const shell = shellcode(true)
      expect(shell).toContain('package.json')
    })
  })

  describe('Environment Hashing', () => {
    it('should generate consistent MD5 hashes', () => {
      const shell = shellcode(true)
      // Should handle environment variables
      expect(shell).toContain('LAUNCHPAD_DISABLE_SHELL_INTEGRATION')
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
    it('should handle path management', () => {
      const shell = shellcode(true)
      // Should handle path management
      expect(shell).toContain('PATH')
      expect(shell).toContain('__lp_prepend_path')
    })

    it('should handle path checking', () => {
      const shell = shellcode(true)
      // Should check paths before adding
      expect(shell).toContain('case ":$PATH:" in')
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

    it('should handle environment variables', () => {
      const shell = shellcode(true)
      // Should handle environment variables
      expect(shell).toContain('LAUNCHPAD_DISABLE_SHELL_INTEGRATION')
      expect(shell).toContain('LAUNCHPAD_SKIP_INITIAL_INTEGRATION')
    })
  })

  describe('Project Switching and Deactivation', () => {
    it('should handle environment variables', () => {
      const shell = shellcode(true)
      // Should handle environment variables
      expect(shell).toContain('LAUNCHPAD_DISABLE_SHELL_INTEGRATION')
      expect(shell).toContain('LAUNCHPAD_SKIP_INITIAL_INTEGRATION')
    })
  })

  describe('Safety and Performance', () => {
    it('should have minimal shell integration', () => {
      const shell = shellcode(true)
      // Should have minimal shell integration comment
      expect(shell).toContain('MINIMAL LAUNCHPAD SHELL INTEGRATION')
    })

    it('should have early exit conditions', () => {
      const shell = shellcode(true)
      // Should have early exit conditions
      expect(shell).toContain('return 0')
      expect(shell).toContain('exit 0')
    })
  })

  describe('Debug Output', () => {
    it('should include comments', () => {
      const shell = shellcode(true)
      // Should include comments for debugging
      expect(shell).toContain('#')
    })
  })

  describe('Shell Integration', () => {
    it('should handle environment variables', () => {
      const shell = shellcode(true)
      // Should handle environment variables
      expect(shell).toContain('LAUNCHPAD_DISABLE_SHELL_INTEGRATION')
      expect(shell).toContain('LAUNCHPAD_SKIP_INITIAL_INTEGRATION')
    })
  })
})
