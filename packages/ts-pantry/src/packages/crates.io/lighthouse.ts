/**
 * **lighthouse** - Ethereum consensus client in Rust
 *
 * @domain `crates.io/lighthouse`
 * @programs `lighthouse`
 * @version `8.0.1` (22 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/lighthouse`
 * @homepage https://lighthouse.sigmaprime.io/
 * @dependencies `zlib.net^1`
 * @buildDependencies `cmake.org@^3.12`, `protobuf.dev` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiolighthouse
 * console.log(pkg.name)        // "lighthouse"
 * console.log(pkg.description) // "Ethereum consensus client in Rust"
 * console.log(pkg.programs)    // ["lighthouse"]
 * console.log(pkg.versions[0]) // "8.0.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/lighthouse.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiolighthousePackage = {
  /**
   * The display name of this package.
   */
  name: 'lighthouse' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/lighthouse' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Ethereum consensus client in Rust' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/lighthouse/package.yml' as const,
  homepageUrl: 'https://lighthouse.sigmaprime.io/' as const,
  githubUrl: 'https://github.com/sigp/lighthouse' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/lighthouse' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/lighthouse -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/lighthouse' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'lighthouse',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'zlib.net^1',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'cmake.org@^3.12',
    'protobuf.dev',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '8.0.1',
    '8.0.0',
    '7.1.0',
    '7.0.1',
    '7.0.0',
    '6.0.1',
    '6.0.0',
    '5.3.0',
    '5.2.1',
    '5.2.0',
    '5.1.3',
    '5.1.2',
    '5.1.1',
    '5.1.0',
    '5.0.0',
    '4.6.0',
    '4.5.0',
    '4.4.1',
    '4.3.0',
    '4.2.0',
    '4.1.0',
    '4.0.1',
  ] as const,
  aliases: [] as const,
}

export type CratesiolighthousePackage = typeof cratesiolighthousePackage
