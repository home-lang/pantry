import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/kjd/idna',
  name: 'idna',
  programs: [],
  dependencies: {
    'python.org': '~3.11',
  },
  buildDependencies: {
    'flit.pypa.io': '*',
  },
  distributable: {
    url: 'git+https://github.com/kjd/idna.git',
  },
  build: {
    script: [
      'python -m pip install --prefix={{prefix}} .',
    ],
  },
}
