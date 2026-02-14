/**
 * **unixodbc** - The unixODBC Project goals are to develop and promote unixODBC to be the definitive standard for ODBC on non MS Windows platforms.
 *
 * @domain `unixodbc.org`
 * @programs `dltest`, `isql`, `iusql`, `odbc_config`, `odbcinst`, ... (+1 more)
 * @version `2.3.14` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install unixodbc.org`
 * @homepage https://www.unixodbc.org/
 * @dependencies `gnu.org/libtool`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.unixodbcorg
 * console.log(pkg.name)        // "unixodbc"
 * console.log(pkg.description) // "The unixODBC Project goals are to develop and p..."
 * console.log(pkg.programs)    // ["dltest", "isql", ...]
 * console.log(pkg.versions[0]) // "2.3.14" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/unixodbc-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const unixodbcorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'unixodbc' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'unixodbc.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'The unixODBC Project goals are to develop and promote unixODBC to be the definitive standard for ODBC on non MS Windows platforms.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/unixodbc.org/package.yml' as const,
  homepageUrl: 'https://www.unixodbc.org/' as const,
  githubUrl: 'https://github.com/lurcher/unixODBC' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install unixodbc.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +unixodbc.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install unixodbc.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'dltest',
    'isql',
    'iusql',
    'odbc_config',
    'odbcinst',
    'slencheck',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'gnu.org/libtool',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '2.3.14',
    '2.3.12',
    '2.3.11',
  ] as const,
  aliases: [] as const,
}

export type UnixodbcorgPackage = typeof unixodbcorgPackage
