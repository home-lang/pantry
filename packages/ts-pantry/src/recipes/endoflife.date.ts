import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'endoflife.date',
  name: 'eol',
  description: 'CLI to show end-of-life dates for a number of products.',
  homepage: 'https://endoflife.date',
  github: 'https://github.com/hugovk/norwegianblue',
  programs: ['eol'],
  versionSource: {
    type: 'github-releases',
    repo: 'hugovk/norwegianblue',
  },
  distributable: {
    url: 'https://github.com/hugovk/norwegianblue/archive/{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'python.org': '^3.12',
  },

  build: {
    script: [
      'python-venv.sh {{prefix}}/bin/eol',
    ],
  },
}
