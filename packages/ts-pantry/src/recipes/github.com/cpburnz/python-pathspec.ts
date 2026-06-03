import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/cpburnz/python-pathspec',
  name: 'python-pathspec',
  programs: [],
  dependencies: {
    'python.org': '~3.11',
  },
  buildDependencies: {
    'flit.pypa.io': '*',
  },
  distributable: {
    url: 'git+https://github.com/cpburnz/python-pathspec.git',
  },
  build: {
    script: [
      'python -m pip install --prefix={{prefix}} .',
    ],
  },
}
