/**
 * **mysql** - MySQL Server, the world's most popular open source database, and MySQL Cluster, a real-time, open source transactional database.
 *
 * @domain `mysql.com`
 * @programs `mysql_client_test`, `my_print_defaults`, `myisam_ftdump`, `myisamchk`, `myisamlog`, ... (+26 more)
 * @version `9.6.0` (32 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install mysql.com`
 * @homepage http://www.mysql.com/
 * @dependencies `unicode.org^71`, `libevent.org^2`, `lz4.org^1`, ... (+8 more) (includes OS-specific dependencies with `os:package` format)
 * @buildDependencies `cmake.org@^3`, `gnu.org/bison@>=3.0.4`, `linux:gnu.org/gcc` (includes OS-specific dependencies with `os:package` format) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.mysqlcom
 * console.log(pkg.name)        // "mysql"
 * console.log(pkg.description) // "MySQL Server, the world's most popular open sou..."
 * console.log(pkg.programs)    // ["mysql_client_test", "my_print_defaults", ...]
 * console.log(pkg.versions[0]) // "9.6.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/mysql-com.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const mysqlcomPackage = {
  /**
   * The display name of this package.
   */
  name: 'mysql' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'mysql.com' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'MySQL Server, the world\'s most popular open source database, and MySQL Cluster, a real-time, open source transactional database.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/mysql.com/package.yml' as const,
  homepageUrl: 'http://www.mysql.com/' as const,
  githubUrl: 'https://github.com/mysql/mysql-server' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install mysql.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +mysql.com -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install mysql.com' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'mysql_client_test',
    'my_print_defaults',
    'myisam_ftdump',
    'myisamchk',
    'myisamlog',
    'myisampack',
    'mysql',
    'mysql_config',
    'mysql_config_editor',
    'mysql_keyring_encryption_test',
    'mysql_migrate_keyring',
    'mysql_secure_installation',
    'mysql_tzinfo_to_sql',
    'mysqladmin',
    'mysqlbinlog',
    'mysqlcheck',
    'mysqld',
    'mysqld_multi',
    'mysqld_safe',
    'mysqldump',
    'mysqldumpslow',
    'mysqlimport',
    'mysqlrouter',
    'mysqlrouter_keyring',
    'mysqlrouter_passwd',
    'mysqlrouter_plugin_info',
    'mysqlshow',
    'mysqlslap',
    'mysqltest',
    'mysqltest_safe_process',
    'mysqlxtest',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
   */
  dependencies: [
    'unicode.org^71',
    'libevent.org^2',
    'lz4.org^1',
    'openssl.org^1.1',
    'protobuf.dev^21',
    'zlib.net^1.2',
    'facebook.com/zstd^1',
    'curl.se>=6.0',
    'thrysoee.dk/editline^3',
    'developers.yubico.com/libfido2^1',
    'linux:gnu.org/gcc/libstdcxx@14',
  ] as const,
  /**
   * Build dependencies for this package.
   * These are only required when building the package from source.
   * OS-specific dependencies are prefixed with `os:` (e.g., `linux:gnu.org/gcc`).
   */
  buildDependencies: [
    'cmake.org@^3',
    'gnu.org/bison@>=3.0.4',
    'linux:gnu.org/gcc',
  ] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '9.6.0',
    '9.5.0',
    '9.4.0',
    '9.3.0',
    '9.2.0',
    '9.1.0',
    '9.0.1',
    '9.0.0',
    '8.4.7',
    '8.4.6',
    '8.4.5',
    '8.4.4',
    '8.4.3',
    '8.4.2',
    '8.4.1',
    '8.4.0',
    '8.3.0',
    '8.2.0',
    '8.1.0',
    '8.0.45',
    '8.0.44',
    '8.0.43',
    '8.0.42',
    '8.0.41',
    '8.0.40',
    '8.0.39',
    '8.0.38',
    '8.0.36',
    '8.0.35',
    '8.0.34',
    '8.0.33',
    '8.0.32',
  ] as const,
  aliases: [] as const,
}

export type MysqlcomPackage = typeof mysqlcomPackage
