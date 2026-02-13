/**
 * **guil** - GNU Ubiquitous Intelligent Language for Extensions
 *
 * @domain `gnu.org/guile`
 * @programs `guild`, `guile`, `guile-config`, `guile-snarf`, `guile-tools`
 * @version `3.0.11` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/guile`
 * @homepage https://www.gnu.org/software/guile/
 * @dependencies `hboehm.info/gc^8`, `gnu.org/gmp^6`, `gnu.org/libtool^2`, ... (+6 more)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorgguile
 * console.log(pkg.name)        // "guil"
 * console.log(pkg.description) // "GNU Ubiquitous Intelligent Language for Extensions"
 * console.log(pkg.programs)    // ["guild", "guile", ...]
 * console.log(pkg.versions[0]) // "3.0.11" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/guile.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorgguilePackage = {
  /**
   * The display name of this package.
   */
  name: 'guil' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gnu.org/guile' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'GNU Ubiquitous Intelligent Language for Extensions' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/guile/package.yml' as const,
  homepageUrl: 'https://www.gnu.org/software/guile/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gnu.org/guile' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/guile -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/guile' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'guild',
    'guile',
    'guile-config',
    'guile-snarf',
    'guile-tools',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'hboehm.info/gc^8',
    'gnu.org/gmp^6',
    'gnu.org/libtool^2',
    'gnu.org/libunistring^1',
    'freedesktop.org/pkg-config^0.29 # guile-config is a wrapper around pkg-config.',
    'gnu.org/readline^8',
    'gnu.org/gperf^3',
    'sourceware.org/libffi^3',
    'github.com/besser82/libxcrypt^4',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.0.11',
    '3.0.10',
    '3.0.9',
  ] as const,
  aliases: [] as const,
}

export type GnuorgguilePackage = typeof gnuorgguilePackage
