import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/zoxide',
  name: 'zoxide',
  programs: [
    'zoxide',
  ],
  buildDependencies: {
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/ajeetdsouza/zoxide/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
