/**
 * **portfolio_rs** - A command line tool for managing financial investment portfolios.
 *
 * @domain `crates.io/portfolio_rs`
 * @programs `portfolio_rs`
 * @version `0.7.0` (15 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install crates.io/portfolio_rs`
 * @homepage https://crates.io/crates/portfolio_rs
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.cratesioportfolio_rs
 * console.log(pkg.name)        // "portfolio_rs"
 * console.log(pkg.description) // "A command line tool for managing financial inve..."
 * console.log(pkg.programs)    // ["portfolio_rs"]
 * console.log(pkg.versions[0]) // "0.7.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/crates-io/portfolio_rs.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const cratesioportfolio_rsPackage = {
  /**
   * The display name of this package.
   */
  name: 'portfolio_rs' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'crates.io/portfolio_rs' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'A command line tool for managing financial investment portfolios.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/crates.io/portfolio_rs/package.yml' as const,
  homepageUrl: 'https://crates.io/crates/portfolio_rs' as const,
  githubUrl: 'https://github.com/MarkusZoppelt/portfolio_rs' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install crates.io/portfolio_rs' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +crates.io/portfolio_rs -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install crates.io/portfolio_rs' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'portfolio_rs',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.7.0',
    '0.6.2',
    '0.6.1',
    '0.6.0',
    '0.5.0',
    '0.4.1',
    '0.4.0',
    '0.3.0',
    '0.2.1',
    '0.2.0',
    '0.1.12',
    '0.1.11',
    '0.1.10',
    '0.1.9',
    '0.1.8',
  ] as const,
  aliases: [] as const,
}

export type Cratesioportfolio_rsPackage = typeof cratesioportfolio_rsPackage
