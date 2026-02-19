/**
 * **freetds** - Libraries to talk to Microsoft SQL Server and Sybase databases
 *
 * @domain `freetds.org`
 * @programs `bsqldb`, `bsqlodbc`, `datacopy`, `defncopy`, `fisql`, ... (+4 more)
 * @version `1.5.13` (41 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install freetds.org`
 * @homepage https://www.freetds.org/
 * @dependencies `openssl.org^1.1`, `unixodbc.org`, `kerberos.org`, ... (+1 more)
 * @buildDependencies `gnu.org/autoconf`, `gnu.org/gettext`, `gnu.org/libtool`, ... (+2 more) - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.freetdsorg
 * console.log(pkg.name)        // "freetds"
 * console.log(pkg.description) // "Libraries to talk to Microsoft SQL Server and S..."
 * console.log(pkg.programs)    // ["bsqldb", "bsqlodbc", ...]
 * console.log(pkg.versions[0]) // "1.5.13" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/freetds-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const freetdsorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'freetds' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'freetds.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'Libraries to talk to Microsoft SQL Server and Sybase databases' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/freetds.org/package.yml' as const,
  homepageUrl: 'https://www.freetds.org/' as const,
  githubUrl: 'https://github.com/FreeTDS/freetds' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install freetds.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +freetds.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install freetds.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'bsqldb',
    'bsqlodbc',
    'datacopy',
    'defncopy',
    'fisql',
    'freebcp',
    'osql',
    'tdspool',
    'tsql',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'openssl.org^1.1',
    'unixodbc.org',
    'kerberos.org',
    'gnu.org/readline',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/autoconf',
    'gnu.org/gettext',
    'gnu.org/libtool',
    'gnu.org/automake',
    'cmake.org',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '1.5.13',
    '1.5.12',
    '1.5.11',
    '1.5.10',
    '1.5.9',
    '1.5.8',
    '1.5.6',
    '1.5.5',
    '1.5.4',
    '1.5.3',
    '1.5.2',
    '1.5.1',
    '1.4.27',
    '1.4.26',
    '1.4.24',
    '1.4.23',
    '1.4.22',
    '1.4.21',
    '1.4.20',
    '1.4.19',
    '1.4.17',
    '1.4.16',
    '1.4.15',
    '1.4.14',
    '1.4.13',
    '1.4.12',
    '1.4.11',
    '1.4.10',
    '1.4.9',
    '1.4.8',
    '1.4.7',
    '1.4.6',
    '1.4.5',
    '1.4.4',
    '1.4.3',
    '1.4.2',
    '1.4.1',
    '1.3.21',
    '1.3.20',
    '1.3.19',
    '1.3.18',
  ] as const,
  aliases: [] as const,
}

export type FreetdsorgPackage = typeof freetdsorgPackage
