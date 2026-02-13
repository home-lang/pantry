/**
 * **imagemagick** - ImageMagick is a powerful, open-source software suite for creating, editing, converting, and manipulating images in over 200 formats. Ideal for web developers, graphic designers, and researchers, it offers versatile tools for image processing, including batch processing, format conversion, and complex image transformations.
 *
 * @domain `imagemagick.org`
 * @programs `animate`, `compare`, `composite`, `conjure`, `convert`, ... (+11 more)
 * @version `7.1.1.27` (3 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install imagemagick.org`
 * @homepage https://imagemagick.org/index.php
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.imagemagickorg
 * console.log(pkg.name)        // "imagemagick"
 * console.log(pkg.description) // "ImageMagick is a powerful, open-source software..."
 * console.log(pkg.programs)    // ["animate", "compare", ...]
 * console.log(pkg.versions[0]) // "7.1.1.27" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/imagemagick-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const imagemagickorgPackage = {
  /**
   * The display name of this package.
   */
  name: 'imagemagick' as const,
  /**
   * The canonical domain name for this package.
   */
  domain: 'imagemagick.org' as const,
  /**
   * Brief description of what this package does.
   */
  description: 'ImageMagick is a powerful, open-source software suite for creating, editing, converting, and manipulating images in over 200 formats. Ideal for web developers, graphic designers, and researchers, it offers versatile tools for image processing, including batch processing, format conversion, and complex image transformations.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/imagemagick.org/package.yml' as const,
  homepageUrl: 'https://imagemagick.org/index.php' as const,
  githubUrl: 'https://github.com/ImageMagick/ImageMagick' as const,
  /**
   * Command to install this package using launchpad.
   * @example launchpad install package-name
   */
  installCommand: 'launchpad install imagemagick.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +imagemagick.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install imagemagick.org' as const,
  /**
   * Executable programs provided by this package.
   * These can be run after installation.
   */
  programs: [
    'animate',
    'compare',
    'composite',
    'conjure',
    'convert',
    'display',
    'identify',
    'import',
    'magick',
    'magick-script',
    'Magick++-config',
    'MagickCore-config',
    'MagickWand-config',
    'mogrify',
    'montage',
    'stream',
  ] as const,
  companions: [] as const,
  dependencies: [] as const,
  buildDependencies: [] as const,
  /**
   * Available versions from newest to oldest.
   * @see https://ts-pkgx.netlify.app/usage for installation instructions
   */
  versions: [
    '7.1.1.27',
    '7.1.1.12',
    '7.1.0.61',
  ] as const,
  aliases: [] as const,
}

export type ImagemagickorgPackage = typeof imagemagickorgPackage
