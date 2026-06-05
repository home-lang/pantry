import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/caarlos0/svu',
  name: 'svu',
  programs: [
    'svu',
  ],
  buildDependencies: {
    'go.dev': '^1.20',
  },
  distributable: {
    url: 'https://github.com/caarlos0/svu/archive/refs/tags/{{version.tag}}.tar.gz',
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
      BUILDLOC: '{{prefix}}/bin/svu',
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X main.version={{version}}',
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
      'svu --version',
      'svu --version 2>&1 | grep {{version}}',
    ],
  },
}
