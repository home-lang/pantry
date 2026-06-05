import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'x.org/util-macros',
  name: 'util-macros',
  programs: [],
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
  },
  distributable: {
    url: 'https://gitlab.freedesktop.org/xorg/util/macros/-/archive/util-macros-{{version.raw}}/macros-util-macros-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'NOCONFIGURE=1 ./autogen.sh',
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
      ],
    },
  },
  test: {
    script: [
      'pkg-config --exists xorg-macros',
    ],
  },
}
