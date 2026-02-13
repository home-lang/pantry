/**
 * **rhash.sourceforge** - Utility for computing and verifying hash sums of files
 *
 * @domain `rhash.sourceforge.net`
 * @programs `whirlpool-hash`, `tiger-hash`, `tth-hash`, `rhash`, `sfv-hash`, ... (+7 more)
 * @version `1.4.6` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install rhash.sourceforge.net`
 * @homepage https://sourceforge.net/projects/rhash/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.rhashsourceforgenet
 * console.log(pkg.name)        // "rhash.sourceforge"
 * console.log(pkg.description) // "Utility for computing and verifying hash sums o..."
 * console.log(pkg.programs)    // ["whirlpool-hash", "tiger-hash", ...]
 * console.log(pkg.versions[0]) // "1.4.6" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/rhash-sourceforge-net.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const rhashsourceforgenetPackage = {
  /**
   * The display name of this package.
   */
  name: 'rhash.sourceforge' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'rhash.sourceforge.net' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Utility for computing and verifying hash sums of files' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/rhash.sourceforge.net/package.yml' as const,
  homepageUrl: 'https://sourceforge.net/projects/rhash/' as const,
  githubUrl: 'https://github.com/rhash/RHash' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install rhash.sourceforge.net' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +rhash.sourceforge.net -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install rhash.sourceforge.net' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'whirlpool-hash',
    'tiger-hash',
    'tth-hash',
    'rhash',
    'sfv-hash',
    'magnet-link',
    'has160-hash',
    'gost12-256-hash',
    'gost12-512-hash',
    'edonr512-hash',
    'edonr256-hash',
    'ed2k-link',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.4.6',
    '1.4.5',
    '1.4.4',
    '1.4.3',
  ] as const,
  aliases: [] as const,
}

export type RhashsourceforgenetPackage = typeof rhashsourceforgenetPackage
