import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'thoughtworks.github.io/talisman',
  name: 'talisman',
  programs: [
    'talisman',
  ],
  buildDependencies: {
    'go.dev': '~1.24.2',
  },
  distributable: {
    url: 'https://github.com/thoughtworks/talisman/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod tidy',
      'go build $ARGS -ldflags="$GO_LDFLAGS" ./cmd',
    ],
    env: {
      ARGS: [
        '-trimpath',
        '-o={{prefix}}/bin/talisman',
      ],
      linux: {
        ARGS: [
          '-buildmode=pie',
        ],
      },
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X=main.Version={{version.tag}}',
      ],
    },
  },
  test: {
    script: [
      'talisman --version | grep {{version}}',
      'git init .',
      'talisman --scan | grep \'Talisman done\'',
    ],
  },
}
