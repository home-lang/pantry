import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/libSM',
  name: 'libSM',
  programs: [],
  dependencies: {
    'x.org/ice': '*',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
    'x.org/util-macros': '*',
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
    'x.org/xtrans': '*',
  },
  distributable: {
    url: 'https://gitlab.freedesktop.org/xorg/lib/libsm/-/archive/libSM-{{version}}/libsm-libSM-{{version}}.tar.gz',
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
        '--enable-docs=no',
      ],
    },
  },
  test: {
    script: [
      'cc test.c -o test',
      './test',
      'pkg-config --modversion sm | grep {{version}}',
    ],
  },
}
