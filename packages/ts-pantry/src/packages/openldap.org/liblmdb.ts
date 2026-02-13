/**
 * **liblmdb** - Lightning memory-mapped database: key-value data store
 *
 * @domain `openldap.org/liblmdb`
 * @programs `mdb_copy`, `mdb_dump`, `mdb_load`, `mdb_stat`
 * @version `0.9.33` (1 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install openldap.org/liblmdb`
 * @homepage https://www.symas.com/symas-embedded-database-lmdb
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.openldaporgliblmdb
 * console.log(pkg.name)        // "liblmdb"
 * console.log(pkg.description) // "Lightning memory-mapped database: key-value dat..."
 * console.log(pkg.programs)    // ["mdb_copy", "mdb_dump", ...]
 * console.log(pkg.versions[0]) // "0.9.33" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/openldap-org/liblmdb.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const openldaporgliblmdbPackage = {
  /**
   * The display name of this package.
   */
  name: 'liblmdb' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'openldap.org/liblmdb' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Lightning memory-mapped database: key-value data store' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/openldap.org/liblmdb/package.yml' as const,
  homepageUrl: 'https://www.symas.com/symas-embedded-database-lmdb' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install openldap.org/liblmdb' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +openldap.org/liblmdb -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install openldap.org/liblmdb' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'mdb_copy',
    'mdb_dump',
    'mdb_load',
    'mdb_stat',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '0.9.33',
  ] as const,
  aliases: [] as const,
}

export type OpenldaporgliblmdbPackage = typeof openldaporgliblmdbPackage
