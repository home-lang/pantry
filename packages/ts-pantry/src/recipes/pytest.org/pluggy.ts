import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pytest.org/pluggy',
  name: 'pluggy',
  programs: [],
  dependencies: {
    'python.org': '^3.12',
  },
  buildDependencies: {
    'pypa.io/setuptools': '*',
  },
  distributable: {
    url: 'git+https://github.com/pytest-dev/pluggy.git',
  },
  build: {
    script: [
      'python -m pip install --prefix={{prefix}} .',
    ],
  },
}
