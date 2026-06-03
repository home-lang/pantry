import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/srgn',
  name: 'srgn',
  programs: [
    'srgn',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/alexpovel/srgn/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(srgn --version)" = "srgn {{version}}"',
      'cat $FIXTURE | srgn --python \'doc-strings\' \'(?<!The )GNU\' \'GNU 🐂 is not Unix\' | srgn --symbols >test.out',
      'cmp $FIXTURE test.out',
    ],
  },
}
