import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'jedsoft.org/slang',
  name: 'slang',
  programs: [
    'slsh',
  ],
  dependencies: {
    'libpng.org': '*',
    linux: {
      'pcre.org': '*',
    },
  },
  distributable: {
    url: 'https://www.jedsoft.org/releases/slang/slang-{{version}}.tar.bz2',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--with-pnglib={{deps.libpng.org.prefix}}/lib',
        '--with-pnginc={{deps.libpng.org.prefix}}/include',
      ],
    },
  },
}
