/**
 * **spawn.link** - a featureful union filesystem
 *
 * @domain `spawn.link`
 * @programs `mergerfs`, `mergerfs-fusermount`, `mount.mergerfs`
 * @version `2.41.1` (11 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install spawn.link`
 * @homepage https://trapexit.github.io/mergerfs/
 * @buildDependencies `python.org@>=3<3.12` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.spawnlink
 * console.log(pkg.name)        // "spawn.link"
 * console.log(pkg.description) // "a featureful union filesystem"
 * console.log(pkg.programs)    // ["mergerfs", "mergerfs-fusermount", ...]
 * console.log(pkg.versions[0]) // "2.41.1" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/spawn-link.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const spawnlinkPackage = {
  /**
  * The display name of this package.
  */
  name: 'spawn.link' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'spawn.link' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'a featureful union filesystem' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/spawn.link/package.yml' as const,
  homepageUrl: 'https://trapexit.github.io/mergerfs/' as const,
  githubUrl: 'https://github.com/trapexit/mergerfs' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install spawn.link' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +spawn.link -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install spawn.link' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'mergerfs',
    'mergerfs-fusermount',
    'mount.mergerfs',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'python.org@>=3<3.12',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2.41.1',
    '2.41.0',
    '2.40.2',
    '2.40.1',
    '2.40.0',
    '2.39.0',
    '2.38.0',
    '2.37.1',
    '2.37.0',
    '2.36.0',
    '2.35.1',
    '2.35.0',
    '2.34.1',
    '2.34.0',
    '2.33.5',
    '2.33.4',
    '2.33.3',
    '2.33.2',
    '2.33.1',
    '2.33.0',
    '2.32.6',
    '2.32.5',
    '2.32.4',
    '2.32.3',
    '2.32.2',
    '2.32.1',
    '2.31.0',
    '2.30.0',
    '2.29.0',
    '2.28.3',
    '2.28.2',
    '2.28.1',
    '2.28.0',
    '2.27.1',
    '2.27.0',
    '2.26.2',
    '2.26.1',
    '2.26.0',
    '2.25.1',
    '2.24.2',
    '2.24.1',
    '2.24.0',
    '2.23.1',
    '2.23.0',
    '2.22.1',
    '2.22.0',
    '2.21.0',
    '2.20.0',
  ] as const,
  aliases: [] as const,
}

export type SpawnlinkPackage = typeof spawnlinkPackage
