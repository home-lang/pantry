/**
 * **postgresql** - Mirror of the official PostgreSQL GIT repository. Note that this is just a *mirror* - we don't work with pull requests on github. To contribute, please see https://wiki.postgresql.org/wiki/Submitting_a_Patch
 *
 * @domain `postgresql.org`
 * @programs `clusterdb`, `createdb`, `dropdb`, `dropuser`, `ecpg`, ... (+23 more)
 * @version `18.0.0` (13 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install postgresql.org`
 * @homepage https://www.postgresql.org/
 * @dependencies `openssl.org^1.0.1`, `gnu.org/readline`, `zlib.net`, ... (+4 more)
 * @buildDependencies `gnu.org/bison`, `github.com/westes/flex@^2.5.31`, `perl.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.postgresqlorg
 * console.log(pkg.name)        // "postgresql"
 * console.log(pkg.description) // "Mirror of the official PostgreSQL GIT repositor..."
 * console.log(pkg.programs)    // ["clusterdb", "createdb", ...]
 * console.log(pkg.versions[0]) // "18.0.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/postgresql-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const postgresqlorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'postgresql' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'postgresql.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Mirror of the official PostgreSQL GIT repository. Note that this is just a *mirror* - we don\'t work with pull requests on github. To contribute, please see https://wiki.postgresql.org/wiki/Submitting_a_Patch' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/postgresql.org/package.yml' as const,
  homepageUrl: 'https://www.postgresql.org/' as const,
  githubUrl: 'https://github.com/postgres/postgres' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install postgresql.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +postgresql.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install postgresql.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'clusterdb',
    'createdb',
    'dropdb',
    'dropuser',
    'ecpg',
    'initdb',
    'pg_archivecleanup',
    'pg_basebackup',
    'pg_config',
    'pg_controldata',
    'pg_ctl',
    'pg_dump',
    'pg_dumpall',
    'pg_isready',
    'pg_receivewal',
    'pg_recvlogical',
    'pg_resetwal',
    'pg_restore',
    'pg_rewind',
    'pg_test_fsync',
    'pg_test_timing',
    'pg_upgrade',
    'pg_waldump',
    'pgbench',
    'postgres',
    'psql',
    'reindexdb',
    'vacuumdb',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'openssl.org^1.0.1',
    'gnu.org/readline',
    'zlib.net',
    'lz4.org',
    'gnome.org/libxml2~2.13 # abi changed in 2.14',
    'gnome.org/libxslt',
    'unicode.org^73',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   */
  buildDependencies: [
    'gnu.org/bison',
    'github.com/westes/flex@^2.5.31',
    'perl.org',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '18.0.0',
    '17.2.0',
    '17.0.0',
    '16.1.0',
    '16.0.0',
    '15.2.0',
    '14.7.0',
    '13.12.0',
    '13.11.0',
    '13.9.0',
    '13.1.0',
    '12.14.0',
    '11.19.0',
  ] as const,
  aliases: [] as const,
}

export type PostgresqlorgPackage = typeof postgresqlorgPackage
