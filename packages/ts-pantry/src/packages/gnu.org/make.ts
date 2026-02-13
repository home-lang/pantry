/**
 * **make** - pkgx package
 *
 * @domain `gnu.org/make`
 * @programs `make`
 * @version `4.3.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install gnu.org/make`
 * @buildDependencies `gnu.org/m4@1` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.gnuorgmake
 * console.log(pkg.name)        // "make"
 * console.log(pkg.programs)    // ["make"]
 * console.log(pkg.versions[0]) // "4.3.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/gnu-org/make.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const gnuorgmakePackage = {
  /**
   * The display name of this package.
   */
  name: 'make' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'gnu.org/make' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/gnu.org/make/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install gnu.org/make' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +gnu.org/make -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install gnu.org/make' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'make',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/m4@1',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.3.0',
  ] as const,
  aliases: [] as const,
}

export type GnuorgmakePackage = typeof gnuorgmakePackage
