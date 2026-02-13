/**
 * **abseil** - Abseil Common Libraries (C++)
 *
 * @domain `abseil.io`
 * @version `20260107.0.0` (21 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install abseil.io`
 * @homepage https://abseil.io
 * @buildDependencies `cmake.org@^3`, `linux:gnu.org/gcc@^14` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.abseilio
 * console.log(pkg.name)        // "abseil"
 * console.log(pkg.description) // "Abseil Common Libraries (C++)"
 * console.log(pkg.versions[0]) // "20260107.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/abseil-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const abseilioPackage = {
  /**
   * The display name of this package.
   */
  name: 'abseil' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'abseil.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Abseil Common Libraries (C++)' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/abseil.io/package.yml' as const,
  homepageUrl: 'https://abseil.io' as const,
  githubUrl: 'https://github.com/abseil/abseil-cpp' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install abseil.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +abseil.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install abseil.io' as const,
  programs: [] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'cmake.org@^3',
    'linux:gnu.org/gcc@^14',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '20260107.0.0',
    '20250814.1.0',
    '20250814.0.0',
    '20250512.1.0',
    '20250512.0.0',
    '20250127.1.0',
    '20250127.0.0',
    '20240722.1.0',
    '20240722.0.0',
    '20240116.3.0',
    '20240116.2.0',
    '20240116.1.0',
    '20240116.0.0',
    '20230802.3.0',
    '20230802.2.0',
    '20230802.1.0',
    '20230802.0.0',
    '20230125.4.0',
    '20230125.3.0',
    '20230125.2.0',
    '20220623.2.0',
  ] as const,
  aliases: [] as const,
}

export type AbseilioPackage = typeof abseilioPackage
