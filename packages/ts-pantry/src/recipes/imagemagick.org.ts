import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'imagemagick.org',
  name: 'imagemagick',
  description: 'ImageMagick is a powerful, open-source software suite for creating, editing, converting, and manipulating images in over 200 formats. Ideal for web developers, graphic designers, and researchers, it offers versatile tools for image processing, including batch processing, format conversion, and complex image transformations.',
  homepage: 'https://imagemagick.org/index.php',
  github: 'https://github.com/ImageMagick/ImageMagick',
  programs: ['animate', 'compare', 'composite', 'conjure', 'convert', 'display', 'identify', 'import', 'magick', 'magick-script', 'Magick++-config', 'MagickCore-config', 'MagickWand-config', 'mogrify', 'montage', 'stream'],
  versionSource: {
    type: 'github-releases',
    repo: 'ImageMagick/ImageMagick',
  },
  distributable: {
    url: 'https://github.com/ImageMagick/ImageMagick/archive/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'libpng.org': '*',
    'freetype.org': '*',
    'libjpeg-turbo.org': '*',
    'simplesystems.org/libtiff': '*',
    'openjpeg.org': '*',
    'google.com/webp': '*',
    'tukaani.org/xz': '*',
    'sourceware.org/bzip2': '*',
    'gnome.org/libxml2': '*',
    'zlib.net': '^1',
    'linux/x86-64': '[object Object]',
  },

  build: {
    script: [
      'sed -i -e \'s|${PACKAGE_NAME}-${PACKAGE_BASE_VERSION}|${PACKAGE_NAME}|g\' configure',
      'find . -type f -name \'*-config.in\' -exec sed -i\'\' -e \'s|@PKG_CONFIG@|pkg-config|g\' {} +',
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
      'cd "${{prefix}}/bin"',
      'sed -i -e \'s|^prefix=.*|prefix=${MAGICK_HOME}|g\' Magick++-config MagickCore-config MagickWand-config',
    ],
    env: {
      'LDFLAGS': [],
      'ARGS': ['--prefix={{ prefix }}', '--libdir={{prefix}}/lib', '--enable-osx-universal-binary=no', '--disable-silent-rules', '--disable-opencl', '--enable-static', '--disable-installed', '--enable-shared', '--with-png=yes', '--with-tiff=yes', '--with-freetype=yes', '--with-gvc=no', '--with-modules', '--with-openjp2', '--with-webp=yes', '--without-lzma', '--without-djvu', '--without-fftw', '--without-pango', '--without-wmf', '--with-jxl=no', '--with-heic=no', '--with-lqr=no', '--without-openexr', '--with-zip=no', '--without-perl', '--disable-openmp', '--without-x'],
    },
  },
}
