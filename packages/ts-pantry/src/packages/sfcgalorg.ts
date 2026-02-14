/**
 * **sfcgal-config** - C++ wrapper library around CGAL
 *
 * @domain `sfcgal.org`
 * @programs `sfcgal-config`
 * @version `2.2.0` (7 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install sfcgal.org`
 * @homepage https://sfcgal.gitlab.io/SFCGAL/
 * @dependencies `boost.org`, `cgal.org`, `gnu.org/gmp`, ... (+1 more)
 * @buildDependencies `cmake.org`, `linux:gnu.org/gcc`, `linux:gnu.org/make` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.sfcgalorg
 * console.log(pkg.name)        // "sfcgal-config"
 * console.log(pkg.description) // "C++ wrapper library around CGAL"
 * console.log(pkg.programs)    // ["sfcgal-config"]
 * console.log(pkg.versions[0]) // "2.2.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/sfcgal-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const sfcgalorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'sfcgal-config' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'sfcgal.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'C++ wrapper library around CGAL' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/sfcgal.org/package.yml' as const,
  homepageUrl: 'https://sfcgal.gitlab.io/SFCGAL/' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install sfcgal.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +sfcgal.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install sfcgal.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'sfcgal-config',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'boost.org',
    'cgal.org',
    'gnu.org/gmp',
    'gnu.org/mpfr',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
  */
  buildDependencies: [
    'cmake.org',
    'linux:gnu.org/gcc',
    'linux:gnu.org/make',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.2.0',
    '2.1.0',
    '2.0.0',
    '1.5.2',
    '1.5.1',
    '1.5.0',
    '1.4.1',
  ] as const,
  aliases: [] as const,
}

export type SfcgalorgPackage = typeof sfcgalorgPackage
