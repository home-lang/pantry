import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'charm.sh/skate',
  name: 'skate',
  programs: [
    'skate',
  ],
  dependencies: {
    'curl.se/ca-certs': '*',
  },
  buildDependencies: {
    'go.dev': '^1.21',
  },
  distributable: {
    url: 'https://github.com/charmbracelet/skate/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build $ARGS -ldflags="$LDFLAGS" .',
    ],
    env: {
      ARGS: [
        '-trimpath',
        '-o={{prefix}}/bin/skate',
      ],
      linux: {
        ARGS: [
          '-buildmode=pie',
        ],
      },
      LDFLAGS: [
        '-s',
        '-w',
        '-X main.Version={{version}}',
      ],
    },
  },
  test: {
    script: [
      'skate set foo bar',
      'skate get foo | grep bar',
      'skate list | grep foo',
      'skate set 猫咪 喵',
      'skate get 猫咪 | grep 喵',
      'skate --version | grep {{version}}',
    ],
  },
}
