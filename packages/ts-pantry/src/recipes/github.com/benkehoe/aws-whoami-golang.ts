import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/benkehoe/aws-whoami-golang',
  name: 'aws-whoami-golang',
  programs: [
    'aws-whoami',
  ],
  buildDependencies: {
    'go.dev': '^1.19',
  },
  distributable: {
    url: 'https://github.com/benkehoe/aws-whoami-golang/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'mkdir -p "{{ prefix }}"/bin',
      'go build -v -trimpath -ldflags="$LDFLAGS" -o $BUILDLOC ./aws-whoami',
    ],
    env: {
      GOPROXY: 'https://proxy.golang.org,direct',
      GOSUMDB: 'sum.golang.org',
      GO111MODULE: 'on',
      CGO_ENABLED: 0,
      BUILDLOC: '{{prefix}}/bin/aws-whoami',
      LDFLAGS: [
        '-s',
        '-w',
        '-X main.Version={{version}}',
      ],
      linux: {
        LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
