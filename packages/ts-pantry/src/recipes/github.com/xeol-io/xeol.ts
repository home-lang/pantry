import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/xeol-io/xeol',
  name: 'xeol',
  programs: [
    'xeol',
  ],
  buildDependencies: {
    'go.dev': '*',
  },
  distributable: {
    url: 'https://github.com/xeol-io/xeol/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build $GO_ARGS -ldflags="$LD_FLAGS" ./cmd/xeol',
    ],
    env: {
      GO_ARGS: [
        '-trimpath',
        '-o="{{prefix}}/bin/xeol"',
      ],
      LD_FLAGS: [
        '-s',
        '-w',
        '-X main.version={{version}}',
        '-X main.buildDate=$(date -u +"%Y-%m-%dT%H:%M:%SZ")',
      ],
      linux: {
        LD_FLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
