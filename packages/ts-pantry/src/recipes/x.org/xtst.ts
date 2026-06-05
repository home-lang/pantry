import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/xtst',
  name: 'xtst',
  programs: [],
  dependencies: {
    'x.org/xi': '*',
    'x.org/protocol': '*',
  },
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
    'gnu.org/make': '*',
    'freedesktop.org/pkg-config': '*',
    'x.org/util-macros': '*',
  },
  distributable: {
    url: 'https://gitlab.freedesktop.org/xorg/lib/libxtst/-/archive/libXtst-{{version}}/libxtst-libXtst-{{version}}.tar.gz',
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
        '--enable-specs=no',
      ],
    },
  },
  test: {
    script: [
      'pkg-config --modversion xtst | grep {{version}}',
    ],
  },
}
