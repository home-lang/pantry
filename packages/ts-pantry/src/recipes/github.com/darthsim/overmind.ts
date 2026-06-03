import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/darthsim/overmind',
  name: 'overmind',
  programs: [
    'overmind',
  ],
  dependencies: {
    'github.com/tmux/tmux': '*',
  },
  buildDependencies: {
    'go.dev': '>=1.21',
  },
  distributable: {
    url: 'https://github.com/DarthSim/overmind/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -v -ldflags="$LDFLAGS" -o "{{prefix}}"/bin/overmind',
    ],
    env: {
      CGO_ENABLED: 0,
      LDFLAGS: [
        '-s',
        '-w',
      ],
      linux: {
        LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
