/**
 * **dua** - View disk space usage and delete unwanted data, fast.
 *
 * @domain `crates.io/dua`
 * @programs `dua`
 * @version `2.33.0` (31 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/dua`
 * @homepage https://lib.rs/crates/dua-cli
 * @dependencies `zlib.net^1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiodua
 * console.log(pkg.name)        // "dua"
 * console.log(pkg.description) // "View disk space usage and delete unwanted data,..."
 * console.log(pkg.programs)    // ["dua"]
 * console.log(pkg.versions[0]) // "2.33.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/dua.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesioduaPackage = {
  /**
   * The display name of this package.
   */
  name: 'dua' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/dua' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'View disk space usage and delete unwanted data, fast.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/dua/package.yml' as const,
  homepageUrl: 'https://lib.rs/crates/dua-cli' as const,
  githubUrl: 'https://github.com/Byron/dua-cli' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/dua' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/dua -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/dua' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'dua',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'zlib.net^1',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.33.0',
    '2.32.2',
    '2.32.1',
    '2.32.0',
    '2.31.0',
    '2.30.1',
    '2.30.0',
    '2.29.4',
    '2.29.3',
    '2.29.2',
    '2.29.1',
    '2.29.0',
    '2.28.0',
    '2.27.2',
    '2.27.1',
    '2.27.0',
    '2.26.0',
    '2.25.0',
    '2.24.2',
    '2.24.1',
    '2.24.0',
    '2.23.0',
    '2.22.0',
    '2.21.0',
    '2.20.3',
    '2.20.2',
    '2.20.1',
    '2.20.0',
    '2.19.2',
    '2.19.1',
    '2.19.0',
  ] as const,
  aliases: [] as const,
}

export type CratesioduaPackage = typeof cratesioduaPackage
