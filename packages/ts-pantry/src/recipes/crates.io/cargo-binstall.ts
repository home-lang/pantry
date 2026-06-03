import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/cargo-binstall',
  name: 'cargo-binstall',
  programs: [
    'cargo-binstall',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.87',
  },
  distributable: {
    url: 'https://github.com/cargo-bins/cargo-binstall/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path crates/bin --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'cargo-binstall --no-confirm semverator',
      'semverator validate 1.2.3',
    ],
  },
}
