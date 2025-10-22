/**
 * Performance optimization utilities for Launchpad
 *
 * This module provides optimized implementations of common operations
 * that are used throughout the codebase for better performance.
 */

import { existsSync, mkdirSync, readdirSync, statSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import process from 'node:process'

/**
 * Fast directory traversal with early termination
 * Much faster than recursive readdir for finding specific files
 */
export function findFileInDirectoryTree(
  startDir: string,
  fileNames: string[],
  maxDepth: number = 10,
): string | null {
  const fileSet = new Set(fileNames)
  let currentDir = startDir
  let depth = 0

  while (currentDir !== '/' && depth < maxDepth) {
    try {
      // Use readdirSync with withFileTypes for better performance
      const entries = readdirSync(currentDir, { withFileTypes: true })

      for (const entry of entries) {
        if (entry.isFile() && fileSet.has(entry.name)) {
          return currentDir
        }
      }
    }
    catch {
      // Directory not readable, continue up the tree
    }

    currentDir = dirname(currentDir)
    depth++
  }

  return null
}

/**
 * Fast directory size calculation with optional filtering
 * Uses iterative approach instead of recursion for better performance
 */
export function calculateDirectorySize(
  dirPath: string,
  filter?: (fileName: string) => boolean,
): number {
  if (!existsSync(dirPath)) {
    return 0
  }

  let totalSize = 0
  const stack = [dirPath]

  while (stack.length > 0) {
    const currentPath = stack.pop()!

    try {
      const entries = readdirSync(currentPath, { withFileTypes: true })

      for (const entry of entries) {
        const fullPath = join(currentPath, entry.name)

        if (entry.isDirectory()) {
          stack.push(fullPath)
        }
        else if (entry.isFile()) {
          if (!filter || filter(entry.name)) {
            try {
              const stats = statSync(fullPath)
              totalSize += stats.size
            }
            catch {
              // Skip files we can't stat
            }
          }
        }
      }
    }
    catch {
      // Skip directories we can't read
    }
  }

  return totalSize
}

/**
 * Fast file counting with optional filtering
 * Uses iterative approach for better performance
 */
export function countFilesInDirectory(
  dirPath: string,
  filter?: (fileName: string) => boolean,
): number {
  if (!existsSync(dirPath)) {
    return 0
  }

  let count = 0
  const stack = [dirPath]

  while (stack.length > 0) {
    const currentPath = stack.pop()!

    try {
      const entries = readdirSync(currentPath, { withFileTypes: true })

      for (const entry of entries) {
        if (entry.isDirectory()) {
          stack.push(join(currentPath, entry.name))
        }
        else if (entry.isFile()) {
          if (!filter || filter(entry.name)) {
            count++
          }
        }
      }
    }
    catch {
      // Skip directories we can't read
    }
  }

  return count
}

/**
 * Optimized directory creation with better error handling
 * Avoids unnecessary stat calls when possible
 */
export function ensureDirectory(dirPath: string): void {
  try {
    mkdirSync(dirPath, { recursive: true })
  }
  catch (error) {
    // Only check if directory exists if mkdir failed
    if (!existsSync(dirPath)) {
      throw error
    }
  }
}

/**
 * Fast binary search in PATH environment variable
 * More efficient than spawning 'which' command
 */
export function findBinaryInPath(binaryName: string, pathEnv?: string): string | null {
  const paths = (pathEnv || process.env.PATH || '').split(':')

  for (const dir of paths) {
    if (!dir)
      continue

    const binaryPath = join(dir, binaryName)
    try {
      // Use statSync instead of existsSync + accessSync for single syscall
      const stats = statSync(binaryPath)
      if (stats.isFile() && (stats.mode & 0o111)) {
        return binaryPath
      }
    }
    catch {
      // File doesn't exist or not accessible
    }
  }

  return null
}

/**
 * Batch file operations for better performance
 * Reduces syscall overhead when creating multiple files
 */
export function createFiles(files: Array<{ path: string, content: string, mode?: number }>): void {
  for (const file of files) {
    try {
      // Ensure directory exists
      ensureDirectory(dirname(file.path))

      // Write file
      writeFileSync(file.path, file.content)

      // Set permissions if specified
      if (file.mode !== undefined) {
        import('node:fs').then(fs => fs.chmodSync(file.path, file.mode!))
      }
    }
    catch (error) {
      console.warn(`Failed to create file ${file.path}:`, error)
    }
  }
}

/**
 * Performance timer utility for benchmarking
 */
export class PerfTimer {
  private startTime: bigint
  private marks: Map<string, bigint> = new Map()

  constructor() {
    this.startTime = process.hrtime.bigint()
  }

  mark(name: string): void {
    this.marks.set(name, process.hrtime.bigint())
  }

  elapsed(fromMark?: string): number {
    const endTime = process.hrtime.bigint()
    const startTime = fromMark ? this.marks.get(fromMark) || this.startTime : this.startTime
    return Number(endTime - startTime) / 1_000_000 // Convert to milliseconds
  }

  elapsedBetween(startMark: string, endMark: string): number {
    const start = this.marks.get(startMark)
    const end = this.marks.get(endMark)

    if (!start || !end) {
      throw new Error(`Mark not found: ${!start ? startMark : endMark}`)
    }

    return Number(end - start) / 1_000_000 // Convert to milliseconds
  }

  report(): Record<string, number> {
    const report: Record<string, number> = {}
    const currentTime = process.hrtime.bigint()

    report.total = Number(currentTime - this.startTime) / 1_000_000

    for (const [name, time] of this.marks) {
      report[name] = Number(time - this.startTime) / 1_000_000
    }

    return report
  }
}

/**
 * Debounced function execution for performance optimization
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null

  return (...args: Parameters<T>) => {
    if (timeout) {
      clearTimeout(timeout)
    }

    timeout = setTimeout(() => {
      func(...args)
    }, wait)
  }
}

/**
 * Memoization utility for expensive operations
 */
export function memoize<T extends (...args: any[]) => any>(
  func: T,
  keyGenerator?: (...args: Parameters<T>) => string,
): T {
  const cache = new Map<string, ReturnType<T>>()

  return ((...args: Parameters<T>): ReturnType<T> => {
    const key = keyGenerator ? keyGenerator(...args) : JSON.stringify(args)

    if (cache.has(key)) {
      return cache.get(key)!
    }

    const result = func(...args)
    cache.set(key, result)
    return result
  }) as T
}
