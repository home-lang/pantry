import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/giampaolo/psutil',
  name: 'psutil',
  programs: [],
  dependencies: {
    'python.org': '~3.11',
  },
  distributable: {
    url: 'git+https://github.com/giampaolo/psutil.git',
  },
  build: {
    script: [
      'python -m pip install --prefix={{prefix}} .',
    ],
  },
}
