import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'snyk.io/driftctl',
  name: 'driftctl',
  programs: [
    'driftctl',
  ],
  buildDependencies: {
    'go.dev': '^1.21',
  },
  distributable: {
    url: 'https://github.com/snyk/driftctl/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'mkdir -p {{ prefix }}/bin',
      'go build -v -trimpath -ldflags="$LDFLAGS" -o $BUILDLOC .',
    ],
    env: {
      GOPROXY: 'https://proxy.golang.org,direct',
      GOSUMDB: 'sum.golang.org',
      GO111MODULE: 'on',
      CGO_ENABLED: '0',
      BUILDLOC: '{{prefix}}/bin/driftctl',
      LDFLAGS: [
        '-s',
        '-w',
        '-X github.com/snyk/driftctl/pkg/version.version={{version}}',
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
      'driftctl version | grep {{version}}',
    ],
  },
}
