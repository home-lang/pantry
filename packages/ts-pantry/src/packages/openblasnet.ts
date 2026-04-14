/**
 * **openblas** - OpenBLAS is an optimized BLAS library based on GotoBLAS2 1.13 BSD version.
 *
 * @domain `openblas.net`
 * @version `0.3.31` (9 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install openblas.net`
 * @homepage http://www.openblas.net
 * @buildDependencies `cmake.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.openblasnet
 * console.log(pkg.name)        // "openblas"
 * console.log(pkg.description) // "OpenBLAS is an optimized BLAS library based on ..."
 * console.log(pkg.versions[0]) // "0.3.31" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/openblas-net.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install openblas.net' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +openblas.net -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install openblas.net' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '0.3.32',
    '0.3.31',
    '0.3.30',
    '0.3.29',
    '0.3.28',
    '0.3.27',
    '0.3.26',
    '0.3.25',
    '0.3.24',
    '0.3.23',
    '0.3.22',
    '0.3.21',
    '0.3.20',
    '0.3.19',
    '0.3.18',
    '0.3.17',
    '0.3.16',
    '0.3.15',
    '0.3.13',
    '0.3.12',
    '0.3.10',
    '0.3.9',
    '0.3.8',
    '0.3.7',
    '0.3.6',
    '0.3.5',
    '0.3.4',
    '0.3.3',
    '0.3.2',
    '0.3.1',
    '0.3.0',
    '0.2.20',
    '0.2.19',
    '0.2.18',
    '0.2.17',
    '0.2.16',
    '0.2.15',
    '0.2.14',
    '0.2.13',
    '0.2.12',
    '0.2.11',
    '0.2.10',
    '0.2.9',
    '0.2.8',
    '0.2.7',
  ] as const,
  aliases: [] as const,
}

export type OpenblasnetPackage = typeof openblasnetPackage
