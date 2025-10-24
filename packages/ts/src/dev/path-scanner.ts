import { existsSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

/**
 * Fast library path scanning using Bun's efficient filesystem operations
 * Replaces expensive shell find operations with direct filesystem calls
 */
export async function scanLibraryPaths(envDir: string): Promise<string[]> {
  const libPaths: string[] = []

  if (!existsSync(envDir)) {
    return libPaths
  }

  try {
    // Add direct lib directories first (fast path)
    for (const libDir of ['lib', 'lib64']) {
      const fullLibDir = join(envDir, libDir)
      if (existsSync(fullLibDir)) {
        libPaths.push(fullLibDir)
      }
    }

    // Scan for package-specific library directories efficiently
    const entries = readdirSync(envDir, { withFileTypes: true })

    for (const entry of entries) {
      if (!entry.isDirectory())
        continue

      const domainName = entry.name

      // Skip known non-package directories
      if (['bin', 'sbin', 'lib', 'lib64', 'share', 'include', 'etc', 'pkgs', '.tmp', '.cache'].includes(domainName)) {
        continue
      }

      const domainDir = join(envDir, domainName)

      try {
        // Find version directories efficiently
        const versionEntries = readdirSync(domainDir, { withFileTypes: true })

        for (const versionEntry of versionEntries) {
          if (!versionEntry.isDirectory() || !versionEntry.name.startsWith('v'))
            continue

          const versionDir = join(domainDir, versionEntry.name)

          // Check for lib directories in this version
          for (const libDir of ['lib', 'lib64']) {
            const libPath = join(versionDir, libDir)
            if (existsSync(libPath)) {
              // Validate that this lib directory has actual library files
              if (await hasValidLibraries(libPath, domainName, versionDir)) {
                libPaths.push(libPath)
              }
            }
          }
        }
      }
      catch {
        // Skip directories we can't read
        continue
      }
    }
  }
  catch {
    // If we can't read the env directory, return what we have
  }

  return libPaths
}

/**
 * Fast global path scanning using Bun's efficient filesystem operations
 * Replaces expensive shell find operations with direct filesystem calls
 */
export async function scanGlobalPaths(globalDir: string): Promise<string[]> {
  const globalPaths: string[] = []

  if (!existsSync(globalDir)) {
    return globalPaths
  }

  try {
    // Add standard global binary directories first (fast path)
    for (const binDir of ['bin', 'sbin']) {
      const fullBinDir = join(globalDir, binDir)
      if (existsSync(fullBinDir)) {
        globalPaths.push(fullBinDir)
      }
    }

    // Scan for package-specific binary directories efficiently
    const entries = readdirSync(globalDir, { withFileTypes: true })

    for (const entry of entries) {
      if (!entry.isDirectory())
        continue

      const domainName = entry.name

      // Skip known non-package directories
      if (['bin', 'sbin', 'lib', 'lib64', 'share', 'include', 'etc', 'pkgs', '.tmp', '.cache'].includes(domainName)) {
        continue
      }

      const domainDir = join(globalDir, domainName)

      try {
        // Find latest version directory efficiently
        const versionEntries = readdirSync(domainDir, { withFileTypes: true })
        const versionDirs = versionEntries
          .filter(entry => entry.isDirectory() && entry.name.startsWith('v'))
          .map(entry => entry.name)
          .sort((a, b) => {
            // Simple version sort - extract numbers and compare
            const aNum = a.slice(1).split('.').map(n => Number.parseInt(n, 10) || 0)
            const bNum = b.slice(1).split('.').map(n => Number.parseInt(n, 10) || 0)

            for (let i = 0; i < Math.max(aNum.length, bNum.length); i++) {
              const aPart = aNum[i] || 0
              const bPart = bNum[i] || 0
              if (aPart !== bPart) {
                return aPart - bPart
              }
            }
            return 0
          })

        // Use the latest version
        const latestVersion = versionDirs[versionDirs.length - 1]
        if (latestVersion) {
          const versionDir = join(domainDir, latestVersion)

          // Check for binary directories in this version
          for (const binDir of ['bin', 'sbin']) {
            const binPath = join(versionDir, binDir)
            if (existsSync(binPath)) {
              globalPaths.push(binPath)
            }
          }
        }
      }
      catch {
        // Skip directories we can't read
        continue
      }
    }
  }
  catch {
    // If we can't read the global directory, return what we have
  }

  return globalPaths
}

/**
 * Validate that a library directory has actual library files
 * Uses fast filesystem operations instead of expensive find commands
 */
async function hasValidLibraries(libDir: string, domainName: string, versionDir: string): Promise<boolean> {
  try {
    const entries = readdirSync(libDir, { withFileTypes: true })

    // Check for common library patterns
    for (const entry of entries) {
      if (!entry.isFile())
        continue

      const name = entry.name

      // Check for common library file extensions with reasonable size
      if (name.endsWith('.dylib') || name.endsWith('.so') || name.includes('.so.') || name.endsWith('.a')) {
        // Quick size check - library files should be larger than 100 bytes
        try {
          const stats = await Bun.file(join(libDir, name)).size
          if (stats > 100) {
            return true
          }
        }
        catch {
          // If we can't get size, assume it's valid
          return true
        }
      }
    }

    // Special case: If this is a source-built package (like PHP), always include it
    if (domainName === 'php.net' && existsSync(join(versionDir, 'bin', 'php'))) {
      return true
    }

    return false
  }
  catch {
    return false
  }
}

/**
 * Fast environment readiness check
 * Replaces expensive shell operations with direct filesystem calls
 */
export async function checkEnvironmentReady(envDir: string): Promise<{
  ready: boolean
  binExists: boolean
  hasLibraries: boolean
}> {
  const binDir = join(envDir, 'bin')
  const binExists = existsSync(binDir)

  let hasLibraries = false
  try {
    const libPaths = await scanLibraryPaths(envDir)
    hasLibraries = libPaths.length > 0
  }
  catch {
    hasLibraries = false
  }

  return {
    ready: binExists, // Environment is ready if bin directory exists
    binExists,
    hasLibraries,
  }
}
