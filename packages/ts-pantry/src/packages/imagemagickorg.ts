/**
 * **imagemagick** - ImageMagick is a powerful, open-source software suite for creating, editing, converting, and manipulating images in over 200 formats. Ideal for web developers, graphic designers, and researchers, it offers versatile tools for image processing, including batch processing, format conversion, and complex image transformations.
 *
 * @domain `imagemagick.org`
 * @programs `animate`, `compare`, `composite`, `conjure`, `convert`, ... (+11 more)
 * @version `7.1.2.13` (4 versions available)
 * @versions From newest version to oldest.
 *
 * @install `pantry install imagemagick.org`
 * @homepage https://imagemagick.org/index.php
 * @dependencies `libpng.org`, `ijg.org=8.4`, `freetype.org`, ... (+18 more) (includes OS-specific dependencies with `os:package` format)
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pantry'
 *
 * const pkg = pantry.imagemagickorg
 * console.log(pkg.name)        // "imagemagick"
 * console.log(pkg.description) // "ImageMagick is a powerful, open-source software..."
 * console.log(pkg.programs)    // ["animate", "compare", ...]
 * console.log(pkg.versions[0]) // "7.1.2.13" (latest)
 * ```
 *
 * @see https://ts-pantry.netlify.app/packages/imagemagick-org.md
 * @see https://ts-pantry.netlify.app/usage
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
  * Command to install this package using pantry.
  * @example pantry install package-name
  */
  installCommand: 'pantry install imagemagick.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +imagemagick.org -- $SHELL -i' as const,
  pantryInstallCommand: 'pantry install imagemagick.org' as const,
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
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  * OS-specific dependencies are prefixed with `os:` (e.g., `linux:freetype.org`).
  */
  dependencies: [
    'libpng.org',
    'ijg.org=8.4',
    'freetype.org',
    'libjpeg-turbo.org',
    'liblqr.wikidot.com',
    'simplesystems.org/libtiff',
    'gnu.org/libtool',
    'littlecms.com',
    'openexr.com',
    'openjpeg.org',
    'google.com/webp',
    'tukaani.org/xz',
    'sourceware.org/bzip2',
    'gnome.org/libxml2',
    'zlib.net^1',
    'jpeg.org/jpegxl',
    'perl.org',
    'libzip.org',
    'darwin:openmp.llvm.org',
    'darwin:github.com/strukturag/libheif',
    'linux:x.org/x11',
  ] as const,
  buildDependencies: [] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pantry.netlify.app/usage for installation instructions
  */
  versions: [
    '7.1.2.13',
    '7.1.1.27',
    '7.1.1.12',
    '7.1.0.61',
    '7.1.2-18',
    '7.1.2-17',
    '7.1.2-16',
    '7.1.2-15',
    '7.1.2-13',
    '7.1.2-12',
    '7.1.2-11',
    '7.1.2-10',
    '7.1.2-9',
    '7.1.2-8',
    '7.1.2-7',
    '7.1.2-5',
    '7.1.2-3',
    '7.1.2-2',
    '7.1.2-1',
    '7.1.2-0',
    '7.1.1-47',
    '7.1.1-46',
    '7.1.1-45',
    '7.1.1-44',
    '7.1.1-43',
    '7.1.1-41',
    '7.1.1-40',
    '7.1.1-39',
    '7.1.1-38',
    '7.1.1-37',
    '7.1.1-36',
    '7.1.1-35',
    '7.1.1-34',
    '7.1.1-33',
    '7.1.1-32',
    '7.1.1-31',
    '7.1.1-30',
    '7.1.1-29',
    '7.1.1-28',
    '7.1.1-27',
    '7.1.1-26',
    '7.1.1-25',
    '7.1.1-24',
    '7.1.1-23',
    '7.1.1-22',
    '7.1.1-21',
    '7.1.1-20',
    '7.1.1-19',
    '7.1.1-18',
    '7.1.1-17',
    '7.1.1-16',
    '7.1.1-15',
    '7.1.1-14',
    '7.1.1-13',
  ] as const,
  aliases: [] as const,
}

export type ImagemagickorgPackage = typeof imagemagickorgPackage
