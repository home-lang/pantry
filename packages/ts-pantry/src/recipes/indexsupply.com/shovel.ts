import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'indexsupply.com/shovel',
  name: 'shovel',
  programs: [
    'shovel',
  ],
  buildDependencies: {
    'go.dev': '^1.21',
  },
  distributable: {
    url: 'https://github.com/indexsupply/code/archive/refs/tags/v{{version.marketing}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'go build -v -trimpath -buildmode=pie -ldflags="$LDFLAGS" -o $BUILDLOC ./cmd/shovel',
    ],
    env: {
      BUILDLOC: '{{prefix}}/bin/shovel',
      LDFLAGS: [
        '-s',
        '-w',
        '-X main.Version={{version}}',
      ],
    },
  },
  test: {
    script: [
      'shovel --help',
      'shovel -version | grep \'^v{{version}}\'',
    ],
  },
}
