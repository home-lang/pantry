/**
 * **mpfr** - pkgx package
 *
 * @domain `gnu.org/mpfr`
 * @version `4.2.2` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/mpfr`
 * @buildDependencies `gnu.org/gmp@>=4.2` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorgmpfr
 * console.log(pkg.name)        // "mpfr"
 * console.log(pkg.versions[0]) // "4.2.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/mpfr.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorgmpfrPackage = {
  /**
   * The display name of this package.
   */
  name: 'mpfr' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gnu.org/mpfr' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/mpfr/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gnu.org/mpfr' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/mpfr -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/mpfr' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/gmp@>=4.2',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.2.2',
    '4.2.1',
    '4.1.1',
  ] as const,
  aliases: [] as const,
}

export type GnuorgmpfrPackage = typeof gnuorgmpfrPackage
