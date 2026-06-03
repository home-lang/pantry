import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/pueue',
  name: 'pueue',
  programs: [
    'pueue',
    'pueued',
  ],
  buildDependencies: {
    'rust-lang.org': '^1.65',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/nukesor/pueue/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --path pueue --root {{prefix}}',
    ],
  },
  test: {
    script: [
      'pueued -d',
      'sleep 5',
      'pueue add ls',
      'pueue add command -v pueue',
      'pueue start',
      'sleep 3',
      'pueue status',
      'pueue log',
    ],
  },
}
