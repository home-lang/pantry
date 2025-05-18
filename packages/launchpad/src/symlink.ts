import type { Version } from './version'
import { semver } from 'bun'
import fs from 'node:fs'
import path from 'node:path'
import { config } from './config'
import { parseVersion } from './version'

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

  // Collect versions per major version
  const major_versions: Record<string, string> = {}

  // Sort versions by semver order and find the latest for each major version
  versions.sort((a, b) => {
    return semver.order(a.version.toString(), b.version.toString())
  })

  // For each version, update the major_versions record if it's newer
  for (const { name, version } of versions) {
    const majorKey = `${version.major}`
    if (!major_versions[majorKey]
      || semver.order(version.toString(), major_versions[majorKey]) > 0) {
      major_versions[majorKey] = name
    }
  }

  // Create symlinks for the latest version in each major version
  for (const [key, versionName] of Object.entries(major_versions)) {
    symlink_with_overwrite(versionName, path.join(shelf, `v${key}`))
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
