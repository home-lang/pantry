import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'git.tozt.net/rbw',
  name: 'rbw',
  programs: [
    'rbw',
  ],
  buildDependencies: {
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/doy/rbw/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --root={{ prefix}} --path=.',
    ],
  },
}
