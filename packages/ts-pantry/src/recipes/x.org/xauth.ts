import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/xauth',
  name: 'xauth',
  programs: [
    'xauth',
  ],
  dependencies: {
    'x.org/x11': '*',
    'x.org/exts': '*',
    'x.org/xau': '*',
    'x.org/xmu': '*',
    linux: {
      'x.org/xcb': '*',
      'x.org/xdmcp': '*',
    },
  },
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
    'freedesktop.org/pkg-config': '*',
    'x.org/util-macros': '*',
    linux: {
      'gnu.org/gcc': '*',
      'gnu.org/make': '*',
    },
  },
  distributable: {
    url: 'https://gitlab.freedesktop.org/xorg/app/xauth/-/archive/xauth-{{version}}/xauth-xauth-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'NOCONFIGURE=1 ./autogen.sh',
      './configure $CONFIGURE_ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      CONFIGURE_ARGS: [
        '--disable-debug',
        '--disable-dependency-tracking',
        '--prefix={{prefix}}',
        '--libdir={{prefix}}/lib',
        '--sysconfdir={{prefix}}/etc',
        '--localstatedir={{prefix}}/var',
        '--enable-unix-transport',
        '--enable-tcp-transport',
        '--enable-ipv6',
        '--enable-local-transport',
      ],
    },
  },
  test: {
    script: [
      'xauth version | grep {{version}}',
    ],
  },
}
