/**
 * **watchman** - Watches files and records, or triggers actions, when they change.
 *
 * @domain `facebook.com/watchman`
 * @programs `watchman`, `watchman-diag`, `watchman-make`, `watchman-wait`, `watchman-replicate-subscription`, ... (+1 more)
 * @version `2026.1.5.0` (72 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install facebook.com/watchman`
 * @homepage https://facebook.github.io/watchman/
 * @dependencies `facebook.com/edencommon`, `facebook.com/fb303`, `facebook.com/folly`, ... (+10 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `cmake.org`, `github.com/skystrife/cpptoml`, `facebook.com/fbthrift`, ... (+3 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.facebookcomwatchman
 * console.log(pkg.name)        // "watchman"
 * console.log(pkg.description) // "Watches files and records, or triggers actions,..."
 * console.log(pkg.programs)    // ["watchman", "watchman-diag", ...]
 * console.log(pkg.versions[0]) // "2026.1.5.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/facebook-com/watchman.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const facebookcomwatchmanPackage = {
  /**
   * The display name of this package.
   */
  name: 'watchman' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'facebook.com/watchman' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Watches files and records, or triggers actions, when they change. ' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/facebook.com/watchman/package.yml' as const,
  homepageUrl: 'https://facebook.github.io/watchman/' as const,
  githubUrl: 'https://github.com/facebook/watchman' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install facebook.com/watchman' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +facebook.com/watchman -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install facebook.com/watchman' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'watchman',
    'watchman-diag',
    'watchman-make',
    'watchman-wait',
    'watchman-replicate-subscription',
    'watchmanctl',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'facebook.com/edencommon',
    'facebook.com/fb303',
    'facebook.com/folly',
    'fmt.dev>=9',
    'gflags.github.io^2',
    'google.com/glog^0.6',
    'libevent.org^2.1',
    'libsodium.org^1',
    'openssl.org^1.1',
    'pcre.org/v2^10',
    'python.org~3.11',
    'linux:libcxx.llvm.org^18 # libunwind',
    'linux:gnu.org/gcc/libstdcxx@13',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'cmake.org',
    'github.com/skystrife/cpptoml',
    'facebook.com/fbthrift',
    'facebook.com/mvfst',
    'google.com/googletest',
    'linux:gnu.org/gcc@13',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2026.1.5.0',
    '2026.1.19.0',
    '2026.1.12.0',
    '2025.4.7.0',
    '2025.4.14.0',
    '2025.3.31.0',
    '2025.3.3.0',
    '2025.3.24.0',
    '2025.3.17.0',
    '2025.3.10.0',
    '2025.2.3.0',
    '2025.2.24.0',
    '2025.2.17.0',
    '2025.2.10.0',
    '2025.12.29.0',
    '2025.12.22.0',
    '2025.11.24.0',
    '2025.11.17.0',
    '2025.11.10.0',
    '2025.1.6.0',
    '2025.1.27.0',
    '2025.1.20.0',
    '2024.9.23.0',
    '2024.9.2.0',
    '2024.9.16.0',
    '2024.8.5.0',
    '2024.8.26.0',
    '2024.8.19.0',
    '2024.8.12.0',
    '2024.7.8.0',
    '2024.7.29.0',
    '2024.7.22.0',
    '2024.7.15.0',
    '2024.7.1.0',
    '2024.6.3.0',
    '2024.6.24.0',
    '2024.6.10.0',
    '2024.5.6.0',
    '2024.5.27.0',
    '2024.5.20.0',
    '2024.5.2.0',
    '2024.5.13.0',
    '2024.4.8.0',
    '2024.4.29.0',
    '2024.4.22.0',
    '2024.4.15.0',
    '2024.4.1.0',
    '2024.3.4.0',
    '2024.3.25.0',
    '2024.3.18.0',
    '2024.3.11.0',
    '2024.2.5.0',
    '2024.2.26.0',
    '2024.2.19.0',
    '2024.2.12.0',
    '2024.12.9.0',
    '2024.12.30.0',
    '2024.12.23.0',
    '2024.12.2.0',
    '2024.12.16.0',
    '2024.11.4.0',
    '2024.11.25.0',
    '2024.11.18.0',
    '2024.11.11.0',
    '2024.10.7.0',
    '2024.10.28.0',
    '2024.10.21.0',
    '2024.10.14.0',
    '2024.1.8.0',
    '2024.1.29.0',
    '2024.1.22.0',
    '2024.1.15.0',
  ] as const,
  aliases: [] as const,
}

export type FacebookcomwatchmanPackage = typeof facebookcomwatchmanPackage
