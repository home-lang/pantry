import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/terrarium-tf',
  name: 'terrarium-tf',
  programs: [
    'terrarium',
  ],
  dependencies: {
    'terraform.io': '*',
  },
  buildDependencies: {
    'go.dev': '^1.18',
  },
  distributable: {
    url: 'https://github.com/terrarium-tf/cli/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'go build -v -trimpath -ldflags="$LDFLAGS" -o $BUILDLOC .',
    ],
    env: {
      GOPROXY: 'https://proxy.golang.org,direct',
      GOSUMDB: 'sum.golang.org',
      GO111MODULE: 'on',
      CGO_ENABLED: 0,
      BUILDLOC: '{{prefix}}/bin/terrarium',
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
}
