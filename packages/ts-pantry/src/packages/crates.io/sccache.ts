/**
 * **sccache** - Sccache is a ccache-like tool. It is used as a compiler wrapper and avoids compilation when possible. Sccache has the capability to utilize caching in remote storage environments, including various cloud storage options, or alternatively, in local storage.
 *
 * @domain `crates.io/sccache`
 * @programs `sccache`
 * @version `0.13.0` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/sccache`
 * @dependencies `openssl.org^1.1`, `curl.se/ca-certs`
 * @buildDependencies `openssl.org@^1.1` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiosccache
 * console.log(pkg.name)        // "sccache"
 * console.log(pkg.description) // "Sccache is a ccache-like tool. It is used as a ..."
 * console.log(pkg.programs)    // ["sccache"]
 * console.log(pkg.versions[0]) // "0.13.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/sccache.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiosccachePackage = {
  /**
   * The display name of this package.
   */
  name: 'sccache' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/sccache' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Sccache is a ccache-like tool. It is used as a compiler wrapper and avoids compilation when possible. Sccache has the capability to utilize caching in remote storage environments, including various cloud storage options, or alternatively, in local storage.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/sccache/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/mozilla/sccache' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/sccache' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/sccache -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/sccache' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'sccache',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openssl.org^1.1',
    'curl.se/ca-certs',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'openssl.org@^1.1',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.13.0',
    '0.12.0',
    '0.11.0',
    '0.10.0',
    '0.9.1',
    '0.9.0',
    '0.8.2',
    '0.8.1',
  ] as const,
  aliases: [] as const,
}

export type CratesiosccachePackage = typeof cratesiosccachePackage
