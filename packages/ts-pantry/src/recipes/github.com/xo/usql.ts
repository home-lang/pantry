import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/xo/usql',
  name: 'usql',
  programs: [
    'usql',
  ],
  buildDependencies: {
    'go.dev': '^1.21',
    'crates.io/sd': '*',
  },
  distributable: {
    url: 'https://github.com/xo/usql/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'sd 0.0.0-dev v{{version}} text/text.go',
      'go mod download',
      'mkdir -p {{ prefix }}/bin',
      'go build -v -trimpath -ldflags="$LDFLAGS" -o $BUILDLOC .',
    ],
    env: {
      GOPROXY: 'https://proxy.golang.org,direct',
      GOSUMDB: 'sum.golang.org',
      GO111MODULE: 'on',
      CGO_ENABLED: 1,
      BUILDLOC: '{{prefix}}/bin/usql',
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
  test: {
    script: [
      'test "$(usql --version)" = "usql v{{version}}"',
    ],
  },
}
