import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/YS-L/csvlens',
  name: 'csvlens',
  programs: [
    'csvlens',
  ],
  buildDependencies: {
    'rust-lang.org': '^1.65',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/YS-L/csvlens/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install $CARGO_ARGS',
    ],
    env: {
      CARGO_ARGS: [
        '--locked',
        '--root="{{prefix}}"',
        '--path=.',
      ],
    },
  },
  test: {
    script: [
      'csvlens --version | grep {{version}}',
    ],
  },
}
