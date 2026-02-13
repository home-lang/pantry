/**
 * **fribidi** - Implementation of the Unicode BiDi algorithm
 *
 * @domain `gnu.org/fribidi`
 * @programs `fribidi`
 * @version `1.0.16` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/fribidi`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorgfribidi
 * console.log(pkg.name)        // "fribidi"
 * console.log(pkg.description) // "Implementation of the Unicode BiDi algorithm"
 * console.log(pkg.programs)    // ["fribidi"]
 * console.log(pkg.versions[0]) // "1.0.16" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/fribidi.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorgfribidiPackage = {
  /**
   * The display name of this package.
   */
  name: 'fribidi' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gnu.org/fribidi' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Implementation of the Unicode BiDi algorithm' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/fribidi/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/fribidi/fribidi' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gnu.org/fribidi' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/fribidi -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/fribidi' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'fribidi',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.0.16',
    '1.0.15',
    '1.0.14',
    '1.0.13',
    '1.0.12',
  ] as const,
  aliases: [] as const,
}

export type GnuorgfribidiPackage = typeof gnuorgfribidiPackage
