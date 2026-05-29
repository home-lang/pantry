import type { FreezerMatcher } from './freezerignore'
import fs from 'node:fs'
import path from 'node:path'

/** An entry included in the build context. */
export interface ContextEntry {
  /** POSIX path relative to the context root. */
  relPath: string
  /** Absolute path on disk. */
  absPath: string
  /** True for directories. */
  isDir: boolean
  /** True for symlinks (preserved as symlinks in layers). */
  isSymlink: boolean
}

/**
 * Walk the build context, applying the freezer matcher. Directories that are
 * themselves ignored are pruned (their contents are skipped) unless a later
 * negation rule re-includes a descendant — in which case we still descend so
 * the re-included file is reachable.
 */
export function collectBuildContext(contextDir: string, matcher: FreezerMatcher): ContextEntry[] {
  const root = path.resolve(contextDir)
  const entries: ContextEntry[] = []

  // Does any negation rule exist? If so we cannot blindly prune ignored dirs,
  // because a `!keep/this` could live under an ignored parent.
  const hasNegations = matcher.rules.some(r => r.negated)

  function walk(absDir: string, relDir: string): void {
    let dirents: fs.Dirent[]
    try {
      dirents = fs.readdirSync(absDir, { withFileTypes: true })
    }
    catch {
      return
    }
    for (const dirent of dirents) {
      const relPath = relDir ? `${relDir}/${dirent.name}` : dirent.name
      const absPath = path.join(absDir, dirent.name)
      const isSymlink = dirent.isSymbolicLink()
      const isDir = dirent.isDirectory() && !isSymlink
      const ignored = matcher.ignores(relPath)

      if (isDir) {
        if (ignored && !hasNegations)
          continue
        // Include the dir entry only when not ignored; always descend when
        // negations might re-include something deeper.
        if (!ignored)
          entries.push({ relPath, absPath, isDir: true, isSymlink: false })
        walk(absPath, relPath)
      }
      else {
        if (ignored)
          continue
        entries.push({ relPath, absPath, isDir: false, isSymlink })
      }
    }
  }

  walk(root, '')
  // Stable, deterministic ordering for reproducible layer digests.
  entries.sort((a, b) => (a.relPath < b.relPath ? -1 : a.relPath > b.relPath ? 1 : 0))
  return entries
}
