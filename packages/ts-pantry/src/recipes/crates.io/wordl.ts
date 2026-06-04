import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/wordl',
  name: 'wordl',
  programs: [
    'wordl',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/palerdot/wordl-rs/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'sed -i \'s/^version = .*/version = "{{ version }}"/\' Cargo.toml',
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
