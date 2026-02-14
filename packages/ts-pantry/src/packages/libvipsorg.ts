/**
 * **vips** - A fast image processing library with low memory needs.
 *
 * @domain `libvips.org`
 * @programs `vips`, `vipsedit`, `vipsheader`, `vipsprofile`, `vipsthumbnail`
 * @version `8.18.0` (13 versions available)
 * @versions From newest version to oldest.
 *
 * @install `launchpad install libvips.org`
 * @homepage https://libvips.github.io/libvips/
 * @dependencies `mozilla.org/mozjpeg`, `cairographics.org`, `heasarc.gsfc.nasa.gov/cfitsio`, ... (+24 more)
 * @buildDependencies `mesonbuild.com` - required only when building from source
 *
 * @example
 * ```typescript
 * import { pantry } from 'ts-pkgx'
 *
 * const pkg = pantry.libvipsorg
 * console.log(pkg.name)        // "vips"
 * console.log(pkg.description) // "A fast image processing library with low memory..."
 * console.log(pkg.programs)    // ["vips", "vipsedit", ...]
 * console.log(pkg.versions[0]) // "8.18.0" (latest)
 * ```
 *
 * @see https://ts-pkgx.netlify.app/packages/libvips-org.md
 * @see https://ts-pkgx.netlify.app/usage
 */
export const libvipsorgPackage = {
  /**
  * The display name of this package.
  */
  name: 'vips' as const,
  /**
  * The canonical domain name for this package.
  */
  domain: 'libvips.org' as const,
  /**
  * Brief description of what this package does.
  */
  description: 'A fast image processing library with low memory needs.' as const,
  packageYmlUrl: 'https://github.com/pkgxdev/pantry/tree/main/projects/libvips.org/package.yml' as const,
  homepageUrl: 'https://libvips.github.io/libvips/' as const,
  githubUrl: 'https://github.com/libvips/libvips' as const,
  /**
  * Command to install this package using launchpad.
  * @example launchpad install package-name
  */
  installCommand: 'launchpad install libvips.org' as const,
  pkgxInstallCommand: 'sh <(curl https://pkgx.sh) +libvips.org -- $SHELL -i' as const,
  launchpadInstallCommand: 'launchpad install libvips.org' as const,
  /**
  * Executable programs provided by this package.
  * These can be run after installation.
  */
  programs: [
    'vips',
    'vipsedit',
    'vipsheader',
    'vipsprofile',
    'vipsthumbnail',
  ] as const,
  companions: [] as const,
  /**
  * Runtime dependencies for this package.
  * These are required when running the package.
  */
  dependencies: [
    'mozilla.org/mozjpeg',
    'cairographics.org',
    'heasarc.gsfc.nasa.gov/cfitsio',
    'github.com/dloebl/cgif',
    'fftw.org',
    'freedesktop.org/fontconfig',
    'gnu.org/gettext',
    'gnome.org/glib',
    'graphicsmagick.org',
    'jpeg.org/jpegxl',
    'libexif.github.io',
    'gnome.org/libgsf',
    'github.com/strukturag/libheif',
    'pngquant.org/lib',
    'matio.sourceforge.io',
    'gnome.org/librsvg',
    'libspng.org',
    'simplesystems.org/libtiff',
    'littlecms.com',
    'openexr.com',
    'openjpeg.org',
    'gstreamer.freedesktop.org/orc',
    'gnome.org/pango',
    'poppler.freedesktop.org',
    'google.com/webp',
    'libexpat.github.io',
    'zlib.net',
  ] as const,
  /**
  * Build dependencies for this package.
  * These are only required when building the package from source.
  */
  buildDependencies: [
    'mesonbuild.com',
  ] as const,
  /**
  * Available versions from newest to oldest.
  * @see https://ts-pkgx.netlify.app/usage for installation instructions
  */
  versions: [
    '8.18.0',
    '8.17.3',
    '8.17.2',
    '8.17.1',
    '8.17.0',
    '8.16.1',
    '8.16.0',
    '8.15.5',
    '8.15.3',
    '8.15.2',
    '8.15.1',
    '8.15.0',
    '8.14.5',
  ] as const,
  aliases: [] as const,
}

export type LibvipsorgPackage = typeof libvipsorgPackage
