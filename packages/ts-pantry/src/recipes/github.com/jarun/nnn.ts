import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/jarun/nnn',
  name: 'nnn',
  programs: [
    'nnn',
  ],
  dependencies: {
    'invisible-island.net/ncurses': 6,
    'gnu.org/readline': 8,
  },
  distributable: {
    url: 'https://github.com/jarun/nnn/releases/download/{{version.tag}}/nnn-{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make --jobs {{ hw.concurrency }} strip install PREFIX={{prefix}}',
    ],
  },
}
