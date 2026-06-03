import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/dylanaraps/neofetch',
  name: 'neofetch',
  programs: [
    'neofetch',
  ],
  dependencies: {
    darwin: {
      'github.com/jhford/screenresolution': '*',
    },
  },
  distributable: {
    url: 'https://github.com/dylanaraps/neofetch/archive/{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        'PREFIX="{{prefix}}"',
      ],
    },
  },
}
