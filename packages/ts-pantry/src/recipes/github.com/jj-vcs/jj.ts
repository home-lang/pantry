import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/jj-vcs/jj',
  name: 'jj',
  programs: [
    'jj',
  ],
  buildDependencies: {
    'rust-lang.org': '^1.89',
    'rust-lang.org/cargo': '^0.91',
  },
  distributable: {
    url: 'https://github.com/jj-vcs/jj/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --locked --path cli --root {{prefix}} --bin jj',
    ],
  },
  test: {
    script: [
      'jj --version 2>&1 | tee out',
      'grep "jj {{version}}" out',
    ],
  },
}
