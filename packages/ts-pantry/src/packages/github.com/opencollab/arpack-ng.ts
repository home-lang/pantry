/**
 * **arpack-ng** - Collection of Fortran77 subroutines designed to solve large scale eigenvalue problems.
 *
 * @domain `github.com/opencollab/arpack-ng`
 * @version `3.9.1` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/opencollab/arpack-ng`
 * @dependencies `eigen.tuxfamily.org@3`, `gnu.org/gcc`, `open-mpi.org@5`, ... (+1 more)
 * @buildDependencies `gnu.org/autoconf`, `gnu.org/automake`, `gnu.org/libtool` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomopencollabarpackng
 * console.log(pkg.name)        // "arpack-ng"
 * console.log(pkg.description) // "Collection of Fortran77 subroutines designed to..."
 * console.log(pkg.versions[0]) // "3.9.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/opencollab/arpack-ng.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const arpackngPackage = {
  /**
  * The display name of this package.
  */
  name: 'arpack-ng' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/opencollab/arpack-ng' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Collection of Fortran77 subroutines designed to solve large scale eigenvalue problems.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/opencollab/arpack-ng/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/opencollab/arpack-ng' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/opencollab/arpack-ng' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/opencollab/arpack-ng -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/opencollab/arpack-ng' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'eigen.tuxfamily.org@3',
    'gnu.org/gcc',
    'open-mpi.org@5',
    'netlib.org/lapack@3',
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
    '3.9.1',
  ] as const,
  aliases: [] as const,
}

export type ArpackngPackage = typeof arpackngPackage
