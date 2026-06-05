import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/libass/libass',
  name: 'libass',
  programs: [],
  dependencies: {
    'freetype.org': '2',
    'gnu.org/fribidi': '1',
    'harfbuzz.org': '*',
    'github.com/adah1972/libunibreak': '*',
    linux: {
      'freedesktop.org/fontconfig': '2',
    },
    'x86-64': {
      'nasm.us': '2',
    },
  },
  buildDependencies: {
    'gnu.org/autoconf': '2',
    'gnu.org/automake': '1',
    'gnu.org/libtool': '2',
    'freedesktop.org/pkg-config': '*',
  },
  distributable: {
    url: 'https://github.com/libass/libass/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './autogen.sh',
      './configure $ARGS',
      'make install',
    ],
    env: {
      ARGS: [
        '--disable-dependency-tracking',
        '--prefix={{prefix}}',
      ],
      darwin: {
        ARGS: [
          '--disable-fontconfig',
        ],
      },
    },
  },
  test: {
    script: [
      'c++ test.cpp -lass -o test',
      './test',
    ],
  },
}
