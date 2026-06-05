import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/xft',
  name: 'xft',
  programs: [],
  dependencies: {
    'freedesktop.org/fontconfig': '^2.14',
    'x.org/xrender': '^0.9',
    'sourceware.org/bzip2': '^1',
    'zlib.net': '^1',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
    'x.org/util-macros': '*',
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
  },
  distributable: {
    url: 'https://gitlab.freedesktop.org/xorg/lib/libxft/-/archive/libXft-{{version}}/libxft-libXft-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'NOCONFIGURE=1 ./autogen.sh',
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--sysconfdir={{prefix}}/etc',
        '--localstatedir={{prefix}}/var',
        '--disable-dependency-tracking',
        '--disable-silent-rules',
      ],
    },
  },
  test: {
    script: [
      'cc test.c $(pkg-config --cflags fontconfig) -o test',
      './test',
      'pkg-config --modversion xft | grep {{version}}',
    ],
  },
}
