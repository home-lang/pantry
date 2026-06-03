import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/stern/stern',
  name: 'stern',
  programs: [
    'stern',
  ],
  buildDependencies: {
    'go.dev': '^1.21',
  },
  distributable: {
    url: 'https://github.com/stern/stern/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'go build -ldflags="$LDFLAGS" -o $BUILDLOC .',
    ],
    env: {
      CGO_ENABLED: 0,
      LDFLAGS: [
        '-s',
        '-w',
        '-X github.com/stern/stern/cmd.version={{version}}',
      ],
      BUILDLOC: '{{prefix}}/bin/stern',
    },
  },
  test: {
    script: [
      'test "$(stern --version)" = "version: {{version}}"',
    ],
  },
}
