/**
 * **flamegraph** - Easy flamegraphs for Rust projects and everything else, without Perl or pipes <3
 *
 * @domain `crates.io/flamegraph`
 * @programs `flamegraph`, `cargo-flamegraph`
 * @version `0.6.11` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/flamegraph`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesioflamegraph
 * console.log(pkg.name)        // "flamegraph"
 * console.log(pkg.description) // "Easy flamegraphs for Rust projects and everythi..."
 * console.log(pkg.programs)    // ["flamegraph", "cargo-flamegraph"]
 * console.log(pkg.versions[0]) // "0.6.11" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/flamegraph.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesioflamegraphPackage = {
  /**
   * The display name of this package.
   */
  name: 'flamegraph' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/flamegraph' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Easy flamegraphs for Rust projects and everything else, without Perl or pipes <3' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/flamegraph/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/flamegraph-rs/flamegraph' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/flamegraph' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/flamegraph -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/flamegraph' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'flamegraph',
    'cargo-flamegraph',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.6.11',
    '0.6.10',
    '0.6.9',
    '0.6.8',
    '0.6.7',
  ] as const,
  aliases: [] as const,
}

export type CratesioflamegraphPackage = typeof cratesioflamegraphPackage
