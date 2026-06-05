import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/xrender',
  name: 'xrender',
  programs: [],
  dependencies: {
    'x.org/x11': '^1',
    'x.org/protocol': '*',
  },
  buildDependencies: {
    'x.org/util-macros': '*',
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
    'freedesktop.org/pkg-config': '~0.29',
  },
  distributable: {
    url: 'https://gitlab.freedesktop.org/xorg/lib/libxrender/-/archive/libXrender-{{version}}/libxrender-libXrender-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'NOCONFIGURE=1 ./autogen.sh',
      './configure \\',
      '  --prefix={{prefix}} \\',
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
      'mv $FIXTURE x.c',
      'cc x.c',
      './a.out',
    ],
  },
}
