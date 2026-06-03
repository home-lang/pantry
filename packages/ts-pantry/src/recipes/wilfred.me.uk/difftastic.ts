import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'wilfred.me.uk/difftastic',
  name: 'difftastic',
  programs: [
    'difft',
  ],
  buildDependencies: {
    'rust-lang.org': '^1.65',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/Wilfred/difftastic/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install $ARGS',
    ],
    env: {
      ARGS: [
        '--locked',
        '--root={{prefix}}',
        '--path=.',
      ],
    },
  },
  test: {
    script: [
      'echo "print(42)" > a.py',
      'echo "print(43)" > b.py',
      'difft --color never --width 80 a.py b.py',
      'difft --color never --width 80 a.py b.py | grep -E "$SEARCH"',
      'difft --version | grep {{version}}',
    ],
  },
}
