import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'jonas.github.io/tig',
  name: 'tig',
  programs: [
    'tig',
  ],
  dependencies: {
    'gnu.org/libiconv': '^1',
    'invisible-island.net/ncurses': '^6',
  },
  distributable: {
    url: 'https://github.com/jonas/tig/releases/download/{{version.tag}}/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure --prefix={{prefix}}',
      'make prefix={{prefix}}',
      'make prefix={{prefix}} install',
    ],
  },
}
