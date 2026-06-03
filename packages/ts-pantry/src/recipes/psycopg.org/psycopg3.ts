import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'psycopg.org/psycopg3',
  name: 'psycopg3',
  programs: [],
  dependencies: {
    'python.org': '~3.11',
    'postgresql.org': '*',
  },
  distributable: {
    url: 'git+https://github.com/psycopg/psycopg.git',
  },
  build: {
    script: [
      'python -m pip install --prefix={{prefix}} \'./psycopg[binary]\'',
    ],
  },
}
