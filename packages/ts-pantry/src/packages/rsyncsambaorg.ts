/**
 * **rsync** - An open source utility that provides fast incremental file transfer. It also has useful features for backup and restore operations among many other use cases.
 *
 * @domain `rsync.samba.org`
 * @programs `rsync`, `rsync-ssl`
 * @version `3.4.1` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install rsync.samba.org`
 * @homepage https://rsync.samba.org/
 * @dependencies `zlib.net^1`, `facebook.com/zstd^1`, `lz4.org^1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.rsyncsambaorg
 * console.log(pkg.name)        // "rsync"
 * console.log(pkg.description) // "An open source utility that provides fast incre..."
 * console.log(pkg.programs)    // ["rsync", "rsync-ssl"]
 * console.log(pkg.versions[0]) // "3.4.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/rsync-samba-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const rsyncsambaorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'rsync' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'rsync.samba.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'An open source utility that provides fast incremental file transfer. It also has useful features for backup and restore operations among many other use cases.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/rsync.samba.org/package.yml' as const,
  homepageUrl: 'https://rsync.samba.org/' as const,
  githubUrl: 'https://github.com/WayneD/rsync' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install rsync.samba.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +rsync.samba.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install rsync.samba.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'rsync',
    'rsync-ssl',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'zlib.net^1',
    'facebook.com/zstd^1',
    'lz4.org^1',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.4.1',
    '3.4.0',
    '3.3.0',
    '3.2.7',
  ] as const,
  aliases: [] as const,
}

export type RsyncsambaorgPackage = typeof rsyncsambaorgPackage
