import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/diskonaut',
  name: 'diskonaut',
  programs: [
    'diskonaut',
  ],
  buildDependencies: {
    'rust-lang.org': '^1.65',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/imsnif/diskonaut/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --path . --root {{prefix}}',
    ],
  },
}
