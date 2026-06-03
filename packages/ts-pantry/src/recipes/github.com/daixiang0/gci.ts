import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/daixiang0/gci',
  name: 'gci',
  programs: [
    'gci',
  ],
  buildDependencies: {
    'go.dev': '^1.18',
  },
  distributable: {
    url: 'https://github.com/daixiang0/gci/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'mkdir -p "{{ prefix }}"/bin',
      'go build -v -trimpath -ldflags="$LDFLAGS" -o $BUILDLOC .',
    ],
    env: {
      GOPROXY: 'https://proxy.golang.org,direct',
      GOSUMDB: 'sum.golang.org',
      GO111MODULE: 'on',
      CGO_ENABLED: 0,
      BUILDLOC: '{{prefix}}/bin/gci',
      LDFLAGS: [
        '-s',
        '-w',
        '-X main.version={{version}}',
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
      'test "$(gci --version)" = "gci version {{version}}"',
    ],
  },
}
