import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/huniq',
  name: 'huniq',
  programs: [
    'huniq',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/koraa/huniq/archive/1d3c47eafb83147ea83594c64ba62b4fbbe3d617.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(huniq --version)" = "huniq 2.7.0"',
    ],
  },
}
