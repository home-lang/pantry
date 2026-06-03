import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'palletsprojects.com/jinja',
  name: 'jinja',
  programs: [],
  dependencies: {
    'python.org': '>=3.11',
    'markupsafe.palletsprojects.com': '>=2.1',
  },
  distributable: {
    url: 'git+https://github.com/pallets/jinja.git',
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
