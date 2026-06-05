import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'ferzkopp.net/SDL2_gfx',
  name: 'SDL2_gfx',
  programs: [],
  dependencies: {
    'libsdl.org': '2',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
  },
  distributable: {
    url: 'http://www.ferzkopp.net/Software/SDL2_gfx/SDL2_gfx-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      '# config.guess is outdated and can\'t detect aarch64',
      'autoreconf -fi',
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
      ],
      ACLOCAL_PATH: '${{deps.freedesktop.org/pkg-config.prefix}}/share/aclocal:{{deps.gnu.org/libtool.prefix}}/share/aclocal:{{deps.libsdl.org.prefix}}/share/aclocal',
      aarch64: {
        ARGS: [
          '--disable-mmx',
        ],
      },
    },
  },
  test: {
    script: [
      'cc $FIXTURE -lSDL2_gfx',
      './a.out',
    ],
  },
}
