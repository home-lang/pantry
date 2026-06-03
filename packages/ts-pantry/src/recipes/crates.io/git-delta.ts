import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/git-delta',
  name: 'git-delta',
  programs: [
    'delta',
  ],
  dependencies: {
    'libgit2.org': '~1.7',
    darwin: {
      'zlib.net': '^1',
    },
  },
  buildDependencies: {
    'rust-lang.org': '>=1.60',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/dandavison/delta/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'delta --version',
    ],
  },
}
