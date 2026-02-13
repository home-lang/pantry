/**
 * **m4** - GNU M4. Mirror of git://git.savannah.gnu.org/m4.git
 *
 * @domain `gnu.org/m4`
 * @programs `m4`
 * @version `1.4.20` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/m4`
 * @homepage https://www.gnu.org/software/m4/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorgm4
 * console.log(pkg.name)        // "m4"
 * console.log(pkg.description) // "GNU M4. Mirror of git://git.savannah.gnu.org/m4..."
 * console.log(pkg.programs)    // ["m4"]
 * console.log(pkg.versions[0]) // "1.4.20" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/m4.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorgm4Package = {
  /**
   * The display name of this package.
   */
  name: 'm4' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gnu.org/m4' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'GNU M4. Mirror of git://git.savannah.gnu.org/m4.git ' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/m4/package.yml' as const,
  homepageUrl: 'https://www.gnu.org/software/m4/' as const,
  githubUrl: 'https://github.com/autotools-mirror/m4' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gnu.org/m4' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/m4 -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/m4' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'm4',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.4.20',
    '1.4.19',
  ] as const,
  aliases: [] as const,
}

export type Gnuorgm4Package = typeof gnuorgm4Package
