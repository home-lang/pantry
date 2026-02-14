/**
 * **berkeley-db** - High performance key/value database
 *
 * @domain `oracle.com/berkeley-db`
 * @programs `db_verify`, `db_upgrade`, `db_tuner`, `db_replicate`, `db_stat`, ... (+10 more)
 * @version `18.1.40` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install oracle.com/berkeley-db`
 * @homepage https://www.oracle.com/database/technologies/related/berkeleydb.html
 * @dependencies `openssl.org^1.1.1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.oraclecomberkeleydb
 * console.log(pkg.name)        // "berkeley-db"
 * console.log(pkg.description) // "High performance key/value database"
 * console.log(pkg.programs)    // ["db_verify", "db_upgrade", ...]
 * console.log(pkg.versions[0]) // "18.1.40" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/oracle-com/berkeley-db.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const oraclecomberkeleydbPackage = {
  /**
  * The display name of this package.
  */
  name: 'berkeley-db' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'oracle.com/berkeley-db' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'High performance key/value database' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/oracle.com/berkeley-db/package.yml' as const,
  homepageUrl: 'https://www.oracle.com/database/technologies/related/berkeleydb.html' as const,
  githubUrl: '' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install oracle.com/berkeley-db' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +oracle.com/berkeley-db -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install oracle.com/berkeley-db' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'db_verify',
    'db_upgrade',
    'db_tuner',
    'db_replicate',
    'db_stat',
    'db_recover',
    'db_load',
    'db_log_verify',
    'db_printlog',
    'db_dump',
    'db_hotbackup',
    'db_deadlock',
    'db_checkpoint',
    'db_convert',
    'db_archive',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'openssl.org^1.1.1',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '18.1.40',
  ] as const,
  aliases: [] as const,
}

export type OraclecomberkeleydbPackage = typeof oraclecomberkeleydbPackage
