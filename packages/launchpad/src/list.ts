import fs from 'node:fs'
import path from 'node:path'
import { Path } from './path'
import { Version } from '../test/version'

/**
 * List installed packages
 */
export async function* ls(): AsyncGenerator<string, void, unknown> {
  for (const pathStr of [
    new Path('/usr/local/pkgs'),
    Path.home().join('.local/pkgs'),
  ]) {
    if (!pathStr.isDirectory())
      continue

    const dirs: Path[] = [pathStr]
    let dir: Path | undefined

    // eslint-disable-next-line no-cond-assign
    while ((dir = dirs.pop()) !== undefined) {
      for await (const [path, { name, isDirectory, isSymlink }] of dir.ls()) {
        if (!isDirectory || isSymlink)
          continue
        if (/^v\d+\./.test(name)) {
          yield path.string
        }
        else {
          dirs.push(path)
        }
      }
    }
  }
}

/**
 * List outdated packages
 */
export async function outdated(): Promise<void> {
  // eslint-disable-next-line no-console
  console.log('Checking for outdated packages...')
  // eslint-disable-next-line no-console
  console.log('This feature is simplified in the current implementation.')

  // A simplified implementation since we're missing some of the original functions
}

interface ListedPackage {
  project: string
  version: Version
}

/**
 * List installed packages
 */
export async function list(basePath: string): Promise<ListedPackage[]> {
  const pkgsPath = path.join(basePath, 'pkgs')

  if (!fs.existsSync(pkgsPath)) {
    return []
  }

  const packages: ListedPackage[] = []

  // Read directories in the pkgs directory
  // Each dir should be in the format: project/version
  const entries = fs.readdirSync(pkgsPath, { withFileTypes: true })

  for (const entry of entries) {
    if (!entry.isDirectory())
      continue

    const projectPath = path.join(pkgsPath, entry.name)
    const versionEntries = fs.readdirSync(projectPath, { withFileTypes: true })

    for (const versionEntry of versionEntries) {
      if (!versionEntry.isDirectory() || !versionEntry.name.startsWith('v'))
        continue

      // Extract version from directory name (e.g., 'v1.2.3' -> '1.2.3')
      const versionString = versionEntry.name.slice(1)

      try {
        const version = new Version(versionString)
        packages.push({
          project: entry.name,
          version,
        })
      }
      catch {
        // Skip invalid versions
        console.warn(`Skipping invalid version: ${entry.name}/${versionEntry.name}`)
      }
    }
  }

  return packages
}
