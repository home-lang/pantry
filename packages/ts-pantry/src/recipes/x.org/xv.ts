import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/xv',
  name: 'xv',
  programs: [],
  dependencies: {
    'x.org/x11': '*',
    'x.org/protocol': '*',
    'x.org/exts': '*',
  },
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
    'freedesktop.org/pkg-config': '*',
    'x.org/util-macros': '*',
  },
  distributable: {
    url: 'https://gitlab.freedesktop.org/xorg/lib/libxv/-/archive/libXv-{{version}}/libxv-libXv-{{version}}.tar.gz',
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
        '--disable-dependency-tracking',
        '--disable-silent-rules',
        '--sysconfdir={{pkgx.prefix}}/x.org/etc',
        '--localstatedir={{pkgx.prefix}}/x.org/var',
      ],
    },
  },
  test: {
    script: [
      'pkg-config --modversion xv | grep {{version}}',
    ],
  },
}
