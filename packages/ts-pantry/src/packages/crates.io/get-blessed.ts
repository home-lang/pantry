/**
 * **get-blessed** - Terminal tool to get you the best crates for your rust projects, curated by blessed.rs
 *
 * @domain `crates.io/get-blessed`
 * @programs `get-blessed`
 * @version `0.2.1` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/get-blessed`
 * @homepage https://crates.io/crates/get-blessed
 * @dependencies `linux:openssl.org` (includes OS-specific dependencies with `os:package` format)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiogetblessed
 * console.log(pkg.name)        // "get-blessed"
 * console.log(pkg.description) // "Terminal tool to get you the best crates for yo..."
 * console.log(pkg.programs)    // ["get-blessed"]
 * console.log(pkg.versions[0]) // "0.2.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/get-blessed.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiogetblessedPackage = {
  /**
  * The display name of this package.
  */
  name: 'get-blessed' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'crates.io/get-blessed' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Terminal tool to get you the best crates for your rust projects, curated by blessed.rs ' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/get-blessed/package.yml' as const,
  homepageUrl: 'https://crates.io/crates/get-blessed' as const,
  githubUrl: 'https://github.com/josueBarretogit/get_blessed_rs' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install crates.io/get-blessed' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/get-blessed -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/get-blessed' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'get-blessed',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'linux:openssl.org',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.2.1',
    '0.2.0',
    '0.1.3',
  ] as const,
  aliases: [] as const,
}

export type CratesiogetblessedPackage = typeof cratesiogetblessedPackage
