import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/libxfont2',
  name: 'libxfont2',
  programs: [],
  dependencies: {
    'x.org/x11': '^1',
    'x.org/exts': '*',
    'x.org/protocol': '*',
    'freetype.org': '*',
    'x.org/xtrans': '*',
    'zlib.net': '*',
    'x.org/libfontenc': '*',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
    'x.org/util-macros': '*',
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
  },
  distributable: {
    url: 'https://gitlab.freedesktop.org/xorg/lib/libxfont/-/archive/libXfont2-{{version}}/libxfont-libXfont2-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'NOCONFIGURE=1 ./autogen.sh',
      './configure --prefix={{prefix}}',
      'make',
      'make install',
    ],
  },
  test: {
    script: [
      'pkg-config --modversion xfont2 | grep {{version}}',
    ],
  },
}
