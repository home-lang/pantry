/**
 * **nettle** - A mirror of the nettle repository
 *
 * @domain `gnu.org/nettle`
 * @programs `nettle-hash`, `nettle-lfib-stream`, `nettle-pbkdf2`, `pkcs1-conv`, `sexp-conv`
 * @version `3.10.2` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/nettle`
 * @homepage https://www.lysator.liu.se/~nisse/nettle/
 * @buildDependencies `gnu.org/gmp`, `gnu.org/m4` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorgnettle
 * console.log(pkg.name)        // "nettle"
 * console.log(pkg.description) // "A mirror of the nettle repository"
 * console.log(pkg.programs)    // ["nettle-hash", "nettle-lfib-stream", ...]
 * console.log(pkg.versions[0]) // "3.10.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/nettle.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorgnettlePackage = {
  /**
   * The display name of this package.
   */
  name: 'nettle' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gnu.org/nettle' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A mirror of the nettle repository' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/nettle/package.yml' as const,
  homepageUrl: 'https://www.lysator.liu.se/~nisse/nettle/' as const,
  githubUrl: 'https://github.com/gnutls/nettle' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gnu.org/nettle' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/nettle -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/nettle' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'nettle-hash',
    'nettle-lfib-stream',
    'nettle-pbkdf2',
    'pkcs1-conv',
    'sexp-conv',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/gmp',
    'gnu.org/m4',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.10.2',
    '3.10.1',
    '3.10.0',
    '3.9.1',
    '3.9.0',
    '3.8.1',
  ] as const,
  aliases: [] as const,
}

export type GnuorgnettlePackage = typeof gnuorgnettlePackage
