/**
 * **sqlite** - Official Git mirror of the SQLite source tree
 *
 * @domain `sqlite.org`
 * @programs `sqlite3`
 * @version `3.54.1` (101 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install sqlite.org`
 * @aliases `sqlite`
 * @homepage https://sqlite.org/index.html
 * @dependencies `zlib.net@1`, `gnu.org/readline@8`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * // Access via alias (recommended)
 * const pkg = pantry.sqlite
 * // Or access via domain
 * const samePkg = pantry.sqliteorg
 * console.log(pkg === samePkg) // true
 * console.log(pkg.name)        // "sqlite3"
 * console.log(pkg.description) // "Official Git mirror of the SQLite source tree"
 * console.log(pkg.programs)    // ["sqlite3"]
 * console.log(pkg.versions[0]) // "3.54.1" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/sqlite-org.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const sqlitePackage = {
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install sqlite.org' as const,
  pantryInstallCommand: 'pantry install sqlite.org' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '3.54.1',
    '3.54.0',
    '3.53.4',
    '3.53.3',
    '3.53.2',
    '3.53.1',
    '3.53.0',
    '3.52.0',
    '3.51.3',
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
    '3.44.5',
    '3.44.4',
    '3.44.3',
    '3.44.2',
    '3.44.1',
    '3.44.0',
    '3.43.2',
    '3.43.1',
    '3.43.0',
    '3.42.1',
    '3.42.0',
    '3.41.2',
    '3.41.1',
    '3.41.0',
    '3.40.1',
    '3.40.0',
    '3.39.4',
    '3.39.3',
    '3.39.2',
    '3.39.1',
    '3.39.0',
    '3.38.5',
    '3.38.4',
    '3.38.3',
    '3.38.2',
    '3.38.1',
    '3.38.0',
    '3.37.2',
    '3.37.1',
    '3.37.0',
    '3.36.0',
    '3.35.5',
    '3.35.4',
    '3.35.3',
    '3.35.2',
    '3.35.1',
    '3.35.0',
    '3.34.1',
    '3.34.0',
    '3.33.0',
    '3.32.3',
    '3.32.2',
    '3.32.1',
    '3.32.0',
    '3.31.1',
    '3.31.0',
    '3.30.1',
    '3.30.0',
    '3.29.0',
    '3.28.0',
    '3.27.2',
    '3.27.1',
    '3.27.0',
    '3.26.0',
    '3.25.3',
    '3.25.2',
    '3.25.1',
    '3.25.0',
    '3.24.0',
    '3.23.2',
    '3.23.1',
    '3.23.0',
    '3.22.0',
    '3.21.0',
    '3.20.1',
    '3.20.0',
    '3.19.4',
    '3.19.3',
    '3.19.2',
    '3.19.1',
    '3.19.0',
  ] as const,
  /**
  * Alternative names for this package.
  * You can use any of these names to access the package.
  */
  aliases: [
    'sqlite',
  ] as const,
}

export type SqlitePackage = typeof sqlitePackage
