import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'tinybird.co',
  name: 'tb',
  programs: ['tb'],
  distributable: null,
  dependencies: {
    'pkgx.sh': '>=1',
  },
  buildDependencies: {
    'python.org': '~3.13',
  },

  build: {
    script: [
      'bkpyvenv stage {{prefix}} {{version}}',
      '${{prefix}}/venv/bin/pip install tinybird-cli=={{version}}',
      'bkpyvenv seal {{prefix}} tb',
    ],
  },
}
