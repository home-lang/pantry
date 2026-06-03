import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'sass-lang.com/libsass',
  name: 'libsass',
  programs: [],
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
  },
  distributable: {
    url: 'https://github.com/sass/libsass/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'autoreconf -fvi',
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--disable-silent-rules',
        '--disable-dependency-tracking',
      ],
    },
  },
  test: {
    script: [
      'cc test.c -lsass -o test',
      './test | grep \'Compilation successful\'',
    ],
  },
}
