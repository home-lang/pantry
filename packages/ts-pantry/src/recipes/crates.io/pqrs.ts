import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/pqrs',
  name: 'pqrs',
  programs: [
    'pqrs',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/manojkarthick/pqrs/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(pqrs --version)" = "pqrs {{version}}"',
    ],
  },
}
