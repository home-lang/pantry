import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'mpmath.org',
  name: 'mpmath',
  programs: [],
  distributable: {
    url: 'https://mpmath.org/files/mpmath-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'python.org': '~3.11',
  },

  build: {
    script: [
      'python -m pip install --prefix={{prefix}} .',
    ],
  },
}
