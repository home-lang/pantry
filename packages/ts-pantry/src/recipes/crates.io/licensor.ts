import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/licensor',
  name: 'licensor',
  programs: [
    'licensor',
  ],
  dependencies: {
    'zlib.net': '^1',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.31',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/raftario/licensor/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
