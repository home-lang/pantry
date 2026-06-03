import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/dateutil/dateutil',
  name: 'dateutil',
  programs: [],
  dependencies: {
    'github.com/benjaminp/six': '^1.16',
    'python.org': '~3.11',
  },
  distributable: {
    url: 'git+https://github.com/dateutil/dateutil.git',
  },
  build: {
    script: [
      'python -m pip install --prefix={{prefix}} .',
    ],
  },
}
