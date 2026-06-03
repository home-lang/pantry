import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/noahgorstein/jqp',
  name: 'jqp',
  programs: [
    'jqp',
  ],
  buildDependencies: {
    'go.dev': '=1.25.5',
  },
  distributable: {
    url: 'https://github.com/noahgorstein/jqp/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'go build -v -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/jqp .',
    ],
    env: {
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X github.com/noahgorstein/jqp/internal/version.Version={{version}}',
      ],
      linux: {
        GO_LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
  test: {
    script: [
      'jqp --version | tee out',
      'grep \'jqp version {{version}}\' out',
    ],
  },
}
