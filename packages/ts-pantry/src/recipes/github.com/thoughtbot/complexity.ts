import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/thoughtbot/complexity',
  name: 'complexity',
  programs: [
    'complexity',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/thoughtbot/complexity/archive/refs/tags/{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(complexity --version)" = "complexity {{version}}"',
    ],
  },
}
