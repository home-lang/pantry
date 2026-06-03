import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/samwho/spacer',
  name: 'spacer',
  programs: [
    'spacer',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/samwho/spacer/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(spacer --version)" = "spacer {{version}}"',
    ],
  },
}
