/**
 * **suite-sparse** - The official SuiteSparse library: a suite of sparse matrix algorithms authored or co-authored by Tim Davis, Texas A&M University.
 *
 * @domain `people.engr.tamu.edu/davis/suitesparse`
 * @programs `mongoose`, `suitesparse_mongoose`
 * @version `7.12.1` (23 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install people.engr.tamu.edu/davis/suitesparse`
 * @homepage https://people.engr.tamu.edu/davis/suitesparse.html
 * @dependencies `glaros.dtc.umn.edu/metis`, `gnu.org/m4`, `netlib.org/lapack`, ... (+4 more)
 * @buildDependencies `cmake.org`, `linux:gnu.org/make` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.peopleengrtamuedudavissuitesparse
 * console.log(pkg.name)        // "suite-sparse"
 * console.log(pkg.description) // "The official SuiteSparse library: a suite of sp..."
 * console.log(pkg.programs)    // ["mongoose", "suitesparse_mongoose"]
 * console.log(pkg.versions[0]) // "7.12.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/people-engr-tamu-edu/davis/suitesparse.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const peopleengrtamuedudavissuitesparsePackage = {
  /**
   * The display name of this package.
   */
  name: 'suite-sparse' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'people.engr.tamu.edu/davis/suitesparse' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'The official SuiteSparse library: a suite of sparse matrix algorithms authored or co-authored by Tim Davis, Texas A&M University.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/people.engr.tamu.edu/davis/suitesparse/package.yml' as const,
  homepageUrl: 'https://people.engr.tamu.edu/davis/suitesparse.html' as const,
  githubUrl: 'https://github.com/DrTimothyAldenDavis/SuiteSparse' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install people.engr.tamu.edu/davis/suitesparse' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +people.engr.tamu.edu/davis/suitesparse -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install people.engr.tamu.edu/davis/suitesparse' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'mongoose',
    'suitesparse_mongoose',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'glaros.dtc.umn.edu/metis',
    'gnu.org/m4',
    'netlib.org/lapack',
    'gnu.org/gmp',
    'openmp.llvm.org',
    'gnu.org/mpfr',
    'gnu.org/gcc',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'cmake.org',
    'linux:gnu.org/make',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '7.12.1',
    '7.12.0',
    '7.11.0',
    '7.10.3',
    '7.10.2',
    '7.10.1',
    '7.10.0',
    '7.9.0',
    '7.8.3',
    '7.8.2',
    '7.8.1',
    '7.8.0',
    '7.7.0',
    '7.6.1',
    '7.6.0',
    '7.5.1',
    '7.5.0',
    '7.4.0',
    '7.3.1',
    '7.3.0',
    '7.2.2',
    '7.2.1',
    '7.2.0',
  ] as const,
  aliases: [] as const,
}

export type PeopleengrtamuedudavissuitesparsePackage = typeof peopleengrtamuedudavissuitesparsePackage
