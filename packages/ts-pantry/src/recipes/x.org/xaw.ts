import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/xaw',
  name: 'xaw',
  programs: [],
  dependencies: {
    'x.org/x11': '*',
    'x.org/exts': '*',
    'x.org/xmu': '*',
    'x.org/xt': '*',
    'x.org/xpm': '*',
  },
  buildDependencies: {
    'x.org/util-macros': '*',
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
    'freedesktop.org/pkg-config': '~0.29',
  },
  distributable: {
    url: 'https://gitlab.freedesktop.org/xorg/lib/libxaw/-/archive/libXaw-{{version}}/libxaw-libXaw-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'NOCONFIGURE=1 ./autogen.sh',
      './configure \\',
      '  --prefix="{{prefix}}" \\',
      '  --sysconfdir="$SHELF"/etc \\',
      '  --localstatedir="$SHELF"/var',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      SHELF: '${{pkgx.prefix}}/x.org',
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
