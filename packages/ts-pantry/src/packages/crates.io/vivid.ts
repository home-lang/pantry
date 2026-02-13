/**
 * **vivid** - Generator for LS_COLORS with support for multiple color themes
 *
 * @domain `crates.io/vivid`
 * @programs `vivid`
 * @version `0.10.1` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/vivid`
 * @dependencies `zlib.net^1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiovivid
 * console.log(pkg.name)        // "vivid"
 * console.log(pkg.description) // "Generator for LS_COLORS with support for multip..."
 * console.log(pkg.programs)    // ["vivid"]
 * console.log(pkg.versions[0]) // "0.10.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/vivid.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiovividPackage = {
  /**
   * The display name of this package.
   */
  name: 'vivid' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/vivid' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Generator for LS_COLORS with support for multiple color themes' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/vivid/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/sharkdp/vivid' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/vivid' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/vivid -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/vivid' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'vivid',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'zlib.net^1',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.10.1',
    '0.10.0',
    '0.9.0',
  ] as const,
  aliases: [] as const,
}

export type CratesiovividPackage = typeof cratesiovividPackage
