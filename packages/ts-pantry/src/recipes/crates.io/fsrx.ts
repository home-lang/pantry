import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/fsrx',
  name: 'fsrx',
  programs: [
    'fsrx',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/jrnxf/fsrx/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(fsrx --version)" = "fsrx {{version}}"',
    ],
  },
}
