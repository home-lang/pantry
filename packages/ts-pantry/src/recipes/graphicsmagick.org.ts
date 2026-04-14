import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'graphicsmagick.org',
  name: 'gm',
  description: 'Image processing tools collection',
  homepage: 'https://www.graphicsmagick.org/',
  programs: ['gm'],
  distributable: {
    url: 'https://downloads.sourceforge.net/project/graphicsmagick/graphicsmagick/{{version}}/GraphicsMagick-{{version}}.tar.xz',
    stripComponents: 1,
  },
  dependencies: {
    'freetype.org': '*',
    'github.com/jasper-software/jasper': '*',
    'libjpeg-turbo.org': '*',
    'jpeg.org/jpegxl': '*',
    'libpng.org': '*',
    'simplesystems.org/libtiff': '*',
    'gnu.org/libtool': '*',
    'littlecms.com': '>=2.0',
    'google.com/webp': '*',
    'sourceware.org/bzip2': '*',
    'gnome.org/libxml2': '*',
    'zlib.net': '*',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
      '',
    ],
    env: {
      'ARGS': ['--prefix="{{prefix}}"', '--disable-dependency-tracking', '--disable-openmp', '--disable-static', '--enable-shared', '--with-modules', '--with-quantum-depth=16', '--without-lzma', '--without-x', '--without-gslib', '--with-gs-font-dir={{prefix}}/share/ghostscript/fonts', '--without-wmf', '--with-jxl'],
    },
  },
}
