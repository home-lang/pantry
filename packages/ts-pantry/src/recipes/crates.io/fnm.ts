import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/fnm',
  name: 'fnm',
  programs: [
    'fnm',
  ],
  dependencies: {
    darwin: {
      'zlib.net': '^1',
    },
  },
  buildDependencies: {
    'rust-lang.org': '>=1.60',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/Schniz/fnm/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(fnm --version)" = "fnm {{version}}"',
    ],
  },
}
