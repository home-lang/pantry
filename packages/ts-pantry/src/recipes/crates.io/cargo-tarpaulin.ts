import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/cargo-tarpaulin',
  name: 'cargo-tarpaulin',
  programs: [
    'cargo-tarpaulin',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/xd009642/tarpaulin/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(cargo-tarpaulin --version)" = "tarpaulin {{ version }}"',
      'cargo tarpaulin --help',
    ],
  },
}
