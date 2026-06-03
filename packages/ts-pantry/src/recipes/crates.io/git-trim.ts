import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/git-trim',
  name: 'git-trim',
  programs: [
    'git-trim',
  ],
  dependencies: {
    'openssl.org': '^1.1',
    'zlib.net': '^1',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
    'freedesktop.org/pkg-config': '*',
  },
  distributable: {
    url: 'git+https://github.com/foriequal0/git-trim',
  },
  build: {
    script: [
      'cargo install --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'test "$(git-trim --version)" = "git-trim {{version}}"',
    ],
  },
}
