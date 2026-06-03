import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/tiny',
  name: 'tiny',
  programs: [
    'tiny',
  ],
  dependencies: {
    'openssl.org': '^1.1',
  },
  buildDependencies: {
    'rust-lang.org': '^1.65',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/osa1/tiny/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --path crates/tiny --root {{prefix}} --locked',
    ],
  },
  test: {
    script: [
      'tiny --help',
      'tiny --version | grep {{version}}',
    ],
  },
}
