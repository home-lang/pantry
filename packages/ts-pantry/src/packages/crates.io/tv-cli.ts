/**
 * **tv** - Format json into table view
 *
 * @domain `crates.io/tv-cli`
 * @programs `tv`
 * @version `0.7.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/tv-cli`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiotvcli
 * console.log(pkg.name)        // "tv"
 * console.log(pkg.description) // "Format json into table view"
 * console.log(pkg.programs)    // ["tv"]
 * console.log(pkg.versions[0]) // "0.7.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/tv-cli.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiotvcliPackage = {
  /**
   * The display name of this package.
   */
  name: 'tv' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/tv-cli' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Format json into table view' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/tv-cli/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/uzimaru0000/tv' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/tv-cli' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/tv-cli -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/tv-cli' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'tv',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.7.0',
  ] as const,
  aliases: [] as const,
}

export type CratesiotvcliPackage = typeof cratesiotvcliPackage
