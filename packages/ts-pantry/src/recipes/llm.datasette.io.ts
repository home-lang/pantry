import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'llm.datasette.io',
  name: 'llm',
  description: 'Access large language models from the command-line',
  homepage: 'https://llm.datasette.io/',
  github: 'https://github.com/simonw/llm',
  programs: ['llm'],
  versionSource: {
    type: 'github-releases',
    repo: 'simonw/llm',
  },
  distributable: {
    url: 'https://github.com/simonw/llm/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'python.org': '>=3.11',
  },

  build: {
    script: [
      'rm -rf props',
      'python-venv.sh {{prefix}}/bin/llm',
    ],
  },
}
