import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/pyparsing/pyparsing',
  name: 'pyparsing',
  programs: [],
  dependencies: {
    'python.org': '~3.11',
  },
  buildDependencies: {
    'flit.pypa.io': '*',
  },
  distributable: {
    url: 'git+https://github.com/pyparsing/pyparsing.git',
  },
  build: {
    script: [
      'python -m pip install --prefix={{prefix}} .',
    ],
  },
}
