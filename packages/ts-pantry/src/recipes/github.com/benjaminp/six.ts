import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/benjaminp/six',
  name: 'six',
  programs: [],
  dependencies: {
    'python.org': '~3.11',
  },
  distributable: {
    url: 'https://github.com/benjaminp/six/archive/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'python setup.py install --prefix={{prefix}}',
    ],
  },
  test: {
    script: [
      'python test.py',
    ],
  },
}
