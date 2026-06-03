import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'go.dev/testscript',
  name: 'testscript',
  programs: [
    'testscript',
  ],
  buildDependencies: {
    'go.dev': '~1.21',
  },
  distributable: {
    url: 'https://github.com/rogpeppe/go-internal/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o \'{{prefix}}/bin/testscript\' ./cmd/testscript',
    ],
    env: {
      GO_LDFLAGS: [
        '-s',
        '-w',
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
      'test "$(pkgx $FIXTURE)" = "PASS"',
    ],
  },
}
