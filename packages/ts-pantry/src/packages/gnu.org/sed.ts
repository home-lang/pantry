/**
 * **sed** - pkgx package
 *
 * @domain `gnu.org/sed`
 * @programs `sed`
 * @version `4.9.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/sed`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorgsed
 * console.log(pkg.name)        // "sed"
 * console.log(pkg.programs)    // ["sed"]
 * console.log(pkg.versions[0]) // "4.9.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/sed.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorgsedPackage = {
  /**
   * The display name of this package.
   */
  name: 'sed' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gnu.org/sed' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/sed/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gnu.org/sed' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/sed -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/sed' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'sed',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.9.0',
  ] as const,
  aliases: [] as const,
}

export type GnuorgsedPackage = typeof gnuorgsedPackage
