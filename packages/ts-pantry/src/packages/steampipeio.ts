/**
 * **steampipe** - Zero-ETL, infinite possibilities. Live query APIs, code & more with SQL. No DB required.
 *
 * @domain `steampipe.io`
 * @programs `steampipe`
 * @version `2.3.4` (43 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install steampipe.io`
 * @homepage https://steampipe.io/
 * @buildDependencies `go.dev@^1.24`, `goreleaser.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.steampipeio
 * console.log(pkg.name)        // "steampipe"
 * console.log(pkg.description) // "Zero-ETL, infinite possibilities. Live query AP..."
 * console.log(pkg.programs)    // ["steampipe"]
 * console.log(pkg.versions[0]) // "2.3.4" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/steampipe-io.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const steampipeioPackage = {
  /**
   * The display name of this package.
   */
  name: 'steampipe' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'steampipe.io' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Zero-ETL, infinite possibilities. Live query APIs, code & more with SQL. No DB required.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/steampipe.io/package.yml' as const,
  homepageUrl: 'https://steampipe.io/' as const,
  githubUrl: 'https://github.com/turbot/steampipe' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install steampipe.io' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +steampipe.io -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install steampipe.io' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'steampipe',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.24',
    'goreleaser.com',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '2.3.4',
    '2.3.3',
    '2.3.2',
    '2.3.1',
    '2.3.0',
    '2.2.0',
    '2.1.0',
    '2.0.1',
    '2.0.0',
    '1.2.0',
    '1.1.4',
    '1.1.3',
    '1.1.2',
    '1.1.1',
    '1.1.0',
    '1.0.3',
    '1.0.2',
    '1.0.1',
    '1.0.0',
    '0.24.2',
    '0.24.1',
    '0.24.0',
    '0.23.5',
    '0.23.4',
    '0.23.3',
    '0.23.2',
    '0.23.1',
    '0.23.0',
    '0.22.2',
    '0.22.1',
    '0.22.0',
    '0.21.8',
    '0.21.7',
    '0.21.6',
    '0.21.5',
    '0.21.4',
    '0.21.3',
    '0.21.2',
    '0.21.1',
    '0.21.0',
    '0.20.12',
    '0.20.11',
    '0.20.10',
  ] as const,
  aliases: [] as const,
}

export type SteampipeioPackage = typeof steampipeioPackage
