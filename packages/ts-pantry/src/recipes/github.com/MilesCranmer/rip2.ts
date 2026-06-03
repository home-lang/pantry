import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/MilesCranmer/rip2',
  name: 'rip2',
  programs: [
    'rip',
  ],
  buildDependencies: {
    'rust-lang.org': '>=1.75',
    'rust-lang.org/cargo': '*',
  },
  distributable: {
    url: 'https://github.com/MilesCranmer/rip2/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cargo install $ARGS',
    ],
    env: {
      ARGS: [
        '--locked',
        '--path=.',
        '--root {{prefix}}',
      ],
    },
  },
  test: {
    script: [
      'test "$(rip --version)" = "rip {{version}}"',
      'touch foo',
      'rip foo',
      'rip --seance',
      'touch foo',
      'rip foo',
      'rip --seance',
      'FOO1="$(rip --seance | grep \'foo~1\' | sed \'s/.*\\t//\')"',
      'rip --unbury "$FOO1"',
      'test -f foo',
      'rip completions zsh',
      'rm -rf "$(rip graveyard)"',
    ],
  },
}
