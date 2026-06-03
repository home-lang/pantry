import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/siderolabs/conform',
  name: 'conform',
  programs: [
    'conform',
  ],
  buildDependencies: {
    'go.dev': '^1.19',
  },
  distributable: {
    url: 'https://github.com/siderolabs/conform/archive/refs/tags/v0.1.0-alpha.27.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'mkdir -p {{ prefix }}/bin',
      'go build -v -trimpath -ldflags="$LDFLAGS" -o $BUILDLOC ./cmd/conform',
    ],
    env: {
      GOPROXY: 'https://proxy.golang.org,direct',
      GOSUMDB: 'sum.golang.org',
      GO111MODULE: 'on',
      CGO_ENABLED: 0,
      BUILDLOC: '{{prefix}}/bin/conform',
      LDFLAGS: [
        '-s',
        '-w',
        '-X github.com/siderolabs/conform/internal/version.Name=conform',
        '-X github.com/siderolabs/conform/internal/version.Tag={{version}}',
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
      'conform version | grep {{version}}',
    ],
  },
}
