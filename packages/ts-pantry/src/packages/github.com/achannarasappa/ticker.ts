/**
 * **ticker** - Terminal stock ticker with live updates and position tracking
 *
 * @domain `github.com/achannarasappa/ticker`
 * @programs `ticker`
 * @version `5.2.0` (15 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/achannarasappa/ticker`
 * @buildDependencies `go.dev@~1.22.0` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomachannarasappaticker
 * console.log(pkg.name)        // "ticker"
 * console.log(pkg.description) // "Terminal stock ticker with live updates and pos..."
 * console.log(pkg.programs)    // ["ticker"]
 * console.log(pkg.versions[0]) // "5.2.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/achannarasappa/ticker.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const tickerPackage = {
  /**
   * The display name of this package.
   */
  name: 'ticker' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/achannarasappa/ticker' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Terminal stock ticker with live updates and position tracking' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/achannarasappa/ticker/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/achannarasappa/ticker' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/achannarasappa/ticker' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/achannarasappa/ticker -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/achannarasappa/ticker' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'ticker',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@~1.22.0',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '5.2.0',
    '5.1.0',
    '5.0.7',
    '5.0.6',
    '5.0.5',
    '5.0.4',
    '5.0.3',
    '5.0.2',
    '5.0.1',
    '5.0.0',
    '4.8.1',
    '4.8.0',
    '4.7.1',
    '4.7.0',
    '4.6.3',
  ] as const,
  aliases: [] as const,
}

export type TickerPackage = typeof tickerPackage
