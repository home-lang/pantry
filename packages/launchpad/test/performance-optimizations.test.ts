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
    it('should include global path caching variables in shell integration', () => {
      const generatedShellCode = shellcode()

      // Should include cache variables
      expect(generatedShellCode).toContain('__launchpad_global_paths_cache=""')
      expect(generatedShellCode).toContain('__launchpad_global_paths_timestamp=0')
    })

    it('should include caching logic in __launchpad_ensure_global_path function', () => {
      const generatedShellCode = shellcode()

      // Should check cache age and use cached paths if recent
      expect(generatedShellCode).toContain('Use cached global paths if they\'re less than 10 minutes old')
      expect(generatedShellCode).toContain('$((current_time - __launchpad_global_paths_timestamp)) -lt 600')

      // Should rebuild cache when expired
      expect(generatedShellCode).toContain('Rebuild global paths cache (expensive operation)')

      // Should cache the discovered paths
      expect(generatedShellCode).toContain('Cache the discovered paths for future use')
      expect(generatedShellCode).toContain('__launchpad_global_paths_cache="$global_paths"')
      expect(generatedShellCode).toContain('__launchpad_global_paths_timestamp="$current_time"')
    })

    it('should use cached paths when available', () => {
      const generatedShellCode = shellcode()

      // Should have fast path that applies cached paths without filesystem operations
      expect(generatedShellCode).toContain('Apply cached paths quickly without expensive filesystem operations')
      expect(generatedShellCode).toContain('for cached_path in $__launchpad_global_paths_cache')
      expect(generatedShellCode).toContain('__launchpad_update_path "$cached_path"')
    })

    it('should avoid expensive find operations when cache is valid', () => {
      const generatedShellCode = shellcode()

      // The expensive find operations should only happen in the cache rebuild section
      const findOperations = (generatedShellCode.match(/find.*-print0/g) || []).length

      // Should have find operations for rebuilding cache, but not in the fast path
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

      // Should check for bin directory, files, and readiness markers
      expect(generatedShellCode).toContain('[[ -d "$env_dir/bin" ]]')
      expect(generatedShellCode).toContain('$(echo "$env_dir/bin"/*)')
      expect(generatedShellCode).toContain('[[ -d "$env_dir/pkgs" || -f "$env_dir/.launchpad_ready" ]]')
    })

    it('should include marker file creation logic', () => {
      const generatedShellCode = shellcode()

      // Should create .launchpad_ready marker files for caching
      expect(generatedShellCode).toContain('.launchpad_ready')
    })

    it('should include persistent cache file logic', () => {
      const generatedShellCode = shellcode()

      // Should create persistent cache files
      expect(generatedShellCode).toContain('env_cache_')
      expect(generatedShellCode).toContain('$HOME/.cache/launchpad/')
      expect(generatedShellCode).toContain('mkdir -p "$(dirname "$cache_file")"')
      expect(generatedShellCode).toContain('touch "$cache_file"')
    })

    it('should check persistent cache before slow operations', () => {
      const generatedShellCode = shellcode()

      // Should check persistent cache file timestamps
      expect(generatedShellCode).toContain('cache_file_time=')
      expect(generatedShellCode).toContain('stat ')
      expect(generatedShellCode).toContain('$((current_time - cache_file_time))')
    })
  })

  describe('Shell Integration Fast Path', () => {
    it('should return early when environment is ready', () => {
      const generatedShellCode = shellcode()

      // Fast path should return 0 immediately when conditions are met
      const fastPathSection = generatedShellCode.substring(
        generatedShellCode.indexOf('If environment exists and has binaries, activate quickly'),
        generatedShellCode.indexOf('Skip setup if we\'ve had too many timeouts'),
      )

      expect(fastPathSection).toContain('return 0')
    })

    it('should include optimized binary existence check', () => {
      const generatedShellCode = shellcode()

      // Should use glob expansion which is faster than ls
      expect(generatedShellCode).toContain('use glob expansion which is faster than ls')
      expect(generatedShellCode).toContain('$(echo "$env_dir/bin"/*)')
      expect(generatedShellCode).toContain('!= "$env_dir/bin/*"')
    })

    it('should use optimized printf instead of slow commands in fast path', () => {
      const generatedShellCode = shellcode()

      // Should use printf for activation messages
      expect(generatedShellCode).toContain('printf "✅ Environment activated')

      // Should have the basic fast path logic
      expect(generatedShellCode).toContain('If environment exists and has binaries, activate quickly')
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
    it('should use longer cache durations for test environments', () => {
      const generatedShellCode = shellcode()

      // Should have different cache durations based on environment type
      expect(generatedShellCode).toContain('cache_duration=')
      expect(generatedShellCode).toContain('3600') // 1 hour for test environments
      expect(generatedShellCode).toContain('1800') // 30 minutes for shell integration
    })

    it('should extend cache for test and development environments', () => {
      const generatedShellCode = shellcode()

      // Should detect test environments and extend cache
      const hasTestEnv = generatedShellCode.includes('"test"') || generatedShellCode.includes('"launchpad"')
      expect(hasTestEnv).toBe(true)
      expect(generatedShellCode).toContain('test/development environments')
    })
  })

  describe('System Path Optimization', () => {
    it('should include system path ensuring after global paths', () => {
      const generatedShellCode = shellcode()

      // Should call system path ensuring in both cached and uncached paths
      expect(generatedShellCode).toContain('__launchpad_ensure_system_path')

      // Should be called in the fast cached path
      const cachedSection = generatedShellCode.substring(
        generatedShellCode.indexOf('Use cached global paths'),
        generatedShellCode.indexOf('Rebuild global paths cache'),
      )
      expect(cachedSection).toContain('__launchpad_ensure_system_path')
    })

    it('should include bash path validation and recovery', () => {
      const generatedShellCode = shellcode()

      // Should check for working bash and prioritize system bash if needed
      expect(generatedShellCode).toContain('ensure system bash is accessible')
      expect(generatedShellCode).toContain('bash --version')
      expect(generatedShellCode).toContain('/bin/bash /usr/bin/bash /usr/local/bin/bash')
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

      // The fast path should have minimal filesystem calls
      const fastPathSection = generatedShellCode.substring(
        generatedShellCode.indexOf('If environment exists and has binaries, activate quickly'),
        generatedShellCode.indexOf('Skip setup if we\'ve had too many timeouts'),
      )

      // Should not have expensive operations like find in fast path
      expect(fastPathSection).not.toContain('find ')
      expect(fastPathSection).not.toContain('ls -A')

      // Should minimize directory scans
      const touchOperations = (fastPathSection.match(/touch /g) || []).length
      expect(touchOperations).toBeLessThanOrEqual(1) // Only for cache file
    })

    it('should ensure cache variables are properly initialized', () => {
      const generatedShellCode = shellcode()

      // All cache variables should be initialized to prevent errors
      expect(generatedShellCode).toContain('__launchpad_global_paths_cache=""')
      expect(generatedShellCode).toContain('__launchpad_global_paths_timestamp=0')
      expect(generatedShellCode).toContain('__launchpad_env_ready_cache=""')
      expect(generatedShellCode).toContain('__launchpad_env_ready_timestamp=0')
    })
  })

  describe('Integration with Existing Systems', () => {
    it('should maintain compatibility with existing cache systems', () => {
      const generatedShellCode = shellcode()

      // Should work with existing directory-based cache
      expect(generatedShellCode).toContain('__launchpad_cache_dir')
      expect(generatedShellCode).toContain('__launchpad_cache_timestamp')

      // Should not interfere with timeout handling
      expect(generatedShellCode).toContain('__launchpad_timeout_count')
    })

    it('should preserve existing environment variable handling', () => {
      const generatedShellCode = shellcode()

      // Should still handle all the standard environment variables
      expect(generatedShellCode).toContain('LAUNCHPAD_ORIGINAL_PATH')
      expect(generatedShellCode).toContain('LAUNCHPAD_ENV_BIN_PATH')
      expect(generatedShellCode).toContain('LAUNCHPAD_PROJECT_DIR')
      expect(generatedShellCode).toContain('LAUNCHPAD_SHOW_ENV_MESSAGES')
    })

    it('should maintain library path updates', () => {
      const generatedShellCode = shellcode()

      // Should still call library path updates in fast path
      expect(generatedShellCode).toContain('__launchpad_update_library_paths')

      // Should handle all library path variables
      expect(generatedShellCode).toContain('DYLD_LIBRARY_PATH')
      expect(generatedShellCode).toContain('DYLD_FALLBACK_LIBRARY_PATH')
      expect(generatedShellCode).toContain('LD_LIBRARY_PATH')
    })
  })
})
