import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/xcursor',
  name: 'xcursor',
  programs: [],
  dependencies: {
    'x.org/x11': '*',
    'x.org/xfixes': '*',
    'x.org/xrender': '*',
  },
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
    'freedesktop.org/pkg-config': '*',
    'x.org/util-macros': '*',
  },
  distributable: {
    url: 'https://gitlab.freedesktop.org/xorg/lib/libxcursor/-/archive/libXcursor-{{version}}/libxcursor-libXcursor-{{version}}.tar.gz',
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
        '--sysconfdir={{pkgx.prefix}}/x.org/etc',
        '--localstatedir={{pkgx.prefix}}/x.org/var',
        '--disable-dependency-tracking',
        '--disable-silent-rules',
      ],
    },
  },
  test: {
    script: [
      'pkg-config --modversion xcursor | grep {{version}}',
      'cc test.c -o test',
      './test',
    ],
  },
}
