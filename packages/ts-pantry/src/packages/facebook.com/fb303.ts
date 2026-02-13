/**
 * **fb303** - fb303 is a core set of thrift functions that provide a common mechanism for querying stats and other information from a service.
 *
 * @domain `facebook.com/fb303`
 * @version `2026.1.5.0` (102 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install facebook.com/fb303`
 * @dependencies `github.com/facebookincubator/fizz`, `facebook.com/wangle`, `facebook.com/folly`, ... (+9 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `cmake.org`, `facebook.com/mvfst`, `boost.org@^1.84`, ... (+1 more) (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.facebookcomfb303
 * console.log(pkg.name)        // "fb303"
 * console.log(pkg.description) // "fb303 is a core set of thrift functions that pr..."
 * console.log(pkg.versions[0]) // "2026.1.5.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/facebook-com/fb303.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const facebookcomfb303Package = {
  /**
   * The display name of this package.
   */
  name: 'fb303' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'facebook.com/fb303' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'fb303 is a core set of thrift functions that provide a common mechanism for querying stats and other information from a service.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/facebook.com/fb303/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/facebook/fb303' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install facebook.com/fb303' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +facebook.com/fb303 -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install facebook.com/fb303' as const,
  programs: [] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'github.com/facebookincubator/fizz',
    'facebook.com/wangle',
    'facebook.com/folly',
    'facebook.com/fbthrift>=2023.12.18.0',
    'fmt.dev^12',
    'gflags.github.io^2.2.2',
    'google.com/glog^0.6',
    'libsodium.org^1.0.19',
    'openssl.org^1.1',
    'github.com/Cyan4973/xxHash^0.8 # since 2024.10.14.0',
    'linux:zlib.net^1',
    'linux:gnu.org/gcc/libstdcxx@13',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'cmake.org',
    'facebook.com/mvfst',
    'boost.org@^1.84',
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
    '2025.2.24.0',
    '2025.2.17.0',
    '2025.2.10.0',
    '2025.12.29.0',
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
    '2024.6.3.0',
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
    '2024.3.25.0',
    '2024.3.18.0',
    '2024.3.11.0',
    '2024.2.5.0',
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
    '2023.12.25.0',
    '2023.12.18.0',
  ] as const,
  aliases: [] as const,
}

export type Facebookcomfb303Package = typeof facebookcomfb303Package
