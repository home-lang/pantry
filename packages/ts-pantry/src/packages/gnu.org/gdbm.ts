/**
 * **gdbm** - GNU database manager
 *
 * @domain `gnu.org/gdbm`
 * @programs `gdbm_dump`, `gdbm_load`, `gdbmtool`
 * @version `1.26.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/gdbm`
 * @homepage https://www.gnu.org.ua/software/gdbm/
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorggdbm
 * console.log(pkg.name)        // "gdbm"
 * console.log(pkg.description) // "GNU database manager"
 * console.log(pkg.programs)    // ["gdbm_dump", "gdbm_load", ...]
 * console.log(pkg.versions[0]) // "1.26.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/gdbm.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorggdbmPackage = {
  /**
   * The display name of this package.
   */
  name: 'gdbm' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gnu.org/gdbm' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'GNU database manager' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/gdbm/package.yml' as const,
  homepageUrl: 'https://www.gnu.org.ua/software/gdbm/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gnu.org/gdbm' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/gdbm -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/gdbm' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'gdbm_dump',
    'gdbm_load',
    'gdbmtool',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.26.0',
    '1.25.0',
    '1.24.0',
    '1.23.0',
  ] as const,
  aliases: [] as const,
}

export type GnuorggdbmPackage = typeof gnuorggdbmPackage
