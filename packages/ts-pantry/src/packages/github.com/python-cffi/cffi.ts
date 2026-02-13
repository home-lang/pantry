/**
 * **cffi** - A Foreign Function Interface package for calling C libraries from Python.
 *
 * @domain `github.com/python-cffi/cffi`
 * @version `2.0.0` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/python-cffi/cffi`
 * @homepage https://cffi.readthedocs.io/en/latest/
 * @dependencies `python.org>=3.11`, `github.com/eliben/pycparser^2.21`, `sourceware.org/libffi^3.4`
 * @buildDependencies `llvm.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcompythoncfficffi
 * console.log(pkg.name)        // "cffi"
 * console.log(pkg.description) // "A Foreign Function Interface package for callin..."
 * console.log(pkg.versions[0]) // "2.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/python-cffi/cffi.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cffiPackage = {
  /**
   * The display name of this package.
   */
  name: 'cffi' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/python-cffi/cffi' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A Foreign Function Interface package for calling C libraries from Python.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/python-cffi/cffi/package.yml' as const,
  homepageUrl: 'https://cffi.readthedocs.io/en/latest/' as const,
  githubUrl: 'https://github.com/python-cffi/cffi' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/python-cffi/cffi' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/python-cffi/cffi -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/python-cffi/cffi' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'python.org>=3.11',
    'github.com/eliben/pycparser^2.21',
    'sourceware.org/libffi^3.4',
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
    '2.0.0',
    '1.17.1',
    '1.17.0',
    '1.16.0',
  ] as const,
  aliases: [] as const,
}

export type CffiPackage = typeof cffiPackage
