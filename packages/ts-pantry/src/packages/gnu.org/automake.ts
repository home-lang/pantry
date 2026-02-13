/**
 * **automake** - Tool for generating GNU Standards-compliant Makefiles
 *
 * @domain `gnu.org/automake`
 * @programs `aclocal`, `automake`
 * @version `1.18.1` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/automake`
 * @homepage https://www.gnu.org/software/automake/
 * @dependencies `gnu.org/autoconf^2.65.0`, `perl.org`
 * @buildDependencies `gnu.org/patch` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorgautomake
 * console.log(pkg.name)        // "automake"
 * console.log(pkg.description) // "Tool for generating GNU Standards-compliant Mak..."
 * console.log(pkg.programs)    // ["aclocal", "automake"]
 * console.log(pkg.versions[0]) // "1.18.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/automake.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorgautomakePackage = {
  /**
   * The display name of this package.
   */
  name: 'automake' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gnu.org/automake' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Tool for generating GNU Standards-compliant Makefiles' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/automake/package.yml' as const,
  homepageUrl: 'https://www.gnu.org/software/automake/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gnu.org/automake' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/automake -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/automake' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'aclocal',
    'automake',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'gnu.org/autoconf^2.65.0',
    'perl.org',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/patch',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.18.1',
    '1.18.0',
    '1.17.0',
    '1.16.5',
  ] as const,
  aliases: [] as const,
}

export type GnuorgautomakePackage = typeof gnuorgautomakePackage
