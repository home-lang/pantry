import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/JuliaStrings/utf8proc',
  name: 'utf8proc',
  programs: [],
  distributable: {
    url: 'https://github.com/JuliaStrings/utf8proc/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make install prefix={{prefix}}',
    ],
  },
  test: {
    script: [
      'mv $FIXTURE fixture.c',
      'cc fixture.c -lutf8proc',
      './a.out',
    ],
  },
}
