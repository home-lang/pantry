import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'yadm.io',
  name: 'yadm',
  description: 'Yet Another Dotfiles Manager',
  homepage: 'https://yadm.io/',
  github: 'https://github.com/yadm-dev/yadm',
  programs: ['yadm'],
  versionSource: {
    type: 'github-releases',
    repo: 'TheLocehiliosan/yadm',
  },
  distributable: {
    url: 'https://github.com/TheLocehiliosan/yadm/archive/refs/tags/{{ version }}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'git-scm.org': '*',
    'gnu.org/bash': '*',
  },

  build: {
    script: [
      'make install PREFIX={{ prefix }}',
    ],
  },
}
