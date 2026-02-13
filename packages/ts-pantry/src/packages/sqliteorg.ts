/**
 * **sqlite3** - Official Git mirror of the SQLite source tree
 *
 * @domain `sqlite.org`
 * @programs `sqlite3`
 * @version `3.51.2` (32 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install sqlite.org`
 * @homepage https://sqlite.org/index.html
 * @dependencies `zlib.net@1`, `gnu.org/readline@8`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.sqliteorg
 * console.log(pkg.name)        // "sqlite3"
 * console.log(pkg.description) // "Official Git mirror of the SQLite source tree"
 * console.log(pkg.programs)    // ["sqlite3"]
 * console.log(pkg.versions[0]) // "3.51.2" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/sqlite-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const sqliteorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'sqlite3' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'sqlite.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Official Git mirror of the SQLite source tree' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/sqlite.org/package.yml' as const,
  homepageUrl: 'https://sqlite.org/index.html' as const,
  githubUrl: 'https://github.com/sqlite/sqlite' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install sqlite.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +sqlite.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install sqlite.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'sqlite3',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'zlib.net@1',
    'gnu.org/readline@8',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.51.2',
    '3.51.1',
    '3.51.0',
    '3.50.4',
    '3.50.3',
    '3.50.2',
    '3.50.1',
    '3.50.0',
    '3.49.2',
    '3.49.1',
    '3.49.0',
    '3.48.0',
    '3.47.2',
    '3.47.1',
    '3.47.0',
    '3.46.1',
    '3.46.0',
    '3.45.3',
    '3.45.2',
    '3.45.1',
    '3.45.0',
    '3.44.4',
    '3.44.3',
    '3.44.2',
    '3.44.1',
    '3.44.0',
    '3.43.2',
    '3.43.1',
    '3.43.0',
    '3.42.0',
    '3.40.0',
    '3.39.4',
  ] as const,
  aliases: [] as const,
}

export type SqliteorgPackage = typeof sqliteorgPackage
