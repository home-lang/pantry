import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'dhruvkb.dev/pls',
  name: 'pls',
  programs: [
    'pls',
  ],
  dependencies: {
    'libgit2.org': '~1.7',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/pls-rs/pls/archive/refs/tags/v0.0.1-beta.3.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(pls --version 2>&1 || true)" = "pls 0.0.1-beta.3"',
    ],
  },
}
