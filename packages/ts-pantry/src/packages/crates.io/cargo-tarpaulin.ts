/**
 * **cargo-tarpaulin** - A code coverage tool for Rust projects
 *
 * @domain `crates.io/cargo-tarpaulin`
 * @programs `cargo-tarpaulin`
 * @version `0.35.1` (16 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/cargo-tarpaulin`
 * @homepage https://crates.io/crates/cargo-tarpaulin
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiocargotarpaulin
 * console.log(pkg.name)        // "cargo-tarpaulin"
 * console.log(pkg.description) // "A code coverage tool for Rust projects"
 * console.log(pkg.programs)    // ["cargo-tarpaulin"]
 * console.log(pkg.versions[0]) // "0.35.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/cargo-tarpaulin.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiocargotarpaulinPackage = {
  /**
   * The display name of this package.
   */
  name: 'cargo-tarpaulin' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/cargo-tarpaulin' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A code coverage tool for Rust projects' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/cargo-tarpaulin/package.yml' as const,
  homepageUrl: 'https://crates.io/crates/cargo-tarpaulin' as const,
  githubUrl: 'https://github.com/xd009642/tarpaulin' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/cargo-tarpaulin' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/cargo-tarpaulin -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/cargo-tarpaulin' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'cargo-tarpaulin',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.35.1',
    '0.35.0',
    '0.34.1',
    '0.34.0',
    '0.33.0',
    '0.32.8',
    '0.32.7',
    '0.32.6',
    '0.32.5',
    '0.32.4',
    '0.32.3',
    '0.32.2',
    '0.32.1',
    '0.32.0',
    '0.31.5',
    '0.31.4',
  ] as const,
  aliases: [] as const,
}

export type CratesiocargotarpaulinPackage = typeof cratesiocargotarpaulinPackage
