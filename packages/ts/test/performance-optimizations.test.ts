import { afterEach, beforeEach, describe, expect, it } from 'bun:test'
import fs from 'node:fs'
import path from 'node:path'
import { shellcode } from '../src/dev/shellcode'

describe('Performance Optimizations', () => {
  let tempDir: string
  let originalHome: string | undefined

  beforeEach(() => {
    // Create a temporary test environment
    tempDir = fs.mkdtempSync(path.join(import.meta.dirname, 'perf-test-'))
    originalHome = process.env.HOME
    process.env.HOME = tempDir
  })

  afterEach(() => {
    // Clean up
    if (fs.existsSync(tempDir)) {
      fs.rmSync(tempDir, { recursive: true, force: true })
    }
    if (originalHome) {
      process.env.HOME = originalHome
    }
    else {
      delete process.env.HOME
    }
  })

  describe('Global Path Caching', () => {
    it('should include global path caching logic in shell integration', () => {
      const generatedShellCode = shellcode()

      // Should include TTL-based background update check logic
      expect(generatedShellCode).toContain('__lp_bg_update_check')
      expect(generatedShellCode).toContain('LAUNCHPAD_GLOBAL_UPDATE_TTL_HOURS')
    })

    it('should include modern TTL-based update checking logic', () => {
      const generatedShellCode = shellcode()

      // Should include TTL-based background update checking
      expect(generatedShellCode).toContain('TTL-based background update check')
      expect(generatedShellCode).toContain('ttl_hours')
      expect(generatedShellCode).toContain('backoff_marker')

      // Should use ready markers to avoid redundant setup
      expect(generatedShellCode).toContain('ready_cache_marker')
      expect(generatedShellCode).toContain('ready_global_marker')
    })

    it('should use ready markers to avoid expensive operations', () => {
      const generatedShellCode = shellcode()

      // Should use ready markers to skip redundant setup
      expect(generatedShellCode).toContain('Detect global ready markers (persistent) to skip redundant global setup')
      expect(generatedShellCode).toContain('ready_cache_marker')
      expect(generatedShellCode).toContain('ready_global_marker')
    })

    it('should use efficient library path management', () => {
      const generatedShellCode = shellcode()

      // Should use efficient library path collection
      const findOperations = (generatedShellCode.match(/find.*-maxdepth/g) || []).length

      // Should have some find operations for library path discovery
      expect(findOperations).toBeGreaterThan(0)

      // The fast path (cached section) should not contain find operations
      const cachedSection = generatedShellCode.substring(
        generatedShellCode.indexOf('Use cached global paths'),
        generatedShellCode.indexOf('Rebuild global paths cache'),
      )
      expect(cachedSection).not.toContain('find ')
    })
  })

  describe('Environment Readiness Detection', () => {
    it('should include fast path condition for environment readiness', () => {
      const generatedShellCode = shellcode()

      // Should check for bin directory and environment existence
      expect(generatedShellCode).toContain('[[ -d "$env_dir/bin" ]]')
      expect(generatedShellCode).toContain('If environment exists, activate it')
    })

    it('should include ready marker detection logic', () => {
      const generatedShellCode = shellcode()

      // Should check for ready markers to optimize performance
      expect(generatedShellCode).toContain('.ready')
    })

    it('should include cache directory logic', () => {
      const generatedShellCode = shellcode()

      // Should use cache directories for optimization
      expect(generatedShellCode).toContain('cache_dir')
      expect(generatedShellCode).toContain('$HOME/.cache/launchpad')
      expect(generatedShellCode).toContain('shell_cache_dir')
    })

    it('should check persistent cache before slow operations', () => {
      const generatedShellCode = shellcode()

      // Should check file modification times for optimization
      expect(generatedShellCode).toContain('__lp_file_mtime')
      expect(generatedShellCode).toContain('stat ')
      expect(generatedShellCode).toContain('mtime_a')
      expect(generatedShellCode).toContain('now_s - newest')
    })
  })

  describe('Shell Integration Fast Path', () => {
    it('should return early when environment is ready', () => {
      const generatedShellCode = shellcode()

      // Fast path should return early when conditions are met
      expect(generatedShellCode).toContain('return 0')

      // Should have early exit logic for disabled shell integration
      expect(generatedShellCode).toContain('LAUNCHPAD_DISABLE_SHELL_INTEGRATION')
    })

    it('should include optimized binary existence check', () => {
      const generatedShellCode = shellcode()

      // Should have directory existence checks for fast path
      expect(generatedShellCode).toContain('[[ -d "$env_dir/bin" ]]')
      expect(generatedShellCode).toContain('If environment exists, activate it')
    })

    it('should use optimized printf instead of slow commands in fast path', () => {
      const generatedShellCode = shellcode()

      // Should use printf for activation messages
      expect(generatedShellCode).toContain('printf "✅ Environment activated')

      // Should have early return logic
      expect(generatedShellCode).toContain('return 0')
    })
  })

  describe('Development Binary Path Detection', () => {
    it('should detect development binary correctly', () => {
      const generatedShellCode = shellcode()

      // Should reference the launchpad binary appropriately
      // In the generated shell code, it should use 'launchpad' as the command
      expect(generatedShellCode).toContain('launchpad ')
    })
  })

  describe('Cache Duration Configuration', () => {
    it('should use TTL-based cache management', () => {
      const generatedShellCode = shellcode()

      // Should have TTL-based cache management
      expect(generatedShellCode).toContain('ttl_hours')
      expect(generatedShellCode).toContain('3600') // 1 hour calculations
      expect(generatedShellCode).toContain('60 * 60') // 60 minutes backoff
    })

    it('should extend cache for test and development environments', () => {
      const generatedShellCode = shellcode()

      // Should have development environment cache settings
      expect(generatedShellCode).toContain('LAUNCHPAD_GLOBAL_UPDATE_TTL_HOURS')
      expect(generatedShellCode).toContain('default 24')
    })
  })

  describe('System Path Optimization', () => {
    it('should include system path ensuring after global paths', () => {
      const generatedShellCode = shellcode()

      // Should use the append helper for path management
      expect(generatedShellCode).toContain('__lp_append_path')

      // Should handle global bin path management
      expect(generatedShellCode).toContain('global_bin')
    })

    it('should include shell compatibility checks', () => {
      const generatedShellCode = shellcode()

      // Should handle different shell types
      expect(generatedShellCode).toContain('ZSH_VERSION')
      expect(generatedShellCode).toContain('BASH_VERSION')
      expect(generatedShellCode).toContain('chpwd_functions')
    })
  })

  describe('Performance Regression Prevention', () => {
    it('should not include timing debug code in production', () => {
      const generatedShellCode = shellcode()

      // Should not include timing debug statements that slow down execution
      expect(generatedShellCode).not.toContain('TIMING:')
      expect(generatedShellCode).not.toContain('date +%s%N')
      expect(generatedShellCode).not.toContain('echo "DEBUG:')
    })

    it('should minimize filesystem operations in fast path', () => {
      const generatedShellCode = shellcode()

      // Should have background operations to avoid blocking
      expect(generatedShellCode).toContain('>/dev/null 2>&1 &')

      // Should have fast path that returns early
      expect(generatedShellCode).toContain('return 0')

      // Should have background processing
      expect(generatedShellCode).toContain('background')

      // Should use efficient caching mechanisms
      expect(generatedShellCode).toContain('cache_dir')
    })

    it('should ensure cache variables are properly initialized', () => {
      const generatedShellCode = shellcode()

      // Modern cache uses marker files instead of variables
      expect(generatedShellCode).toContain('ready_cache_marker')
      expect(generatedShellCode).toContain('ready_global_marker')
      expect(generatedShellCode).toContain('backoff_marker')
    })
  })

  describe('Integration with Existing Systems', () => {
    it('should maintain compatibility with existing cache systems', () => {
      const generatedShellCode = shellcode()

      // Should work with existing directory-based cache
      expect(generatedShellCode).toContain('cache_dir')
      expect(generatedShellCode).toContain('shell_cache_dir')

      // Should not interfere with timeout handling
      expect(generatedShellCode).toContain('LAUNCHPAD_DISABLE_SHELL_INTEGRATION')
    })

    it('should preserve existing environment variable handling', () => {
      const generatedShellCode = shellcode()

      // Should still handle all the standard environment variables
      expect(generatedShellCode).toContain('LAUNCHPAD_ENV_BIN_PATH')
      expect(generatedShellCode).toContain('LAUNCHPAD_CURRENT_PROJECT')
      expect(generatedShellCode).toContain('LAUNCHPAD_VERBOSE')
    })

    it('should maintain library path updates', () => {
      const generatedShellCode = shellcode()

      // Should still include library path functionality
      expect(generatedShellCode).toContain('__lp_add_unique_colon_path')

      // Should handle all library path variables
      expect(generatedShellCode).toContain('DYLD_LIBRARY_PATH')
      expect(generatedShellCode).toContain('DYLD_FALLBACK_LIBRARY_PATH')
      expect(generatedShellCode).toContain('LD_LIBRARY_PATH')
    })
  })
})
