/**
 * **gm** - Image processing tools collection
 *
 * @domain `graphicsmagick.org`
 * @programs `gm`
 * @version `1.3.46` (6 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install graphicsmagick.org`
 * @homepage http://www.graphicsmagick.org/
 * @dependencies `freetype.org`, `github.com/jasper-software/jasper`, `libjpeg-turbo.org`, ... (+9 more)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.graphicsmagickorg
 * console.log(pkg.name)        // "gm"
 * console.log(pkg.description) // "Image processing tools collection"
 * console.log(pkg.programs)    // ["gm"]
 * console.log(pkg.versions[0]) // "1.3.46" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/graphicsmagick-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const graphicsmagickorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'gm' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'graphicsmagick.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'Image processing tools collection' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/graphicsmagick.org/package.yml' as const,
  homepageUrl: 'http://www.graphicsmagick.org/' as const,
  githubUrl: '' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install graphicsmagick.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +graphicsmagick.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install graphicsmagick.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'gm',
  ] as const,
  companions: [] as const,
  /**
   * Runtime dependencies for this package.
   * These are required when running the package.
   */
  dependencies: [
    'freetype.org',
    'github.com/jasper-software/jasper',
    'libjpeg-turbo.org',
    'jpeg.org/jpegxl',
    'libpng.org',
    'simplesystems.org/libtiff',
    'gnu.org/libtool',
    'littlecms.com>=2.0',
    'google.com/webp',
    'sourceware.org/bzip2',
    'gnome.org/libxml2',
    'zlib.net',
  ] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '1.3.46',
    '1.3.45',
    '1.3.44',
    '1.3.43',
    '1.3.42',
    '1.3.40',
  ] as const,
  aliases: [] as const,
}

export type GraphicsmagickorgPackage = typeof graphicsmagickorgPackage
