import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'attrs.org',
  name: 'attrs',
  description: 'Python Classes Without Boilerplate',
  homepage: 'https://www.attrs.org/',
  github: 'https://github.com/python-attrs/attrs',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'python-attrs/attrs',
  },
  distributable: {
    url: 'git+https://github.com/python-attrs/attrs.git',
  },
  dependencies: {
    'python.org': '~3.11',
  },

  build: {
    script: [
      'python -m pip install --prefix={{prefix}} .',
    ],
  },
}
