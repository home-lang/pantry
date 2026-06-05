import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/xscrnsaver',
  name: 'xscrnsaver',
  programs: [],
  dependencies: {
    'x.org/x11': '^1',
    'x.org/protocol': '*',
    'x.org/exts': '*',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
    'x.org/util-macros': '*',
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
  },
  distributable: {
    url: 'https://gitlab.freedesktop.org/xorg/lib/libxscrnsaver/-/archive/libXScrnSaver-{{version}}/libxscrnsaver-libXScrnSaver-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'NOCONFIGURE=1 ./autogen.sh',
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      SHELF: '${{pkgx.prefix}}/x.org',
      ARGS: [
        '--prefix={{prefix}}',
        '--sysconfdir=$SHELF/etc',
        '--localstatedir=$SHELF/var',
        '--enable-spec=no',
      ],
    },
  },
  test: {
    script: [
      'cc $FIXTURE',
      './a.out',
    ],
  },
}
