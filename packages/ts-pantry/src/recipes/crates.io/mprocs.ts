import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/mprocs',
  name: 'mprocs',
  programs: [
    'mprocs',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.56',
    'rust-lang.org/cargo': '*',
    linux: {
      'gnu.org/gcc': '*',
      'gnu.org/binutils': '*',
      'gnu.org/make': '*',
    },
  },
  distributable: {
    url: 'https://github.com/pvolok/mprocs/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path ./src --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'mprocs --version',
    ],
  },
}
