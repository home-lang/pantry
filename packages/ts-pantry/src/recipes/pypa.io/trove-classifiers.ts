import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pypa.io/trove-classifiers',
  name: 'trove-classifiers',
  programs: [],
  dependencies: {
    'python.org': '~3.12',
  },
  buildDependencies: {
    'pypa.io/setuptools': '*',
  },
  distributable: {
    url: 'https://github.com/pypa/trove-classifiers/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'python -m pip install --prefix={{prefix}} .',
    ],
  },
  test: {
    script: [
      'python -m trove_classifiers | grep \'Environment\'',
      'python -c \'import trove_classifiers;\'',
    ],
  },
}
