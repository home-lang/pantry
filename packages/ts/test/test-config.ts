/**
 * Comprehensive test configuration for the Launchpad environment isolation test suite
 */

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
 * Create a temporary test directory with a unique name
 */
export async function createTestDirectory(prefix: string): Promise<string> {
  const tempDir = fs.mkdtempSync(path.join(os.tmpdir(), `launchpad-${prefix}-`))
  return tempDir
}

/**
 * Clean up test directories by removing them
 */
export function cleanupTestDirectories(directories: string[]): void {
  for (const dir of directories) {
    try {
      if (fs.existsSync(dir)) {
        fs.rmSync(dir, { recursive: true, force: true })
      }
    }
    catch (error) {
      // Silently ignore cleanup errors in tests
      console.warn(`Warning: Could not clean up test directory ${dir}:`, error)
    }
  }
}
