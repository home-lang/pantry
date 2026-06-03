import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'mozilla.org/cbindgen',
  name: 'cbindgen',
  programs: [
    'cbindgen',
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
    url: 'https://github.com/mozilla/cbindgen/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'bindgen $FIXTURE > output.rs',
      'cbindgen output.rs | grep \'extern "C"\'',
    ],
  },
}
