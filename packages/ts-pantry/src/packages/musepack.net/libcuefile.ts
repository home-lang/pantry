/**
 * **libcuefile** - pkgx package
 *
 * @domain `musepack.net/libcuefile`
 * @version `475.0.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install musepack.net/libcuefile`
 * @buildDependencies `cmake.org`, `linux:gnu.org/gcc` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.musepacknetlibcuefile
 * console.log(pkg.name)        // "libcuefile"
 * console.log(pkg.versions[0]) // "475.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/musepack-net/libcuefile.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const musepacknetlibcuefilePackage = {
  /**
   * The display name of this package.
   */
  name: 'libcuefile' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'musepack.net/libcuefile' as const,
  /**
   * Brief description of what this package does.
   */
  description: '' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/musepack.net/libcuefile/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install musepack.net/libcuefile' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +musepack.net/libcuefile -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install musepack.net/libcuefile' as const,
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
    'linux:gnu.org/gcc',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '475.0.0',
  ] as const,
  aliases: [] as const,
}

export type MusepacknetlibcuefilePackage = typeof musepacknetlibcuefilePackage
