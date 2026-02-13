/**
 * **utf8cpp** - UTF-8 with C++ in a Portable Way
 *
 * @domain `github.com/nemtrif/utfcpp`
 * @version `4.9.0` (14 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/nemtrif/utfcpp`
 * @buildDependencies `cmake.org@3`, `darwin:gnu.org/gcc@13` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomnemtrifutfcpp
 * console.log(pkg.name)        // "utf8cpp"
 * console.log(pkg.description) // "UTF-8 with C++ in a Portable Way"
 * console.log(pkg.versions[0]) // "4.9.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/nemtrif/utfcpp.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const utfcppPackage = {
  /**
   * The display name of this package.
   */
  name: 'utf8cpp' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/nemtrif/utfcpp' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'UTF-8 with C++ in a Portable Way' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/nemtrif/utfcpp/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/nemtrif/utfcpp' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/nemtrif/utfcpp' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/nemtrif/utfcpp -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/nemtrif/utfcpp' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'cmake.org@3',
    'darwin:gnu.org/gcc@13',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.9.0',
    '4.0.9',
    '4.0.8',
    '4.0.7',
    '4.0.6',
    '4.0.5',
    '4.0.4',
    '4.0.3',
    '4.0.2',
    '4.0.1',
    '4.0.0',
    '3.2.5',
    '3.2.4',
    '3.2.3',
  ] as const,
  aliases: [] as const,
}

export type UtfcppPackage = typeof utfcppPackage
