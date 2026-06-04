import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'authzed.com/spicedb',
  name: 'spicedb',
  programs: [
    'spicedb',
  ],
  buildDependencies: {
    'go.dev': '^1.22',
  },
  distributable: {
    url: 'https://github.com/authzed/spicedb/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'go build -v -trimpath -tags netgo -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/spicedb ./cmd/spicedb',
    ],
    env: {
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X github.com/jzelinskie/cobrautil/v2.Version=v{{version}}',
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
      'spicedb help',
      'spicedb version',
    ],
  },
}
