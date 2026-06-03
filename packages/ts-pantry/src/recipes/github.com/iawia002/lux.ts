import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/iawia002/lux',
  name: 'lux',
  programs: [
    'lux',
  ],
  dependencies: {
    'ffmpeg.org': '*',
  },
  buildDependencies: {
    'go.dev': '^1.21',
  },
  distributable: {
    url: 'https://github.com/iawia002/lux/archive/refs/tags/v{{version}}.tar.gz',
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
      BUILDLOC: '{{prefix}}/bin/lux',
      LDFLAGS: [
        '-s',
        '-w',
        '-buildid=',
        '-X github.com/iawia002/lux/app.version=v{{version}}',
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
      'lux --version | grep {{version}}',
    ],
  },
}
