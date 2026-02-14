/**
 * **proj** - PROJ - Cartographic Projections and Coordinate Transformations Library
 *
 * @domain `proj.org`
 * @programs `proj`
 * @version `9.7.1` (13 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install proj.org`
 * @homepage https://proj.org/
 * @dependencies `simplesystems.org/libtiff`, `sqlite.org`, `curl.se`
 * @buildDependencies `cmake.org`, `gnu.org/libtool`, `gnu.org/wget`, ... (+3 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.projorg
 * console.log(pkg.name)        // "proj"
 * console.log(pkg.description) // "PROJ - Cartographic Projections and Coordinate ..."
 * console.log(pkg.programs)    // ["proj"]
 * console.log(pkg.versions[0]) // "9.7.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/proj-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const projorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'proj' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'proj.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'PROJ - Cartographic Projections and Coordinate Transformations Library' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/proj.org/package.yml' as const,
  homepageUrl: 'https://proj.org/' as const,
  githubUrl: 'https://github.com/OSGeo/proj' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install proj.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +proj.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install proj.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'proj',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'simplesystems.org/libtiff',
    'sqlite.org',
    'curl.se',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'cmake.org',
    'gnu.org/libtool',
    'gnu.org/wget',
    'gnu.org/coreutils',
    'sqlite.org',
    'linux:nixos.org/patchelf',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '9.7.1',
    '9.7.0',
    '9.6.2',
    '9.6.1',
    '9.6.0',
    '9.5.1',
    '9.5.0',
    '9.4.1',
    '9.4.0',
    '9.3.1',
    '9.3.0',
    '9.2.1',
    '9.2.0',
  ] as const,
  aliases: [] as const,
}

export type ProjorgPackage = typeof projorgPackage
