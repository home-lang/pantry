import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'psycopg.org/psycopg2',
  name: 'psycopg2',
  programs: [],
  dependencies: {
    'python.org': '~3.11',
    'postgresql.org': '*',
  },
  distributable: {
    url: 'git+https://github.com/psycopg/psycopg2.git',
  },
  build: {
    script: [
      'python -m pip install --prefix={{prefix}} .',
    ],
  },
}
