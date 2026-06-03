import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/dua',
  name: 'dua',
  programs: [
    'dua',
  ],
  dependencies: {
    'zlib.net': '^1',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.60',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/Byron/dua-cli/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'for x in foo bar baz bat; do',
      '  echo $x > $x',
      'done',
      'dua',
    ],
  },
}
