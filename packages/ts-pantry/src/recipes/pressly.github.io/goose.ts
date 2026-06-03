import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'pressly.github.io/goose',
  name: 'goose',
  programs: [
    'goose',
  ],
  buildDependencies: {
    'go.dev': '^1.20',
  },
  distributable: {
    url: 'https://github.com/pressly/goose/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o \'{{prefix}}/bin/goose\' .',
    ],
    env: {
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X main.version=v{{version}}',
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
      'test "$(goose -version)" = "goose version: v{{version}}"',
      'mkdir -p $GOOSE_MIGRATION_DIR',
      'goose create add_some_column sql',
      'goose status',
      'goose up',
      'goose status',
      'goose down',
      'goose status',
    ],
  },
}
