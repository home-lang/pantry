/**
 * **spawn.link** - a featureful union filesystem
 *
 * @domain `spawn.link`
 * @programs `mergerfs`, `mergerfs-fusermount`, `mount.mergerfs`
 * @version `2.41.1` (11 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install spawn.link`
 * @homepage https://trapexit.github.io/mergerfs/
 * @buildDependencies `python.org@>=3<3.12` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.spawnlink
 * console.log(pkg.name)        // "spawn.link"
 * console.log(pkg.description) // "a featureful union filesystem"
 * console.log(pkg.programs)    // ["mergerfs", "mergerfs-fusermount", ...]
 * console.log(pkg.versions[0]) // "2.41.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/spawn-link.md
 * @see https://ts-pkgx.netlify.app/usage
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
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install spawn.link' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +spawn.link -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install spawn.link' as const,
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
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
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
  ] as const,
  aliases: [] as const,
}

export type SpawnlinkPackage = typeof spawnlinkPackage
