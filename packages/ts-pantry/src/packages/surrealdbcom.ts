/**
 * **surreal** - A scalable, distributed, collaborative, document-graph database, for the realtime web
 *
 * @domain `surrealdb.com`
 * @programs `surreal`
 * @version `2023.9.1` (70 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install surrealdb.com`
 * @homepage https://surrealdb.com
 * @dependencies `openssl.org^1`
 * @buildDependencies `gnu.org/patch` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.surrealdbcom
 * console.log(pkg.name)        // "surreal"
 * console.log(pkg.description) // "A scalable, distributed, collaborative, documen..."
 * console.log(pkg.programs)    // ["surreal"]
 * console.log(pkg.versions[0]) // "2023.9.1" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/surrealdb-com.md
 * @see https://ts-pantry.netlify.app/usage
 */
export const surrealdbcomPackage = {
  /**
  * The display name of this package.
  */
  name: 'surreal' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'surrealdb.com' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A scalable, distributed, collaborative, document-graph database, for the realtime web' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/surrealdb.com/package.yml' as const,
  homepageUrl: 'https://surrealdb.com' as const,
  githubUrl: 'https://github.com/surrealdb/surrealdb' as const,
  /**
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install surrealdb.com' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +surrealdb.com -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install surrealdb.com' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'surreal',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'openssl.org^1',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'gnu.org/patch',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '2023.9.1',
    '3.0.4',
    '3.0.3',
    '3.0.2',
    '3.0.1',
    '3.0.0',
    '2.6.5',
    '2.6.4',
    '2.6.3',
    '2.6.2',
    '2.6.1',
    '2.6.0',
    '2.5.0',
    '2.4.1',
    '2.4.0',
    '2.3.10',
    '2.3.9',
    '2.3.8',
    '2.3.7',
    '2.3.6',
    '2.3.5',
    '2.3.4',
    '2.3.3',
    '2.3.2',
    '2.2.8',
    '2.2.7',
    '2.2.6',
    '2.2.5',
    '2.2.4',
    '2.2.3',
    '2.1.9',
    '2.1.8',
    '2.1.7',
    '2.1.6',
  ] as const,
  aliases: [] as const,
}

export type SurrealdbcomPackage = typeof surrealdbcomPackage
