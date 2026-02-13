/**
 * **cython** - Compiler for writing C extensions for the Python language
 *
 * @domain `cython.org`
 * @programs `cython`
 * @version `3.2.4` (31 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install cython.org`
 * @homepage https://cython.org/
 * @dependencies `python.org<3.12`
 * @buildDependencies `pip.pypa.io` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cythonorg
 * console.log(pkg.name)        // "cython"
 * console.log(pkg.description) // "Compiler for writing C extensions for the Pytho..."
 * console.log(pkg.programs)    // ["cython"]
 * console.log(pkg.versions[0]) // "3.2.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/cython-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cythonorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'cython' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'cython.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Compiler for writing C extensions for the Python language' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/cython.org/package.yml' as const,
  homepageUrl: 'https://cython.org/' as const,
  githubUrl: 'https://github.com/cython/cython' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install cython.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +cython.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install cython.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'cython',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org<3.12',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'pip.pypa.io',
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
    '3.0.1',
    '3.0.0',
    '0.29.37.1',
    '0.29.37',
    '0.29.36',
    '0.29.35',
  ] as const,
  aliases: [] as const,
}

export type CythonorgPackage = typeof cythonorgPackage
