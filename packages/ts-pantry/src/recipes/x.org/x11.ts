import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/x11',
  name: 'x11',
  programs: [],
  dependencies: {
    'x.org/xcb': '^1',
    'x.org/protocol': '*',
  },
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
    'freedesktop.org/pkg-config': '~0.29',
    'x.org/util-macros': '*',
    'x.org/xtrans': '^1',
    'gnu.org/sed': '*',
  },
  distributable: {
    url: 'https://gitlab.freedesktop.org/xorg/lib/libx11/-/archive/libX11-{{version}}/libx11-libX11-{{version}}.tar.gz',
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
        '--disable-debug',
        '--enable-unix-transport',
        '--enable-tcp-transport',
        '--enable-ipv6',
        '--enable-local-transport',
        '--enable-loadable-i18n',
        '--enable-xthreads',
        '--enable-specs=no',
      ],
    },
  },
  test: {
    script: [
      'cc fixture.c -lX11',
      './a.out',
    ],
  },
}
