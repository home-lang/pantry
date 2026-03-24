import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'mergiraf.org',
  name: 'mergiraf',
  description: 'Syntax-aware git merge driver',
  homepage: 'https://mergiraf.org',
  programs: ['mergiraf'],
  distributable: {
    url: 'https://codeberg.org/mergiraf/mergiraf/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'rust-lang.org/cargo': '*',
  },

  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
