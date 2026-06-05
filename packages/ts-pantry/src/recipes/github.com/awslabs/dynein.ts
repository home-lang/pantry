import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/awslabs/dynein',
  name: 'dynein',
  programs: [
    'dy',
  ],
  dependencies: {
    linux: {
      'openssl.org': '^1.1',
    },
  },
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
    'cmake.org': '3',
    linux: {
      'openssl.org': '*',
      'freedesktop.org/pkg-config': '*',
    },
  },
  distributable: {
    url: 'https://github.com/awslabs/dynein/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
