import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/bat',
  name: 'bat',
  programs: [
    'bat',
  ],
  dependencies: {
    'zlib.net': '^1',
    'libgit2.org': '~1.7',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.60',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/sharkdp/bat/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'mv $FIXTURE $FIXTURE.js',
      'bat $FIXTURE.js',
    ],
  },
}
