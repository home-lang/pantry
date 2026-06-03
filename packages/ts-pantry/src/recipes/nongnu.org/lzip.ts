import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'nongnu.org/lzip',
  name: 'lzip',
  programs: [
    'lzip',
  ],
  distributable: {
    url: 'https://cdn.betsu.org/mirrors/savannah/lzip/lzip-{{version.marketing}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make install',
    ],
    env: {
      ARGS: [
        '--prefix="{{prefix}}"',
      ],
    },
  },
}
