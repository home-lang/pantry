import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/99designs/aws-vault',
  name: 'aws-vault',
  programs: [
    'aws-vault',
  ],
  buildDependencies: {
    'go.dev': '^1.20',
  },
  distributable: {
    url: 'https://github.com/99designs/aws-vault/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -v -ldflags="$LDFLAGS" -o {{ prefix }}/bin/aws-vault ./main.go',
    ],
    env: {
      LDFLAGS: [
        '-w',
        '-s',
        '-X=main.Version=v{{version}}',
      ],
      linux: {
        CGO_ENABLED: '0',
        LDFLAGS: [
          '-extldflags=-static',
        ],
      },
      darwin: {
        SDKROOT: '$(xcrun --sdk macosx --show-sdk-path)',
        CGO_ENABLED: '1',
      },
    },
  },
  test: {
    script: [
      'test "$(aws-vault --version 2>&1)" = v{{version}}',
    ],
  },
}
