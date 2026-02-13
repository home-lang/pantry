/**
 * **org-stats** - Get the contributor stats summary from all repos of any given organization
 *
 * @domain `github.com/caarlos0/org-stats`
 * @programs `org-stats`
 * @version `1.12.2` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/caarlos0/org-stats`
 * @buildDependencies `go.dev@^1.18` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomcaarlos0orgstats
 * console.log(pkg.name)        // "org-stats"
 * console.log(pkg.description) // "Get the contributor stats summary from all repo..."
 * console.log(pkg.programs)    // ["org-stats"]
 * console.log(pkg.versions[0]) // "1.12.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/caarlos0/org-stats.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const orgstatsPackage = {
  /**
   * The display name of this package.
   */
  name: 'org-stats' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'github.com/caarlos0/org-stats' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Get the contributor stats summary from all repos of any given organization' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/caarlos0/org-stats/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/caarlos0/org-stats' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install github.com/caarlos0/org-stats' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/caarlos0/org-stats -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/caarlos0/org-stats' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'org-stats',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'go.dev@^1.18',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.12.2',
    '1.12.1',
    '1.12.0',
    '1.11.2',
  ] as const,
  aliases: [] as const,
}

export type OrgstatsPackage = typeof orgstatsPackage
