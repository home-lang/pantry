/**
 * **f2py** - The fundamental package for scientific computing with Python.
 *
 * @domain `numpy.org`
 * @programs `f2py`
 * @version `2.4.1` (25 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install numpy.org`
 * @homepage https://www.numpy.org/
 * @dependencies `openblas.net^0.3`, `python.org^3.11`
 * @buildDependencies `cython.org/libcython`, `llvm.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.numpyorg
 * console.log(pkg.name)        // "f2py"
 * console.log(pkg.description) // "The fundamental package for scientific computin..."
 * console.log(pkg.programs)    // ["f2py"]
 * console.log(pkg.versions[0]) // "2.4.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/numpy-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const numpyorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'f2py' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'numpy.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'The fundamental package for scientific computing with Python.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/numpy.org/package.yml' as const,
  homepageUrl: 'https://www.numpy.org/' as const,
  githubUrl: 'https://github.com/numpy/numpy' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install numpy.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +numpy.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install numpy.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'f2py',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openblas.net^0.3',
    'python.org^3.11',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cython.org/libcython',
    'llvm.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.4.1',
    '2.4.0',
    '2.3.5',
    '2.3.4',
    '2.3.3',
    '2.3.2',
    '2.3.1',
    '2.3.0',
    '2.2.6',
    '2.2.5',
    '2.2.4',
    '2.2.3',
    '2.2.2',
    '2.2.1',
    '2.2.0',
    '2.1.3',
    '2.1.2',
    '2.1.1',
    '2.1.0',
    '2.0.2',
    '2.0.1',
    '2.0.0',
    '1.26.4',
    '1.26.3',
    '1.26.2',
  ] as const,
  aliases: [] as const,
}

export type NumpyorgPackage = typeof numpyorgPackage
