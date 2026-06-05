import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/oapi-codegen/oapi-codegen',
  name: 'oapi-codegen',
  programs: [
    'oapi-codegen',
  ],
  dependencies: {
    'go.dev': '*',
  },
  buildDependencies: {
    'go.dev': '=1.22.5',
  },
  distributable: {
    url: 'https://github.com/oapi-codegen/oapi-codegen/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'go build -v -ldflags="$LDFLAGS" -o \'{{prefix}}\'/bin/oapi-codegen ./cmd/oapi-codegen',
    ],
    env: {
      CGO_ENABLED: '0',
      LDFLAGS: [
        '-extldflags=-static',
        '-w',
        '-s',
        '-X=main.noVCSVersionOverride=v{{version}}',
      ],
    },
  },
  test: {
    script: [
      'oapi-codegen -version | grep v{{version}}',
      'oapi-codegen -package petstore petstore-expanded.yml > petstore.gen.go',
      'test -f petstore.gen.go',
    ],
  },
}
