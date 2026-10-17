/**
 * **postgres** - Mirror of the official PostgreSQL GIT repository. Note that this is just a *mirror* - we don't work with pull requests on github. To contribute, please see https://wiki.postgresql.org/wiki/Submitting_a_Patch
 *
 * @domain `postgresql.org`
 * @programs `clusterdb`, `createdb`, `dropdb`, `dropuser`, `ecpg`, ... (+23 more)
 * @version `18.6` (88 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install postgresql.org`
 * @aliases `postgres`
 * @homepage https://www.postgresql.org/
 * @dependencies `openssl.org^3`, `gnu.org/readline`, `zlib.net`, ... (+4 more)
 * @buildDependencies `gnu.org/bison`, `github.com/westes/flex^2.5.31`, `perl.org` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * // Access via alias (recommended)
 * const pkg = pantry.postgres
 * // Or access via domain
 * const samePkg = pantry.postgresqlorg
 * console.log(pkg === samePkg) // true
 * console.log(pkg.name)        // "postgresql"
 * console.log(pkg.description) // "Mirror of the official PostgreSQL GIT repositor..."
 * console.log(pkg.programs)    // ["clusterdb", "createdb", ...]
 * console.log(pkg.versions[0]) // "18.6" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/postgresql-org.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const postgresPackage = {
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install postgresql.org' as const,
  pantryInstallCommand: 'pantry install postgresql.org' as const,
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
    'openssl.org^3',
    'gnu.org/readline',
    'zlib.net',
    'lz4.org',
    'gnome.org/libxml2~2.15.1',
    'gnome.org/libxslt',
    'unicode.org^73',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/bison',
    'github.com/westes/flex^2.5.31',
    'perl.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '18.6',
    '18.4',
    '18.3',
    '18.2',
    '18.1',
    '18.0',
    '18.0.0',
    '17.11',
    '17.10',
    '17.9',
    '17.8',
    '17.7',
    '17.6',
    '17.5',
    '17.4',
    '17.3',
    '17.2',
    '17.2.0',
    '17.1',
    '17.0',
    '17.0.0',
    '16.15',
    '16.14',
    '16.13',
    '16.12',
    '16.11',
    '16.10',
    '16.9',
    '16.8',
    '16.7',
    '16.6',
    '16.5',
    '16.4',
    '16.3',
    '16.2',
    '16.1',
    '16.1.0',
    '16.0',
    '16.0.0',
    '15.19',
    '15.18',
    '15.17',
    '15.16',
    '15.15',
    '15.14',
    '15.13',
    '15.12',
    '15.11',
    '15.10',
    '15.9',
    '15.8',
    '15.7',
    '15.6',
    '15.5',
    '15.4',
    '15.3',
    '15.2',
    '15.2.0',
    '15.1',
    '15.0',
    '14.24',
    '14.23',
    '14.22',
    '14.21',
    '14.20',
    '14.19',
    '14.18',
    '14.17',
    '14.16',
    '14.15',
    '14.14',
    '14.13',
    '14.12',
    '14.11',
    '14.10',
    '14.9',
    '14.8',
    '14.7',
    '14.7.0',
    '14.6',
    '14.5',
    '14.4',
    '13.12.0',
    '13.11.0',
    '13.9.0',
    '13.1.0',
    '12.14.0',
    '11.19.0',
  ] as const,
  /**
  * Alternative names for this package.
  * You can use any of these names to access the package.
  */
  aliases: [
    'postgres',
  ] as const,
}

export type PostgresPackage = typeof postgresPackage
