import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'svenstaro.github.io/genact',
  name: 'genact',
  programs: [
    'genact',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/svenstaro/genact/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(genact --version)" = "genact {{version}}"',
    ],
  },
}
