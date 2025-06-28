import type { Version } from '../test/version'
import fs from 'node:fs'
import path from 'node:path'
import { parseVersion } from '../test/version'
import { config } from './config'

// Use Bun's semver with proper error handling and pre-release aware fallback
const semver = {
  order: (a: string, b: string): -1 | 0 | 1 => {
    try {
      // Try to use global Bun if available (which it should be in Bun runtime)
      if (typeof Bun !== 'undefined' && Bun.semver) {
        return Bun.semver.order(a, b)
      }
      // Fallback to manual semver-aware comparison
      return compareSemver(a, b)
    }
    catch {
      // Fallback to manual semver-aware comparison
      return compareSemver(a, b)
    }
  },
}

// Manual semver comparison that understands pre-release versions
function compareSemver(a: string, b: string): -1 | 0 | 1 {
  const parseVersion = (version: string) => {
    const match = version.match(/^(\d+)\.(\d+)\.(\d+)(?:-([^+]+))?(?:\+(.+))?$/)
    if (!match) {
      // Fallback to string comparison for non-semver
      return null
    }

    const [, major, minor, patch, prerelease] = match
    return {
      major: Number.parseInt(major, 10),
      minor: Number.parseInt(minor, 10),
      patch: Number.parseInt(patch, 10),
      prerelease: prerelease || null,
    }
  }

  const versionA = parseVersion(a)
  const versionB = parseVersion(b)

  // If either version is invalid, fall back to string comparison
  if (!versionA || !versionB) {
    return a.localeCompare(b, undefined, { numeric: true, sensitivity: 'base' }) as -1 | 0 | 1
  }

  // Compare major.minor.patch
  if (versionA.major !== versionB.major) {
    return versionA.major < versionB.major ? -1 : 1
  }
  if (versionA.minor !== versionB.minor) {
    return versionA.minor < versionB.minor ? -1 : 1
  }
  if (versionA.patch !== versionB.patch) {
    return versionA.patch < versionB.patch ? -1 : 1
  }

  // Handle pre-release versions
  // Stable version (no prerelease) > pre-release version
  if (!versionA.prerelease && versionB.prerelease)
    return 1
  if (versionA.prerelease && !versionB.prerelease)
    return -1
  if (!versionA.prerelease && !versionB.prerelease)
    return 0

  // Both have pre-release, compare lexically
  return versionA.prerelease!.localeCompare(versionB.prerelease!) as -1 | 0 | 1
}

/**
 * Symlink a directory structure
 */
export async function symlink(src: string, dst: string): Promise<void> {
  for (const base of [
    'bin',
    'sbin',
    'share',
    'lib',
    'libexec',
    'var',
    'etc',
    'ssl', // FIXME for ca-certs
  ]) {
    const foo = path.join(src, base)
    if (fs.existsSync(foo)) {
      await processEntry(foo, path.join(dst, base))
    }
  }

  async function processEntry(sourcePath: string, targetPath: string): Promise<void> {
    const fileInfo = fs.statSync(sourcePath, { throwIfNoEntry: false })
    if (!fileInfo)
      return

    if (fileInfo.isDirectory()) {
      // Create the target directory
      fs.mkdirSync(targetPath, { recursive: true })

      // Recursively process the contents of the directory
      for (const entry of fs.readdirSync(sourcePath)) {
        const entrySourcePath = path.join(sourcePath, entry)
        const entryTargetPath = path.join(targetPath, entry)
        await processEntry(entrySourcePath, entryTargetPath)
      }
    }
    else {
      // reinstall
      if (fs.existsSync(targetPath)) {
        fs.unlinkSync(targetPath)
      }
      symlink_with_overwrite(sourcePath, targetPath)
    }
  }
}

/**
 * Create version symlinks
 */
export async function create_v_symlinks(prefix: string): Promise<void> {
  const shelf = path.dirname(prefix)

  // Collect valid versions
  const versions: { name: string, version: Version }[] = []
  for (const name of fs.readdirSync(shelf, { withFileTypes: true })) {
    if (name.isSymbolicLink())
      continue
    if (!name.isDirectory())
      continue
    if (name.name === 'var')
      continue
    if (!name.name.startsWith('v'))
      continue
    if (/^v\d+$/.test(name.name))
      continue // pcre.org/v2

    const version = parseVersion(name.name)
    if (version) {
      versions.push({ name: name.name, version })
    }
  }

  // Group versions by major version
  const major_versions: Record<string, { name: string, version: Version }> = {}

  // For each version, choose the best one for each major version
  for (const versionData of versions) {
    const majorKey = `${versionData.version.major}`
    const existing = major_versions[majorKey]

    if (!existing) {
      // First version for this major version
      major_versions[majorKey] = versionData
    }
    else {
      // Compare this version with the existing one
      // Use the raw version string (without 'v' prefix) for comparison
      const currentVersionStr = versionData.name.slice(1) // Remove 'v' prefix
      const existingVersionStr = existing.name.slice(1) // Remove 'v' prefix

      const comparison = semver.order(currentVersionStr, existingVersionStr)
      if (comparison > 0) {
        // Current version is newer, replace
        major_versions[majorKey] = versionData
      }
    }
  }

  // Create symlinks for the chosen version in each major version
  for (const [key, versionData] of Object.entries(major_versions)) {
    symlink_with_overwrite(versionData.name, path.join(shelf, `v${key}`))
  }
}

/**
 * Create a symlink, overwriting if necessary
 */
export function symlink_with_overwrite(src: string, dst: string): void {
  if (fs.existsSync(dst) && fs.lstatSync(dst).isSymbolicLink()) {
    fs.unlinkSync(dst)
  }
  try {
    fs.symlinkSync(src, dst)
  }
  catch (error) {
    if (config.verbose)
      console.error(`Failed to create symlink from ${src} to ${dst}:`, error)
  }
}
