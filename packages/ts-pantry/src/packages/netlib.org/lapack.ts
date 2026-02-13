/**
 * **lapack** - LAPACK development repository
 *
 * @domain `netlib.org/lapack`
 * @version `3.12.1` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install netlib.org/lapack`
 * @dependencies `gnu.org/gcc^11 # libgfortran`
 * @buildDependencies `gnu.org/binutils`, `cmake.org@~3.24` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.netliborglapack
 * console.log(pkg.name)        // "lapack"
 * console.log(pkg.description) // "LAPACK development repository"
 * console.log(pkg.versions[0]) // "3.12.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/netlib-org/lapack.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const netliborglapackPackage = {
  /**
   * The display name of this package.
   */
  name: 'lapack' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'netlib.org/lapack' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'LAPACK development repository' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/netlib.org/lapack/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/Reference-LAPACK/lapack' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install netlib.org/lapack' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +netlib.org/lapack -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install netlib.org/lapack' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'gnu.org/gcc^11 # libgfortran',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/binutils',
    'cmake.org@~3.24',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.12.1',
    '3.12.0',
    '3.11.0',
  ] as const,
  aliases: [] as const,
}

export type NetliborglapackPackage = typeof netliborglapackPackage
