/**
 * **kaspa** - Kaspa full-node reference implementation and related libraries in the Rust programming language
 *
 * @domain `github.com/kaspanet/rusty-kaspa`
 * @programs `kaspad`, `kaspa-cli`
 * @version `1.0.1` (16 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/kaspanet/rusty-kaspa`
 * @dependencies `linux:openssl.org^1.1` (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `protobuf.dev`, `abseil.io@^20250127`, `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomkaspanetrustykaspa
 * console.log(pkg.name)        // "kaspa"
 * console.log(pkg.description) // "Kaspa full-node reference implementation and re..."
 * console.log(pkg.programs)    // ["kaspad", "kaspa-cli"]
 * console.log(pkg.versions[0]) // "1.0.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/kaspanet/rusty-kaspa.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const rustykaspaPackage = {
  /**
   * The display name of this package.
   */
  name: 'kaspa' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/kaspanet/rusty-kaspa' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Kaspa full-node reference implementation and related libraries in the Rust programming language' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/kaspanet/rusty-kaspa/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/kaspanet/rusty-kaspa' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/kaspanet/rusty-kaspa' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/kaspanet/rusty-kaspa -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/kaspanet/rusty-kaspa' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'kaspad',
    'kaspa-cli',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'linux:openssl.org^1.1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'protobuf.dev',
    'abseil.io@^20250127',
    'curl.se',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.0.1',
    '1.0.0',
    '0.17.2',
    '0.17.1',
    '0.17.0',
    '0.16.1',
    '0.16.0',
    '0.15.2',
    '0.15.1',
    '0.14.1',
    '0.13.6',
    '0.13.4',
    '0.13.3',
    '0.13.2',
    '0.13.0',
    '0.1.7',
  ] as const,
  aliases: [] as const,
}

export type RustykaspaPackage = typeof rustykaspaPackage
