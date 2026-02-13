/**
 * **ed** - pkgx package
 *
 * @domain `gnu.org/ed`
 * @programs `ed`
 * @version `1.22.4` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/ed`
 * @buildDependencies `curl.se`, `nongnu.org/lzip` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorged
 * console.log(pkg.name)        // "ed"
 * console.log(pkg.programs)    // ["ed"]
 * console.log(pkg.versions[0]) // "1.22.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/ed.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorgedPackage = {
  /**
   * The display name of this package.
   */
  name: 'ed' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gnu.org/ed' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/ed/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gnu.org/ed' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/ed -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/ed' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'ed',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'curl.se',
    'nongnu.org/lzip',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.22.4',
    '1.22.3',
    '1.22.2',
    '1.22.1',
    '1.21.1',
    '1.20.2',
    '1.20.1',
    '1.14.2',
  ] as const,
  aliases: [] as const,
}

export type GnuorgedPackage = typeof gnuorgedPackage
