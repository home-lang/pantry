import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/swaggo/swag',
  name: 'swag',
  programs: [
    'swag',
  ],
  buildDependencies: {
    'go.dev': '~1.18',
  },
  distributable: {
    url: 'https://github.com/swaggo/swag/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'sed -i \'s/1\\.16\\.4/{{version}}/\' version.go',
      'go mod download',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/swag ./cmd/swag',
    ],
    env: {
      GO_LDFLAGS: [
        '-w',
      ],
      darwin: {
        GO_LDFLAGS: [
          '-linkmode=external',
        ],
      },
      linux: {
        GO_LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
  test: {
    script: [
      'swag --version',
      'test "$(swag --version)" = "swag version v{{version}}"',
      'cp $FIXTURE main.go',
      'swag init',
      'test -f docs/docs.go',
      'test -f docs/swagger.json',
    ],
  },
}
