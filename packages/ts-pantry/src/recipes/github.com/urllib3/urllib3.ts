import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/urllib3/urllib3',
  name: 'urllib3',
  programs: [],
  dependencies: {
    'python.org': '~3.11',
  },
  distributable: {
    url: 'git+https://github.com/urllib3/urllib3.git',
  },
  build: {
    script: [
      'python -m pip install --prefix={{prefix}} .',
    ],
  },
}
