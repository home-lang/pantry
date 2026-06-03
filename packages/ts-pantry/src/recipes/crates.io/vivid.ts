import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/vivid',
  name: 'vivid',
  programs: [
    'vivid',
  ],
  dependencies: {
    'zlib.net': '^1',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.60',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/sharkdp/vivid/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
