/**
 * **sassc** - Wrapper around libsass that helps to create command-line apps
 *
 * @domain `sass-lang.com/sassc`
 * @programs `sassc`
 * @version `3.6.2` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install sass-lang.com/sassc`
 * @dependencies `sass-lang.com/libsass^3.6.5`
 * @buildDependencies `gnu.org/autoconf`, `gnu.org/automake`, `gnu.org/libtool` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.sasslangcomsassc
 * console.log(pkg.name)        // "sassc"
 * console.log(pkg.description) // "Wrapper around libsass that helps to create com..."
 * console.log(pkg.programs)    // ["sassc"]
 * console.log(pkg.versions[0]) // "3.6.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/sass-lang-com/sassc.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const sasslangcomsasscPackage = {
  /**
   * The display name of this package.
   */
  name: 'sassc' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'sass-lang.com/sassc' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Wrapper around libsass that helps to create command-line apps' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/sass-lang.com/sassc/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/sass/sassc' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install sass-lang.com/sassc' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +sass-lang.com/sassc -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install sass-lang.com/sassc' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'sassc',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'sass-lang.com/libsass^3.6.5',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/autoconf',
    'gnu.org/automake',
    'gnu.org/libtool',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.6.2',
  ] as const,
  aliases: [] as const,
}

export type SasslangcomsasscPackage = typeof sasslangcomsasscPackage
