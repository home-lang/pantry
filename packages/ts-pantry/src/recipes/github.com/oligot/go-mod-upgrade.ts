import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/oligot/go-mod-upgrade',
  name: 'go-mod-upgrade',
  programs: [
    'go-mod-upgrade',
  ],
  buildDependencies: {
    'go.dev': '~1.25.1',
  },
  distributable: {
    url: 'https://github.com/oligot/go-mod-upgrade/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o $BUILDLOC .',
    ],
    env: {
      GO111MODULE: 'on',
      CGO_ENABLED: '0',
      BUILDLOC: '{{prefix}}/bin/go-mod-upgrade',
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X main.version={{version}}',
        '-X github.com/oligot/go-mod-upgrade/main.version={{version}}',
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
      'test "$(go-mod-upgrade --version)" = "$OUTPUT"',
    ],
  },
}
