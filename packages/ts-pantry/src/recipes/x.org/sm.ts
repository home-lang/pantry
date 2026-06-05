import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/sm',
  name: 'sm',
  programs: [],
  dependencies: {
    'x.org/ice': '*',
  },
  buildDependencies: {
    'x.org/util-macros': '*',
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
    'freedesktop.org/pkg-config': '~0.29',
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
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      SHELF: '${{pkgx.prefix}}/x.org',
      ARGS: [
        '--prefix={{prefix}}',
        '--sysconfdir=$SHELF/etc',
        '--localstatedir=$SHELF/var',
        '--disable-dependency-tracking',
        '--disable-silent-rules',
        '--enable-docs=no',
        '--enable-specs=no',
      ],
    },
  },
  test: {
    script: [
      'mv $FIXTURE test.c',
      'cc test.c',
      './a.out',
    ],
  },
}
