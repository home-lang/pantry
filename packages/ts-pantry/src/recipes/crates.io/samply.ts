import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/samply',
  name: 'samply',
  programs: [
    'samply',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.74',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/mstange/samply/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path samply --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(samply --version)" = "samply {{ version }}"',
    ],
  },
}
