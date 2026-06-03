import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/rage',
  name: 'rage',
  programs: [
    'rage',
    'rage-keygen',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/str4d/rage/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(rage --version)" = "rage {{version}}"',
      'test "$(rage-keygen --version)" = "rage-keygen {{version}}"',
    ],
  },
}
