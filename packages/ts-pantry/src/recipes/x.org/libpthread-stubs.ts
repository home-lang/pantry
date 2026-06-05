import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/libpthread-stubs',
  name: 'libpthread-stubs',
  programs: [],
  buildDependencies: {
    'x.org/util-macros': '*',
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
    'freedesktop.org/pkg-config': '*',
  },
  distributable: {
    url: 'https://gitlab.freedesktop.org/xorg/lib/libpthread-stubs/-/archive/libpthread-stubs-{{version.marketing}}/libpthread-stubs-libpthread-stubs-{{version.marketing}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'NOCONFIGURE=1 ./autogen.sh',
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
      ],
    },
  },
  test: {
    script: [
      'pkg-config --modversion pthread-stubs | grep {{version.marketing}}',
    ],
  },
}
