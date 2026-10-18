/**
 * **mysql** - MySQL Server, the world's most popular open source database, and MySQL Cluster, a real-time, open source transactional database.
 *
 * @domain `mysql.com`
 * @programs `my_print_defaults`, `myisam_ftdump`, `myisamchk`, `myisamlog`, `myisampack`, ... (+17 more)
 * @version `26.7.0` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install mysql.com`
 * @homepage http://www.mysql.com/
 * @dependencies `openssl.org^3`, `perl.org^5`, `invisible-island.net/ncurses^6`, ... (+8 more) (includes platform-specific dependencies)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.mysqlcom
 * console.log(pkg.name)        // "mysql"
 * console.log(pkg.description) // "MySQL Server, the world's most popular open sou..."
 * console.log(pkg.programs)    // ["my_print_defaults", "myisam_ftdump", ...]
 * console.log(pkg.versions[0]) // "26.7.0" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/mysql-com.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const mysqlPackage = {
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install mysql.com' as const,
  pantryInstallCommand: 'pantry install mysql.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'my_print_defaults',
    'myisam_ftdump',
    'myisamchk',
    'myisamlog',
    'myisampack',
    'mysql',
    'mysql_config',
    'mysql_config_editor',
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
    'mysqlshow',
    'mysqlslap',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * Platform-specific dependencies use `os:` or `os/arch:` prefixes (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'openssl.org^3',
    'perl.org^5',
    'invisible-island.net/ncurses^6',
    'curl.se^8',
    'linux:sourceforge.net/libtirpc',
    'linux:pagure.io/libaio^0.3.113',
    'linux:github.com/numactl/numactl^2',
    'linux:gnu.org/gcc/libstdcxx@14',
    'linux:systemd.io/libudev',
    'linux:github.com/besser82/libxcrypt^4',
    'linux:kernel.org/keyutils^1',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '26.7.0',
    '8.4.11',
    '8.0.45',
    '8.0.44',
    '8.0.43',
  ] as const,
  aliases: [] as const,
}

export type MysqlPackage = typeof mysqlPackage
