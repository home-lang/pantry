import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'htop.dev',
  name: 'htop',
  description: 'Improved top (interactive process viewer)',
  homepage: 'https://htop.dev/',
  github: 'https://github.com/htop-dev/htop',
  programs: ['htop'],
  versionSource: {
    type: 'github-releases',
    repo: 'htop-dev/htop/tags',
  },
  distributable: {
    url: 'https://github.com/htop-dev/htop/releases/download/{{version}}/htop-{{version}}.tar.xz',
    stripComponents: 1,
  },
  dependencies: {
    'invisible-island.net/ncurses': '6',
  },
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/automake': '*',
  },

  build: {
    script: [
      './configure --prefix={{prefix}}',
      'make',
      'make install',
      '',
    ],
  },
}
