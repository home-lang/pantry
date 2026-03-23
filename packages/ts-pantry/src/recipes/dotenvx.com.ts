import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'dotenvx.com',
  name: 'dotenvx',
  programs: ['dotenvx'],
  distributable: {
    url: 'https://registry.npmjs.org/@dotenvx/dotenvx/-/dotenvx-{{version}}.tgz',
    stripComponents: 1,
  },
  dependencies: {
    'nodejs.org': '^16 || ^18 || ^20',
  },

  build: {
    script: [
      'npm i -g patch-package',
      'export PATH="$HOME/.local/bin:$PATH"',
      '',
      'npm install . --global --install-links --prefix="{{prefix}}"',
    ],
  },
}
