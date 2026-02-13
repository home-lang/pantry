/**
 * **tiff** - TIFF library and utilities
 *
 * @domain `simplesystems.org/libtiff`
 * @programs `tiffcp`, `tiffdump`, `tiffinfo`, `tiffset`, `tiffsplit`
 * @version `4.7.1` (5 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install simplesystems.org/libtiff`
 * @homepage https://libtiff.gitlab.io/libtiff/
 * @dependencies `facebook.com/zstd^1`, `libjpeg-turbo.org^2`, `zlib.net^1`
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.simplesystemsorglibtiff
 * console.log(pkg.name)        // "tiff"
 * console.log(pkg.description) // "TIFF library and utilities"
 * console.log(pkg.programs)    // ["tiffcp", "tiffdump", ...]
 * console.log(pkg.versions[0]) // "4.7.1" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/simplesystems-org/libtiff.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const simplesystemsorglibtiffPackage = {
  /**
   * The display name of this package.
   */
  name: 'tiff' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'simplesystems.org/libtiff' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'TIFF library and utilities' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/simplesystems.org/libtiff/package.yml' as const,
  homepageUrl: 'https://libtiff.gitlab.io/libtiff/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install simplesystems.org/libtiff' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +simplesystems.org/libtiff -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install simplesystems.org/libtiff' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'tiffcp',
    'tiffdump',
    'tiffinfo',
    'tiffset',
    'tiffsplit',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'facebook.com/zstd^1',
    'libjpeg-turbo.org^2',
    'zlib.net^1',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '4.7.1',
    '4.7.0',
    '4.6.0',
    '4.5.1',
    '4.5.0',
  ] as const,
  aliases: [] as const,
}

export type SimplesystemsorglibtiffPackage = typeof simplesystemsorglibtiffPackage
