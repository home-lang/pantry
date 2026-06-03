import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'wkentaro.github.io/gdown',
  name: 'gdown',
  programs: [
    'gdown',
  ],
  dependencies: {
    'python.org': '~3.11',
  },
  distributable: {
    url: 'git+https://github.com/wkentaro/gdown',
  },
  build: {
    script: [
      'python-venv.sh {{prefix}}/bin/gdown',
    ],
  },
  test: {
    script: [
      'test -n "$(gdown --version)"',
    ],
  },
}
