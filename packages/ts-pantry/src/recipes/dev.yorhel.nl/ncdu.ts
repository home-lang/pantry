import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'dev.yorhel.nl/ncdu',
  name: 'ncdu',
  programs: [
    'ncdu',
  ],
  dependencies: {
    'invisible-island.net/ncurses': '*',
  },
  distributable: {
    url: 'https://dev.yorhel.nl/download/ncdu-{{ version.raw }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make -j {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix {{ prefix }}',
      ],
    },
  },
}
