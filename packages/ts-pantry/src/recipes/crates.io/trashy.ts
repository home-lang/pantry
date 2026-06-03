import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/trashy',
  name: 'trashy',
  programs: [
    'trash',
  ],
  platforms: ['linux'],
  buildDependencies: {
    'rust-lang.org': '^1.62',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/oberblastmeister/trashy/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'touch foo',
      'trash foo',
      'trash list',
      'trash restore -f foo',
      'trash foo',
      'trash empty -f foo',
    ],
  },
}
