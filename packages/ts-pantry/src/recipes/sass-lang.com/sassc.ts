import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'sass-lang.com/sassc',
  name: 'sassc',
  programs: [
    'sassc',
  ],
  dependencies: {
    'sass-lang.com/libsass': '^3.6.5',
  },
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
    'gnu.org/libtool': '*',
  },
  distributable: {
    url: 'https://github.com/sass/sassc/archive/refs/tags/{{version}}.tar.gz',
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
      'sassc --style compressed test.scss | grep \'div img{border:0px}\'',
    ],
  },
}
