import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/xiph/rav1e',
  name: 'rav1e',
  programs: [
    'rav1e',
  ],
  dependencies: {
    'nasm.us': '^2.14.02',
  },
  buildDependencies: {
    'rust-lang.org': '^1.70',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/xiph/rav1e/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
}
