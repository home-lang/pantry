/**
 * **justwatchcom/sql_exporter** - Database agnostic SQL exporter for Prometheus
 *
 * @domain `github.com/justwatchcom/sql_exporter`
 * @programs `sql_exporter`
 * @version `0.5.0` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install github.com/justwatchcom/sql_exporter`
 * @buildDependencies `go.dev@^1.21` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.githubcomjustwatchcomsql_exporter
 * console.log(pkg.name)        // "justwatchcom/sql_exporter"
 * console.log(pkg.description) // "Database agnostic SQL exporter for Prometheus"
 * console.log(pkg.programs)    // ["sql_exporter"]
 * console.log(pkg.versions[0]) // "0.5.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/github-com/justwatchcom/sql_exporter.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const sql_exporterPackage = {
  /**
  * The display name of this package.
  */
  name: 'justwatchcom/sql_exporter' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'github.com/justwatchcom/sql_exporter' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Database agnostic SQL exporter for Prometheus' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/github.com/justwatchcom/sql_exporter/package.yml' as const,
  homepageUrl: '' as const,
  githubUrl: 'https://github.com/free/sql_exporter' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install github.com/justwatchcom/sql_exporter' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +github.com/justwatchcom/sql_exporter -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install github.com/justwatchcom/sql_exporter' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'sql_exporter',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'go.dev@^1.21',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '0.5.0',
  ] as const,
  aliases: [] as const,
}

export type Sql_exporterPackage = typeof sql_exporterPackage
