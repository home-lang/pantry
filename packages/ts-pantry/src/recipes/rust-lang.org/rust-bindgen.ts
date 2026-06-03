import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'rust-lang.org/rust-bindgen',
  name: 'rust-bindgen',
  programs: [
    'bindgen',
  ],
  dependencies: {
    linux: {
      'llvm.org': '*',
    },
  },
  buildDependencies: {
    'rust-lang.org': '>=1.70',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/rust-lang/rust-bindgen/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path bindgen-cli --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'bindgen $FIXTURE | grep \'repr(C)\'',
    ],
  },
}
