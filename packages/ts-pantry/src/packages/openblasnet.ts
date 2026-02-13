/**
 * **openblas** - OpenBLAS is an optimized BLAS library based on GotoBLAS2 1.13 BSD version.
 *
 * @domain `openblas.net`
 * @version `0.3.31` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install openblas.net`
 * @homepage http://www.openblas.net
 * @buildDependencies `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.openblasnet
 * console.log(pkg.name)        // "openblas"
 * console.log(pkg.description) // "OpenBLAS is an optimized BLAS library based on ..."
 * console.log(pkg.versions[0]) // "0.3.31" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/openblas-net.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const openblasnetPackage = {
  /**
   * The display name of this package.
   */
  name: 'openblas' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'openblas.net' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'OpenBLAS is an optimized BLAS library based on GotoBLAS2 1.13 BSD version. ' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/openblas.net/package.yml' as const,
  homepageUrl: 'http://www.openblas.net' as const,
  githubUrl: 'https://github.com/xianyi/OpenBLAS' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install openblas.net' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +openblas.net -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install openblas.net' as const,
  programs: [] as const,
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
    '0.3.31',
    '0.3.30',
    '0.3.29',
    '0.3.28',
    '0.3.27',
    '0.3.26',
    '0.3.25',
    '0.3.24',
    '0.3.23',
  ] as const,
  aliases: [] as const,
}

export type OpenblasnetPackage = typeof openblasnetPackage
