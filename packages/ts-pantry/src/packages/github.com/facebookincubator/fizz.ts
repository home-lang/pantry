/**
 * **fizz** - C++14 implementation of the TLS-1.3 standard
 *
 * @domain `github.com/facebookincubator/fizz`
 * @programs `fizz`
 * @version `2026.1.5.0` (132 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/facebookincubator/fizz`
 * @dependencies `boost.org`, `google.com/double-conversion^3`, `fmt.dev^12`, ... (+12 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `cmake.org@^3`, `linux:gnu.org/gcc@13` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomfacebookincubatorfizz
 * console.log(pkg.name)        // "fizz"
 * console.log(pkg.description) // "C++14 implementation of the TLS-1.3 standard"
 * console.log(pkg.programs)    // ["fizz"]
 * console.log(pkg.versions[0]) // "2026.1.5.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/facebookincubator/fizz.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const fizzPackage = {
  /**
   * The display name of this package.
   */
  name: 'fizz' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/facebookincubator/fizz' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'C++14 implementation of the TLS-1.3 standard' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/facebookincubator/fizz/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/facebookincubator/fizz' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/facebookincubator/fizz' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/facebookincubator/fizz -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/facebookincubator/fizz' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'fizz',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'boost.org',
    'google.com/double-conversion^3',
    'fmt.dev^12',
    'facebook.com/folly',
    'gflags.github.io',
    'google.com/glog<0.7',
    'libevent.org',
    'libsodium.org',
    'lz4.org@1',
    'openssl.org^1.1',
    'google.github.io/snappy',
    'facebook.com/zstd@1',
    'sourceware.org/bzip2@1',
    'zlib.net^1',
    'linux:gnu.org/gcc/libstdcxx@13',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'cmake.org@^3',
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
    '2025.9.8.0',
    '2025.9.29.0',
    '2025.9.22.0',
    '2025.9.15.0',
    '2025.9.1.0',
    '2025.8.4.0',
    '2025.8.25.0',
    '2025.8.18.0',
    '2025.8.11.0',
    '2025.7.7.0',
    '2025.7.28.0',
    '2025.7.21.0',
    '2025.7.14.0',
    '2025.6.9.0',
    '2025.6.30.0',
    '2025.6.23.0',
    '2025.6.2.0',
    '2025.6.16.0',
    '2025.5.5.0',
    '2025.5.26.0',
    '2025.5.19.0',
    '2025.5.12.0',
    '2025.4.7.0',
    '2025.4.28.0',
    '2025.4.21.0',
    '2025.4.14.0',
    '2025.3.31.0',
    '2025.3.3.0',
    '2025.3.24.0',
    '2025.3.17.0',
    '2025.3.10.0',
    '2025.2.3.0',
    '2025.2.17.0',
    '2025.2.10.0',
    '2025.12.29.0',
    '2025.12.22.0',
    '2025.12.15.0',
    '2025.11.3.0',
    '2025.11.24.0',
    '2025.11.17.0',
    '2025.11.10.0',
    '2025.10.6.0',
    '2025.10.27.0',
    '2025.10.20.0',
    '2025.10.13.0',
    '2025.1.6.0',
    '2025.1.27.0',
    '2025.1.20.0',
    '2025.1.13.0',
    '2024.9.30.0',
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
    '2024.6.24.0',
    '2024.6.17.0',
    '2024.6.10.0',
    '2024.5.27.0',
    '2024.5.20.0',
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
    '2024.1.1.0',
    '2023.9.4.0',
    '2023.9.25.0',
    '2023.9.18.0',
    '2023.9.11.0',
    '2023.8.28.0',
    '2023.8.14.0',
    '2023.7.3.0',
    '2023.7.24.0',
    '2023.7.17.0',
    '2023.7.10.0',
    '2023.6.8.0',
    '2023.6.26.0',
    '2023.6.19.0',
    '2023.5.8.0',
    '2023.5.22.0',
    '2023.5.15.0',
    '2023.5.1.0',
    '2023.12.4.0',
    '2023.12.25.0',
    '2023.12.18.0',
    '2023.12.11.0',
    '2023.11.6.0',
    '2023.11.27.0',
    '2023.11.20.0',
    '2023.11.13.0',
    '2023.10.9.0',
    '2023.10.30.0',
    '2023.10.23.0',
    '2023.10.2.0',
    '2023.10.16.0',
  ] as const,
  aliases: [] as const,
}

export type FizzPackage = typeof fizzPackage
