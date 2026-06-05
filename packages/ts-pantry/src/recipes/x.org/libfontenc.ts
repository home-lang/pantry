import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/libfontenc',
  name: 'libfontenc',
  programs: [],
  dependencies: {
    'x.org/x11': '^1',
    'x.org/exts': '*',
    'x.org/protocol': '*',
    'zlib.net': '*',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
    'x.org/util-macros': '*',
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
  },
  distributable: {
    url: 'https://gitlab.freedesktop.org/xorg/lib/libfontenc/-/archive/libfontenc-{{version}}/libfontenc-libfontenc-{{version}}.tar.gz',
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
      'pkg-config --modversion fontenc | grep {{version}}',
    ],
  },
}
