import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/bottom',
  name: 'bottom',
  programs: [
    'btm',
  ],
  buildDependencies: {
    'rust-lang.org': '^1.82',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/ClementTsang/bottom/archive/refs/tags/{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
