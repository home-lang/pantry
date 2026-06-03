import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/click',
  name: 'click',
  programs: [
    'click',
  ],
  dependencies: {
    'openssl.org': '^1.1',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
    'freedesktop.org/pkg-config': '^0.29',
  },
  distributable: {
    url: 'https://github.com/databricks/click/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(click --version)" = "Click {{version}}"',
    ],
  },
}
