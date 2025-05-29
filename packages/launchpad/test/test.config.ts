/**
 * Comprehensive test configuration for the Launchpad environment isolation test suite
 */

import { Buffer } from 'node:buffer'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

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
   * Clean up launchpad environment directories for test isolation
   */
  static cleanupEnvironmentDirs(): void {
    const envBaseDir = path.join(os.homedir(), '.local', 'share', 'launchpad', 'envs')
    if (fs.existsSync(envBaseDir)) {
      try {
        // Only clean up test-related environment directories
        const envDirs = fs.readdirSync(envBaseDir)
        for (const dir of envDirs) {
          const envPath = path.join(envBaseDir, dir)
          if (fs.statSync(envPath).isDirectory()) {
            // Decode the base64 hash to check if it's a test directory
            try {
              const decodedPath = Buffer.from(dir.replace(/_/g, '/')).toString('base64')
              const realPath = Buffer.from(decodedPath, 'base64').toString()
              if (realPath.includes('launchpad-isolation-test-') || realPath.includes('launchpad-hash-test-') || realPath.includes('launchpad-stub-test-')) {
                fs.rmSync(envPath, { recursive: true, force: true })
              }
            }
            catch {
              // If we can't decode it, it might be from an old test format
              // Only remove if the directory name looks like a test hash
              if (dir.length > 50 && dir.includes('_')) {
                fs.rmSync(envPath, { recursive: true, force: true })
              }
            }
          }
        }
      }
      catch (error) {
        console.warn('Failed to clean up environment directories:', error instanceof Error ? error.message : String(error))
      }
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
      '_pkgx_dev_try_bye',
      '_LAUNCHPAD_ORIGINAL_PATH',
      'dev environment deactivated',
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
