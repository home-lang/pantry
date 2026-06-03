import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/git-absorb',
  name: 'git-absorb',
  programs: [
    'git-absorb',
  ],
  dependencies: {
    'libgit2.org': '~1.7',
  },
  buildDependencies: {
    'rust-lang.org': '>=1.65',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/tummychow/git-absorb/archive/refs/tags/{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path . --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'git init',
      'git config user.email "hello@pkgx.dev"',
      'git config user.name "pkgx"',
      'touch foo',
      'git add foo',
      'git commit -m "Add foo"',
      'echo a > foo',
      'git add foo',
      'git absorb',
      'test -z "$(git status --porcelain)"',
    ],
  },
}
