/**
 * **libarchive** - Multi-format archive and compression library
 *
 * @domain `libarchive.org`
 * @programs `bsdcat`, `bsdcpio`, `bsdtar`
 * @version `3.8.5` (17 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install libarchive.org`
 * @homepage https://www.libarchive.org
 * @dependencies `gnu.org/coreutils`, `lz4.org@1`, `tukaani.org/xz@5`, ... (+4 more)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.libarchiveorg
 * console.log(pkg.name)        // "libarchive"
 * console.log(pkg.description) // "Multi-format archive and compression library"
 * console.log(pkg.programs)    // ["bsdcat", "bsdcpio", ...]
 * console.log(pkg.versions[0]) // "3.8.5" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/libarchive-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libarchiveorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'libarchive' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'libarchive.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Multi-format archive and compression library' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/libarchive.org/package.yml' as const,
  homepageUrl: 'https://www.libarchive.org' as const,
  githubUrl: 'https://github.com/libarchive/libarchive' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install libarchive.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +libarchive.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install libarchive.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'bsdcat',
    'bsdcpio',
    'bsdtar',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'gnu.org/coreutils',
    'lz4.org@1',
    'tukaani.org/xz@5',
    'facebook.com/zstd@1',
    'sourceware.org/bzip2@1',
    'libexpat.github.io@2',
    'zlib.net@1',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '3.8.5',
    '3.8.4',
    '3.8.3',
    '3.8.2',
    '3.8.1',
    '3.8.0',
    '3.7.9',
    '3.7.8',
    '3.7.7',
    '3.7.6',
    '3.7.5',
    '3.7.4',
    '3.7.3',
    '3.7.2',
    '3.7.1',
    '3.7.0',
    '3.6.2',
  ] as const,
  aliases: [] as const,
}

export type LibarchiveorgPackage = typeof libarchiveorgPackage
