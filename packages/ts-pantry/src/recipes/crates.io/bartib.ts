import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'crates.io/bartib',
  name: 'bartib',
  programs: [
    'bartib',
  ],
  buildDependencies: {
    'rust-lang.org': '^1.65',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/nikolassv/bartib/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install --path . --root {{prefix}} --locked',
    ],
  },
  test: {
    script: [
      'bartib start -d "Urgent Task X" -p "Important Project"',
      'bartib stop',
      'bartib continue',
      'bartib start -d "More Urgent Task Y" -p "Just Another Project B"',
      'bartib list --today',
      'bartib report --today',
      'cat bartib.log',
    ],
  },
}
