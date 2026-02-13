/**
 * **tw** - A lightweight TUI application to view and query tabular data files, such as CSV, TSV, and parquet.
 *
 * @domain `crates.io/tabiew`
 * @programs `tw`
 * @version `0.12.0` (26 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/tabiew`
 * @dependencies `linux:openssl.org` (includes OS-specific dependencies with `os:package` format)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesiotabiew
 * console.log(pkg.name)        // "tw"
 * console.log(pkg.description) // "A lightweight TUI application to view and query..."
 * console.log(pkg.programs)    // ["tw"]
 * console.log(pkg.versions[0]) // "0.12.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/tabiew.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesiotabiewPackage = {
  /**
   * The display name of this package.
   */
  name: 'tw' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/tabiew' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A lightweight TUI application to view and query tabular data files, such as CSV, TSV, and parquet.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/tabiew/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/shshemi/tabiew' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/tabiew' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/tabiew -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/tabiew' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'tw',
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
    '0.12.0',
    '0.11.1',
    '0.11.0',
    '0.10.1',
    '0.10.0',
    '0.9.4',
    '0.9.0',
    '0.8.5',
    '0.8.4',
    '0.8.3',
    '0.8.2',
    '0.8.1',
    '0.8.0',
    '0.7.1',
    '0.7.0',
    '0.6.3',
    '0.6.2',
    '0.6.1',
    '0.6.0',
    '0.5.0',
    '0.4.3',
    '0.4.2',
    '0.4.1',
    '0.4.0',
    '0.3.5',
    '0.3.4',
  ] as const,
  aliases: [] as const,
}

export type CratesiotabiewPackage = typeof cratesiotabiewPackage
