import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'brxken128.github.io/dexios',
  name: 'dexios',
  programs: [
    'dexios',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/brxken128/dexios/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path dexios --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(dexios --version)" = "dexios {{version}}"',
    ],
  },
}
