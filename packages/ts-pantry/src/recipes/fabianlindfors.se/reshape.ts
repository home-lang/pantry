import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'fabianlindfors.se/reshape',
  name: 'reshape',
  programs: [
    'reshape',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/fabianlindfors/reshape/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(reshape --version)" = "Reshape {{version}}"',
    ],
  },
}
