/**
 * **cfitsio** - pkgx package
 *
 * @domain `heasarc.gsfc.nasa.gov/cfitsio`
 * @version `4.6.3` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install heasarc.gsfc.nasa.gov/cfitsio`
 * @dependencies `darwin:zlib.net` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `gnu.org/diffutils` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.heasarcgsfcnasagovcfitsio
 * console.log(pkg.name)        // "cfitsio"
 * console.log(pkg.versions[0]) // "4.6.3" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/heasarc-gsfc-nasa-gov/cfitsio.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const heasarcgsfcnasagovcfitsioPackage = {
  /**
   * The display name of this package.
   */
  name: 'cfitsio' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'heasarc.gsfc.nasa.gov/cfitsio' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/heasarc.gsfc.nasa.gov/cfitsio/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install heasarc.gsfc.nasa.gov/cfitsio' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +heasarc.gsfc.nasa.gov/cfitsio -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install heasarc.gsfc.nasa.gov/cfitsio' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'darwin:zlib.net',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/diffutils',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.6.3',
    '4.6.2',
    '4.6.0',
    '4.5.0',
    '4.4.1',
    '4.4.0',
    '4.3.1',
    '4.3.0',
    '4.2.0',
  ] as const,
  aliases: [] as const,
}

export type HeasarcgsfcnasagovcfitsioPackage = typeof heasarcgsfcnasagovcfitsioPackage
