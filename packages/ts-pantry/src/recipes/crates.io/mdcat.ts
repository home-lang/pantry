import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/mdcat',
  name: 'mdcat',
  programs: [
    'mdcat',
  ],
  dependencies: {
    'openssl.org': '^1.1',
    'curl.se': 8,
  },
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/swsnr/mdcat/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
