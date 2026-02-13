/**
 * **flyway** - Database version control to control migrations
 *
 * @domain `flywaydb.org`
 * @programs `flyway`
 * @version `11.20.2` (60 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install flywaydb.org`
 * @homepage https://flywaydb.org/
 * @dependencies `openjdk.org^21`
 * @buildDependencies `curl.se` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.flywaydborg
 * console.log(pkg.name)        // "flyway"
 * console.log(pkg.description) // "Database version control to control migrations"
 * console.log(pkg.programs)    // ["flyway"]
 * console.log(pkg.versions[0]) // "11.20.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/flywaydb-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const flywaydborgPackage = {
  /**
   * The display name of this package.
   */
  name: 'flyway' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'flywaydb.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Database version control to control migrations' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/flywaydb.org/package.yml' as const,
  homepageUrl: 'https://flywaydb.org/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install flywaydb.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +flywaydb.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install flywaydb.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'flyway',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openjdk.org^21',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'curl.se',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '11.20.2',
    '11.20.1',
    '11.20.0',
    '11.19.1',
    '11.19.0',
    '11.18.0',
    '11.17.2',
    '11.17.1',
    '11.17.0',
    '11.16.0',
    '11.15.0',
    '11.14.1',
    '11.14.0',
    '11.13.3',
    '11.13.2',
    '11.13.1',
    '11.13.0',
    '11.12.0',
    '11.11.2',
    '11.8.2',
    '11.8.1',
    '11.8.0',
    '11.7.2',
    '11.7.1',
    '11.7.0',
    '11.6.0',
    '11.5.0',
    '11.4.1',
    '11.4.0',
    '11.3.4',
    '11.3.3',
    '11.3.2',
    '11.3.1',
    '11.3.0',
    '11.2.0',
    '11.1.1',
    '11.1.0',
    '11.0.1',
    '11.0.0',
    '10.22.0',
    '10.21.0',
    '10.20.1',
    '10.20.0',
    '10.19.0',
    '10.18.2',
    '10.18.1',
    '10.18.0',
    '10.17.3',
    '10.17.2',
    '10.17.1',
    '10.17.0',
    '10.16.0',
    '10.15.2',
    '10.15.0',
    '10.14.0',
    '10.13.0',
    '10.12.0',
    '10.11.1',
    '10.11.0',
    '10.10.0',
  ] as const,
  aliases: [] as const,
}

export type FlywaydborgPackage = typeof flywaydborgPackage
