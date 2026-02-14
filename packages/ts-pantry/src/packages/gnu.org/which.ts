/**
 * **which** - pkgx package
 *
 * @domain `gnu.org/which`
 * @programs `which`
 * @version `2.23.0` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/which`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorgwhich
 * console.log(pkg.name)        // "which"
 * console.log(pkg.programs)    // ["which"]
 * console.log(pkg.versions[0]) // "2.23.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/which.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorgwhichPackage = {
  /**
  * The display name of this package.
  */
  name: 'which' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'gnu.org/which' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/which/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install gnu.org/which' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/which -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/which' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'which',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.23.0',
    '2.22.0',
    '2.21.0',
  ] as const,
  aliases: [] as const,
}

export type GnuorgwhichPackage = typeof gnuorgwhichPackage
