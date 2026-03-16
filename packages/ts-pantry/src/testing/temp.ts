/**
 * Temp directory and file helpers with automatic cleanup.
 *
 * All temp dirs created via `createTempDir` are tracked and automatically
 * removed on process exit (SIGINT, SIGTERM, uncaughtException, normal exit).
 */
import { existsSync, mkdirSync, mkdtempSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'

const trackedDirs = new Set<string>()
let cleanupRegistered = false

function registerCleanup(): void {
  if (cleanupRegistered) return
  cleanupRegistered = true

  const cleanup = () => {
    for (const dir of trackedDirs) {
      try {
        if (existsSync(dir)) rmSync(dir, { recursive: true, force: true })
      }
      catch { /* best-effort */ }
    }
    trackedDirs.clear()
  }

  process.on('exit', cleanup)
  process.on('SIGINT', () => { cleanup(); process.exit(130) })
  process.on('SIGTERM', () => { cleanup(); process.exit(143) })
}

/** Create a tracked temp directory. Auto-cleaned on process exit. */
export function createTempDir(prefix = 'pantry-test-'): string {
  registerCleanup()
  const dir = mkdtempSync(join(tmpdir(), prefix))
  trackedDirs.add(dir)
  return dir
}

/** Manually remove and untrack a temp directory. */
export function removeTempDir(dir: string): void {
  trackedDirs.delete(dir)
  try {
    if (existsSync(dir)) rmSync(dir, { recursive: true, force: true })
  }
  catch { /* best-effort */ }
}

/** Run a function with a scoped temp dir. Always cleaned up, even on error. */
export async function withTempDir<T>(prefix: string, fn: (dir: string) => Promise<T> | T): Promise<T> {
  const dir = createTempDir(prefix)
  try { return await fn(dir) }
  finally { removeTempDir(dir) }
}

/** Synchronous version of withTempDir. */
export function withTempDirSync<T>(prefix: string, fn: (dir: string) => T): T {
  const dir = createTempDir(prefix)
  try { return fn(dir) }
  finally { removeTempDir(dir) }
}

/** Create a file inside a directory, creating intermediate dirs as needed. */
export function createTestFile(baseDir: string, relativePath: string, content: string): string {
  const fullPath = join(baseDir, relativePath)
  const parentDir = fullPath.substring(0, fullPath.lastIndexOf('/'))
  if (parentDir && !existsSync(parentDir)) mkdirSync(parentDir, { recursive: true })
  writeFileSync(fullPath, content)
  return fullPath
}

/** Create a directory inside a base dir, creating intermediates as needed. */
export function createTestDir(baseDir: string, relativePath: string): string {
  const fullPath = join(baseDir, relativePath)
  mkdirSync(fullPath, { recursive: true })
  return fullPath
}
