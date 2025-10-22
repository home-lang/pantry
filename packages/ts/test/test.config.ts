/**
 * Comprehensive test configuration for the Launchpad environment isolation test suite
 */

import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'

export const TEST_CONFIG = {
  // Test timeouts
  DEFAULT_TIMEOUT: 30000,
  SLOW_TIMEOUT: 60000,
  VERY_SLOW_TIMEOUT: 90000,

  // Test packages that are known to work
  RELIABLE_PACKAGES: {
    NGINX: 'nginx.org@1.28.0',
    WGET: 'gnu.org/wget@1.21.0',
    CURL: 'curl.se@8.0.0',
  },

  // Test packages that are known to fail (for error testing)
  INVALID_PACKAGES: {
    NONEXISTENT: 'completely-nonexistent-package-12345@1.0.0',
    INVALID_URL: 'wget.com@1.0.0', // Should suggest gnu.org/wget
    MALFORMED: 'invalid-package-name',
  },

  // Environment variables for testing
  TEST_ENV_VARS: {
    SIMPLE: { TEST_VAR: 'test_value' },
    COMPLEX: {
      COMPLEX_VAR: 'value with spaces and $symbols',
      PATH_VAR: '/some/path:/another/path',
      EMPTY_VAR: '',
    },
    MULTIPLE: {
      TEST_VAR1: 'value1',
      TEST_VAR2: 'value2',
      PROJECT_NAME: 'test-project',
      BUILD_ENV: 'testing',
    },
  },
} as const

/**
 * Test utilities for common operations
 */
export class TestUtils {
  /**
   * Reset global state to ensure test isolation
   */
  static resetGlobalState(): void {
    try {
      // Reset install module state
      // eslint-disable-next-line ts/no-require-imports
      const { resetInstalledTracker } = require('../src/install')
      resetInstalledTracker()
    }
    catch {
      // Ignore if install module is not available
    }

    try {
      // Reset service manager state
      // eslint-disable-next-line ts/no-require-imports
      const serviceManager = require('../src/services/manager')
      if (serviceManager.serviceManagerState) {
        serviceManager.serviceManagerState = null
      }
    }
    catch {
      // Ignore if service manager is not available
    }

    // Reset shell integration environment variables
    delete process.env.LAUNCHPAD_CURRENT_PROJECT
    delete process.env.LAUNCHPAD_ORIGINAL_PATH
    delete process.env.LAUNCHPAD_ORIGINAL_DYLD_LIBRARY_PATH
    delete process.env.LAUNCHPAD_ORIGINAL_DYLD_FALLBACK_LIBRARY_PATH
    delete process.env.LAUNCHPAD_ORIGINAL_LD_LIBRARY_PATH
    delete process.env.LAUNCHPAD_SHELL_INTEGRATION
    delete process.env.LAUNCHPAD_SHOW_ENV_MESSAGES
    delete process.env.LAUNCHPAD_SHELL_ACTIVATION_MESSAGE
    delete process.env.LAUNCHPAD_SHELL_DEACTIVATION_MESSAGE
    delete process.env.LAUNCHPAD_ALLOW_NETWORK

    // Reset test environment variables that might affect behavior
    delete process.env.SUDO_PASSWORD
    delete process.env.LAUNCHPAD_AUTO_SUDO
    delete process.env.LAUNCHPAD_AUTO_ADD_PATH
    delete process.env.LAUNCHPAD_SERVICES_ENABLED
    delete process.env.LAUNCHPAD_DISABLE_SHELL_INTEGRATION

    // Ensure NODE_ENV is consistent for tests
    process.env.NODE_ENV = 'test'
  }

  /**
   * Clean up launchpad environment directories for test isolation
   * IMPORTANT: This only cleans project-specific environments, NOT global dependencies
   */
  static cleanupEnvironmentDirs(): void {
    // Only clean project-specific environments, not global dependencies
    // This prevents tests from removing system-wide tools
    const envBaseDir = path.join(os.homedir(), '.local', 'share', 'launchpad', 'envs')
    const _globalDir = path.join(os.homedir(), '.local', 'share', 'launchpad', 'global')

    // CRITICAL: Never touch the global directory in tests
    if (!fs.existsSync(envBaseDir)) {
      return
    }

    // Double-check we're not accidentally cleaning global dependencies
    if (envBaseDir.includes('global')) {
      console.error('SAFETY CHECK: Refusing to cleanup global dependencies directory')
      return
    }

    try {
      // Get all environment directories
      const envDirs = fs.readdirSync(envBaseDir)

      // Use a more efficient approach - just check for test-related patterns
      // without expensive base64 decoding
      for (const dir of envDirs) {
        const envPath = path.join(envBaseDir, dir)

        try {
          if (!fs.statSync(envPath).isDirectory()) {
            continue
          }

          // Quick pattern matching for test directories without base64 decoding
          // Test directories typically have long base64-like names with underscores
          const isTestDir = (
            dir.length > 50 // Test hashes are typically long
            && dir.includes('_') // Base64 replacement character
            && /^\w+$/.test(dir) // Only base64-safe characters
          )

          if (isTestDir) {
            fs.rmSync(envPath, { recursive: true, force: true })
          }
        }
        catch {
          // Skip individual directory errors but continue cleanup
          continue
        }
      }
    }
    catch {
      // Silently ignore cleanup errors to avoid test noise
      // Tests should still pass even if cleanup fails
    }
  }

  /**
   * Comprehensive environment reset for test isolation
   */
  static resetTestEnvironment(): void {
    // Reset global state
    this.resetGlobalState()

    // Clean up environment directories
    this.cleanupEnvironmentDirs()

    // Reset cache directories
    const cacheDir = path.join(os.homedir(), '.cache', 'launchpad')
    if (fs.existsSync(cacheDir)) {
      try {
        fs.rmSync(cacheDir, { recursive: true, force: true })
      }
      catch {
        // Ignore cleanup errors
      }
    }

    // Clear shell integration cache
    const shellCacheDir = path.join(os.homedir(), '.cache', 'launchpad', 'shell_cache')
    if (fs.existsSync(shellCacheDir)) {
      try {
        fs.rmSync(shellCacheDir, { recursive: true, force: true })
      }
      catch {
        // Ignore cleanup errors
      }
    }

    // Reset file system mocks if running in test environment
    if (typeof globalThis !== 'undefined' && 'jest' in globalThis) {
      try {
        const jestGlobal = globalThis as any
        jestGlobal.jest?.restoreAllMocks?.()
      }
      catch {
        // Not in Jest environment
      }
    }
  }

  /**
   * Master test isolation function for maximum test separation
   * Should be called before any test suite runs
   */
  static async ensureCompleteTestIsolation(): Promise<void> {
    // Comprehensive environment reset
    this.resetTestEnvironment()

    // Force garbage collection if available
    if ((globalThis as any).gc) {
      (globalThis as any).gc()
    }

    // Clear module cache for critical modules to prevent state leakage
    const moduleKeys = Object.keys(require.cache).filter(key =>
      key.includes('launchpad')
      && !key.includes('node_modules')
      && (key.includes('/src/') || key.includes('/dist/')),
    )

    moduleKeys.forEach((key) => {
      delete require.cache[key]
    })

    // Reset working directory to test directory
    try {
      process.chdir(path.resolve(__dirname, '..'))
    }
    catch {
      // Ignore if already in the right directory
    }

    // Force a small delay to ensure async operations complete
    await new Promise(resolve => setTimeout(resolve, 10))
  }

  /**
   * Configure test environment for isolated execution
   */
  static configureTestEnvironment(): void {
    // Ensure test environment variables are set consistently
    process.env.NODE_ENV = 'test'
    process.env.LAUNCHPAD_DISABLE_SHELL_INTEGRATION = '1'
    process.env.LAUNCHPAD_SHOW_ENV_MESSAGES = 'false'

    // Disable network operations by default in tests
    delete process.env.LAUNCHPAD_ALLOW_NETWORK

    // Set consistent test timeouts for Jest if available
    if (typeof globalThis !== 'undefined' && 'jest' in globalThis) {
      const jestGlobal = globalThis as any
      jestGlobal.jest?.setTimeout?.(30000)
    }
  }

  /**
   * Generate a realistic hash for a given path (matching the actual implementation)
   */
  static generateHash(projectPath: string): string {
    let realPath: string
    try {
      realPath = fs.realpathSync(projectPath)
    }
    catch {
      // For test paths that don't exist, use the path as-is
      realPath = projectPath
    }
    return Buffer.from(realPath).toString('base64').replace(/[/+=]/g, '_')
  }

  /**
   * Create a standard dependencies.yaml file
   */
  static createDepsYaml(dir: string, packages: string[], env?: Record<string, string>): void {
    const depsSection = `dependencies:\n${packages.map(pkg => `  - ${pkg}`).join('\n')}`
    const envSection = env ? `\nenv:\n${Object.entries(env).map(([key, value]) => `  ${key}: ${value}`).join('\n')}` : ''
    const content = depsSection + envSection
    fs.writeFileSync(path.join(dir, 'deps.yaml'), content)
  }

  /**
   * Verify that two paths would generate different hashes (core isolation test)
   */
  static verifyHashUniqueness(pathA: string, pathB: string): void {
    const hashA = this.generateHash(pathA)
    const hashB = this.generateHash(pathB)

    if (hashA === hashB) {
      throw new Error(`Hash collision detected between:\n  ${pathA}\n  ${pathB}\nBoth generate hash: ${hashA}`)
    }

    // Verify hashes are of sufficient length (no truncation)
    if (hashA.length <= 16 || hashB.length <= 16) {
      throw new Error(`Hash too short (possible truncation):\n  ${pathA} -> ${hashA} (${hashA.length} chars)\n  ${pathB} -> ${hashB} (${hashB.length} chars)`)
    }
  }

  /**
   * Check if a file contains the expected environment isolation patterns
   */
  static verifyEnvironmentIsolationOutput(output: string, expectedPaths: string[]): boolean {
    const requiredPatterns = [
      'Project-specific environment',
      '_launchpad_dev_try_bye',
      '_LAUNCHPAD_ORIGINAL_PATH',
      'Environment deactivated',
    ]

    // Check all required patterns exist
    for (const pattern of requiredPatterns) {
      if (!output.includes(pattern)) {
        console.warn(`Missing required pattern: ${pattern}`)
        return false
      }
    }

    // Check that expected paths are present
    for (const expectedPath of expectedPaths) {
      if (!output.includes(expectedPath)) {
        console.warn(`Missing expected path: ${expectedPath}`)
        return false
      }
    }

    return true
  }
}

/**
 * Test fixtures for common test scenarios
 */
export const TEST_FIXTURES: {
  readonly NGINX_PROJECT: {
    readonly packages: readonly string[]
    readonly env: Record<string, string>
  }
  readonly MULTI_PACKAGE_PROJECT: {
    readonly packages: readonly string[]
    readonly env: Record<string, string>
  }
  readonly COMPLEX_ENV_PROJECT: {
    readonly packages: readonly string[]
    readonly env: Record<string, string>
  }
  readonly FAILING_PROJECT: {
    readonly packages: readonly string[]
    readonly env: Record<string, string>
  }
} = {
  /**
   * Standard project setup with nginx
   */
  NGINX_PROJECT: {
    packages: [TEST_CONFIG.RELIABLE_PACKAGES.NGINX] as const,
    env: TEST_CONFIG.TEST_ENV_VARS.SIMPLE,
  },

  /**
   * Multi-package project
   */
  MULTI_PACKAGE_PROJECT: {
    packages: [TEST_CONFIG.RELIABLE_PACKAGES.NGINX, TEST_CONFIG.RELIABLE_PACKAGES.WGET] as const,
    env: TEST_CONFIG.TEST_ENV_VARS.MULTIPLE,
  },

  /**
   * Project with complex environment variables
   */
  COMPLEX_ENV_PROJECT: {
    packages: [TEST_CONFIG.RELIABLE_PACKAGES.NGINX] as const,
    env: TEST_CONFIG.TEST_ENV_VARS.COMPLEX,
  },

  /**
   * Project that should fail (for error testing)
   */
  FAILING_PROJECT: {
    packages: [TEST_CONFIG.INVALID_PACKAGES.NONEXISTENT] as const,
    env: {},
  },
} as const

export default TEST_CONFIG
