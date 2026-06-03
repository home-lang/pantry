import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'code.videolan.org/aribb24',
  name: 'aribb24',
  programs: [],
  dependencies: {
    'libpng.org': '*',
  },
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
    'freedesktop.org/pkg-config': '*',
  },
  distributable: {
    url: 'https://code.videolan.org/jeeb/aribb24/-/archive/v{{version}}/aribb24-v{{version}}.tar.bz2',
    stripComponents: 1,
  },
  build: {
    script: [
      './bootstrap',
      './configure $ARGS',
      'make install',
    ],
    env: {
      ARGS: [
        '--disable-silent-rules',
        '--prefix={{prefix}}',
      ],
    },
  },
  test: {
    script: [
      'cc -o test test.c -laribb24',
      './test',
    ],
  },
}
