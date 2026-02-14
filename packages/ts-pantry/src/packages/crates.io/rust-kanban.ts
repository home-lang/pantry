/**
 * **rust-kanban** - A kanban board for the terminal built with ❤️ in Rust
 *
 * @domain `crates.io/rust-kanban`
 * @programs `rust-kanban`
 * @version `0.10.5` (8 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/rust-kanban`
 * @homepage https://crates.io/crates/rust-kanban
 * @dependencies `openssl.org^1.1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiorustkanban
 * console.log(pkg.name)        // "rust-kanban"
 * console.log(pkg.description) // "A kanban board for the terminal built with ❤️ i..."
 * console.log(pkg.programs)    // ["rust-kanban"]
 * console.log(pkg.versions[0]) // "0.10.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/rust-kanban.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiorustkanbanPackage = {
  /**
  * The display name of this package.
  */
  name: 'rust-kanban' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/rust-kanban' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A kanban board for the terminal built with ❤️ in Rust' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/rust-kanban/package.yml' as const,
  homepageUrl: 'https://crates.io/crates/rust-kanban' as const,
  githubUrl: 'https://github.com/yashs662/rust_kanban' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install crates.io/rust-kanban' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/rust-kanban -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/rust-kanban' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'rust-kanban',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'openssl.org^1.1',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.10.5',
    '0.10.4',
    '0.10.3',
    '0.10.2',
    '0.10.1',
    '0.10.0',
    '0.9.7',
    '0.9.6',
  ] as const,
  aliases: [] as const,
}

export type CratesiorustkanbanPackage = typeof cratesiorustkanbanPackage
