import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pypa.io/setuptools',
  name: 'setuptools',
  programs: [],
  dependencies: {
    'python.org': '~3.12',
  },
  distributable: {
    url: 'https://github.com/pypa/setuptools/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'sed -i \'s/^version = ".*"$/version = "{{version}}"/\' pyproject.toml',
      'python -m pip install --prefix={{prefix}} .',
    ],
  },
  test: {
    script: [
      'python -c \'import setuptools; print(setuptools.__version__)\' | tee out',
      'grep {{version}} out',
    ],
  },
}
