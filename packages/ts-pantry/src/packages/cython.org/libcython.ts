/**
 * **libcython** - The most widely used Python to C compiler
 *
 * @domain `cython.org/libcython`
 * @version `3.2.4` (27 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install cython.org/libcython`
 * @homepage https://cython.org
 * @dependencies `python.org~3.11`
 * @buildDependencies `llvm.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cythonorglibcython
 * console.log(pkg.name)        // "libcython"
 * console.log(pkg.description) // "The most widely used Python to C compiler"
 * console.log(pkg.versions[0]) // "3.2.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/cython-org/libcython.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cythonorglibcythonPackage = {
  /**
   * The display name of this package.
   */
  name: 'libcython' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'cython.org/libcython' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'The most widely used Python to C compiler' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/cython.org/libcython/package.yml' as const,
  homepageUrl: 'https://cython.org' as const,
  githubUrl: 'https://github.com/cython/cython' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install cython.org/libcython' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +cython.org/libcython -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install cython.org/libcython' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org~3.11',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'llvm.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.2.4',
    '3.2.3',
    '3.2.2',
    '3.2.1',
    '3.2.0',
    '3.1.8',
    '3.1.7',
    '3.1.6',
    '3.1.5',
    '3.1.4',
    '3.1.3',
    '3.1.2',
    '3.1.1',
    '3.1.0',
    '3.0.12',
    '3.0.11',
    '3.0.10',
    '3.0.9',
    '3.0.8',
    '3.0.7',
    '3.0.6',
    '3.0.5',
    '3.0.4',
    '3.0.3',
    '3.0.2',
    '0.29.37.1',
    '0.29.37',
  ] as const,
  aliases: [] as const,
}

export type CythonorglibcythonPackage = typeof cythonorglibcythonPackage
