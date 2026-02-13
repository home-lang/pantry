/**
 * **geos-config** - Geometry Engine, Open Source
 *
 * @domain `libgeos.org`
 * @programs `geos-config`
 * @version `3.14.1` (17 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install libgeos.org`
 * @homepage https://libgeos.org/
 * @buildDependencies `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.libgeosorg
 * console.log(pkg.name)        // "geos-config"
 * console.log(pkg.description) // "Geometry Engine, Open Source"
 * console.log(pkg.programs)    // ["geos-config"]
 * console.log(pkg.versions[0]) // "3.14.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/libgeos-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libgeosorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'geos-config' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'libgeos.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Geometry Engine, Open Source' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/libgeos.org/package.yml' as const,
  homepageUrl: 'https://libgeos.org/' as const,
  githubUrl: 'https://github.com/libgeos/geos' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install libgeos.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +libgeos.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install libgeos.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'geos-config',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.14.1',
    '3.14.0',
    '3.13.1',
    '3.13.0',
    '3.12.3',
    '3.12.2',
    '3.12.1',
    '3.12.0',
    '3.11.5',
    '3.11.4',
    '3.11.3',
    '3.11.2',
    '3.10.7',
    '3.10.6',
    '3.9.6',
    '3.9.5',
    '3.8.4',
  ] as const,
  aliases: [] as const,
}

export type LibgeosorgPackage = typeof libgeosorgPackage
