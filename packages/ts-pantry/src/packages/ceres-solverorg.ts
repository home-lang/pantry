/**
 * **ceres-solver** - pkgx package
 *
 * @domain `ceres-solver.org`
 * @version `2.2.0` (2 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install ceres-solver.org`
 * @dependencies `eigen.tuxfamily.org`, `gflags.github.io`, `google.com/glog`, ... (+4 more)
 * @buildDependencies `cmake.org`, `linux:gnu.org/gcc`, `linux:gnu.org/make` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.ceressolverorg
 * console.log(pkg.name)        // "ceres-solver"
 * console.log(pkg.versions[0]) // "2.2.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/ceres-solver-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const ceressolverorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'ceres-solver' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'ceres-solver.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/ceres-solver.org/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install ceres-solver.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +ceres-solver.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install ceres-solver.org' as const,
  programs: [] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'eigen.tuxfamily.org',
    'gflags.github.io',
    'google.com/glog',
    'glaros.dtc.umn.edu/metis',
    'netlib.org/lapack',
    'people.engr.tamu.edu/davis/suitesparse',
    'github.com/oneapi-src/oneTBB',
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
  ] as const,
  aliases: [] as const,
}

export type CeressolverorgPackage = typeof ceressolverorgPackage
