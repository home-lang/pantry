import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/cavif',
  name: 'cavif',
  programs: [
    'cavif',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
    'x86-64': {
      'nasm.us': '*',
    },
  },
  distributable: {
    url: 'https://github.com/kornelski/cavif-rs/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(cavif --version)" = "cavif-rs {{version}}"',
    ],
  },
}
