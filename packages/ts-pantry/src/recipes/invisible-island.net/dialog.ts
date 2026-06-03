import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'invisible-island.net/dialog',
  name: 'dialog',
  programs: [
    'dialog',
    'dialog-config',
  ],
  dependencies: {
    'invisible-island.net/ncurses': '*',
  },
  distributable: {
    url: 'https://invisible-mirror.net/archives/dialog/dialog-1.3-20230209.tgz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install-full',
    ],
    env: {
      ARGS: [
        '--prefix="{{prefix}}"',
        '--with-ncurses',
      ],
    },
  },
}
