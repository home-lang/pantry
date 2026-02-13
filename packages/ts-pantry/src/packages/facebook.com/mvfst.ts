/**
 * **mvfst** - An implementation of the QUIC transport protocol.
 *
 * @domain `facebook.com/mvfst`
 * @version `2026.1.5.0` (108 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install facebook.com/mvfst`
 * @dependencies `boost.org`, `github.com/facebookincubator/fizz`, `fmt.dev^12`, ... (+6 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `cmake.org`, `linux:gnu.org/gcc@13`, `linux:gnu.org/binutils`, ... (+1 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.facebookcommvfst
 * console.log(pkg.name)        // "mvfst"
 * console.log(pkg.description) // "An implementation of the QUIC transport protocol."
 * console.log(pkg.versions[0]) // "2026.1.5.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/facebook-com/mvfst.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const facebookcommvfstPackage = {
  /**
   * The display name of this package.
   */
  name: 'mvfst' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'facebook.com/mvfst' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'An implementation of the QUIC transport protocol.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/facebook.com/mvfst/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/facebook/mvfst' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install facebook.com/mvfst' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +facebook.com/mvfst -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install facebook.com/mvfst' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'boost.org',
    'github.com/facebookincubator/fizz',
    'fmt.dev^12',
    'facebook.com/folly',
    'gflags.github.io',
    'google.com/glog',
    'openssl.org',
    'linux:libsodium.org^1.0.19',
    'linux:gnu.org/gcc/libstdcxx@13',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'cmake.org',
    'linux:gnu.org/gcc@13',
    'linux:gnu.org/binutils',
    'linux:gnu.org/make',
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
    '2025.11.3.0',
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
    '2023.12.4.0',
    '2023.12.25.0',
    '2023.12.18.0',
    '2023.12.11.0',
    '2023.11.6.0',
    '2023.11.27.0',
    '2023.11.20.0',
    '2023.11.13.0',
    '2023.10.30.0',
    '2023.10.23.0',
  ] as const,
  aliases: [] as const,
}

export type FacebookcommvfstPackage = typeof facebookcommvfstPackage
