/**
 * **doxygen** - Generate documentation for several programming languages
 *
 * @domain `doxygen.nl`
 * @programs `doxygen`
 * @version `1.16.1` (13 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install doxygen.nl`
 * @homepage https://www.doxygen.nl/
 * @buildDependencies `gnu.org/bison@^3`, `cmake.org@^3`, `github.com/westes/flex@2`, ... (+2 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.doxygennl
 * console.log(pkg.name)        // "doxygen"
 * console.log(pkg.description) // "Generate documentation for several programming ..."
 * console.log(pkg.programs)    // ["doxygen"]
 * console.log(pkg.versions[0]) // "1.16.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/doxygen-nl.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const doxygennlPackage = {
  /**
   * The display name of this package.
   */
  name: 'doxygen' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'doxygen.nl' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Generate documentation for several programming languages' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/doxygen.nl/package.yml' as const,
  homepageUrl: 'https://www.doxygen.nl/' as const,
  githubUrl: 'https://github.com/doxygen/doxygen' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install doxygen.nl' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +doxygen.nl -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install doxygen.nl' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'doxygen',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'gnu.org/bison@^3',
    'cmake.org@^3',
    'github.com/westes/flex@2',
    'python.org@>=3<3.12',
    'linux:llvm.org@20',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.16.1',
    '1.16.0',
    '1.15.0',
    '1.14.0',
    '1.13.2',
    '1.13.1',
    '1.13.0',
    '1.12.0',
    '1.11.0',
    '1.10.0',
    '1.9.8',
    '1.9.7',
    '1.9.6',
  ] as const,
  aliases: [] as const,
}

export type DoxygennlPackage = typeof doxygennlPackage
