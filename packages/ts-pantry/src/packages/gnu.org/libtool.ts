/**
 * **libtool** - pkgx package
 *
 * @domain `gnu.org/libtool`
 * @programs `libtool`, `libtoolize`
 * @version `2.5.4` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/libtool`
 * @buildDependencies `gnu.org/autoconf@^2.65.0`, `gnu.org/m4@1` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorglibtool
 * console.log(pkg.name)        // "libtool"
 * console.log(pkg.programs)    // ["libtool", "libtoolize"]
 * console.log(pkg.versions[0]) // "2.5.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/libtool.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorglibtoolPackage = {
  /**
   * The display name of this package.
   */
  name: 'libtool' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gnu.org/libtool' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/libtool/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gnu.org/libtool' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/libtool -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/libtool' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'libtool',
    'libtoolize',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/autoconf@^2.65.0',
    'gnu.org/m4@1',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.5.4',
    '2.5.3',
    '2.4.7',
  ] as const,
  aliases: [] as const,
}

export type GnuorglibtoolPackage = typeof gnuorglibtoolPackage
