import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pypa.io/packaging',
  name: 'packaging',
  programs: [],
  dependencies: {
    'python.org': '>=3.11',
  },
  distributable: {
    url: 'git+https://github.com/pypa/packaging.git',
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
  test: {
    script: [
      'python -c \'import packaging; print(packaging.__version__);\' | grep {{version.tag}}',
    ],
  },
}
