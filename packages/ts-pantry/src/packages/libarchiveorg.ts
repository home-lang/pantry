/**
 * **libarchive** - Multi-format archive and compression library
 *
 * @domain `libarchive.org`
 * @programs `bsdcat`, `bsdcpio`, `bsdtar`
 * @version `3.8.10` (35 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install libarchive.org`
 * @homepage https://www.libarchive.org
 * @dependencies `gnu.org/coreutils`, `lz4.org@1`, `tukaani.org/xz@5`, ... (+4 more)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.libarchiveorg
 * console.log(pkg.name)        // "libarchive"
 * console.log(pkg.description) // "Multi-format archive and compression library"
 * console.log(pkg.programs)    // ["bsdcat", "bsdcpio", ...]
 * console.log(pkg.versions[0]) // "3.8.10" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/libarchive-org.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install libarchive.org' as const,
  pantryInstallCommand: 'pantry install libarchive.org' as const,
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
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '3.8.10',
    '3.8.9',
    '3.8.8',
    '3.8.7',
    '3.8.6',
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
    '3.6.1',
    '3.6.0',
    '3.5.3',
    '3.5.2',
    '3.5.1',
    '3.5.0',
    '3.4.3',
    '3.4.2',
    '3.4.1',
    '3.4.0',
    '3.3.3',
    '3.3.2',
    '3.3.1',
  ] as const,
  aliases: [] as const,
}

export type LibarchiveorgPackage = typeof libarchiveorgPackage
