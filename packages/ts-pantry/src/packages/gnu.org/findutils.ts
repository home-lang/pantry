/**
 * **findutils** - pkgx package
 *
 * @domain `gnu.org/findutils`
 * @programs `find`, `locate`, `updatedb`, `xargs`
 * @version `4.10.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/findutils`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorgfindutils
 * console.log(pkg.name)        // "findutils"
 * console.log(pkg.programs)    // ["find", "locate", ...]
 * console.log(pkg.versions[0]) // "4.10.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/findutils.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorgfindutilsPackage = {
  /**
   * The display name of this package.
   */
  name: 'findutils' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gnu.org/findutils' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/findutils/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gnu.org/findutils' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/findutils -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/findutils' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'find',
    'locate',
    'updatedb',
    'xargs',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.10.0',
    '4.9.0',
  ] as const,
  aliases: [] as const,
}

export type GnuorgfindutilsPackage = typeof gnuorgfindutilsPackage
