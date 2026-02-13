/**
 * **cpptoml** - cpptoml is a header-only library for parsing TOML
 *
 * @domain `github.com/skystrife/cpptoml`
 * @version `0.1.1` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/skystrife/cpptoml`
 * @buildDependencies `cmake.org`, `linux:gnu.org/gcc@13` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomskystrifecpptoml
 * console.log(pkg.name)        // "cpptoml"
 * console.log(pkg.description) // "cpptoml is a header-only library for parsing TOML"
 * console.log(pkg.versions[0]) // "0.1.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/skystrife/cpptoml.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cpptomlPackage = {
  /**
   * The display name of this package.
   */
  name: 'cpptoml' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/skystrife/cpptoml' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'cpptoml is a header-only library for parsing TOML' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/skystrife/cpptoml/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/skystrife/cpptoml' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/skystrife/cpptoml' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/skystrife/cpptoml -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/skystrife/cpptoml' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'cmake.org',
    'linux:gnu.org/gcc@13',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.1.1',
  ] as const,
  aliases: [] as const,
}

export type CpptomlPackage = typeof cpptomlPackage
