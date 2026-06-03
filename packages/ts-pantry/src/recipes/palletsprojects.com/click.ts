import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'palletsprojects.com/click',
  name: 'click',
  programs: [],
  dependencies: {
    'python.org': '>=3.11',
  },
  distributable: {
    url: 'git+https://github.com/pallets/click.git',
  },
  build: {
    script: [
      'python -m pip install --prefix={{prefix}} .',
      {
        run: 'ln -s python{{deps.python.org.version.marketing}} python{{deps.python.org.version.major}}',
        'working-directory': '${{prefix}}/lib',
      },
    ],
  },
}
