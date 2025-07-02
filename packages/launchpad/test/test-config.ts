import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'

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
