import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/didyoumean',
  name: 'didyoumean',
  programs: [
    'dym',
  ],
  dependencies: {
    'openssl.org': '^1.1',
    linux: {
      'x.org/xcb': '*',
    },
  },
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/hisbaan/didyoumean/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(dym --version)" = "didyoumean {{version}}"',
    ],
  },
}
