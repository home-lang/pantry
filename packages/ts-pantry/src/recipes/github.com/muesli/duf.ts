import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/muesli/duf',
  name: 'duf',
  programs: [
    'duf',
  ],
  buildDependencies: {
    'go.dev': '~1.23',
  },
  distributable: {
    url: 'https://github.com/muesli/duf/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'sed -i \'s/(built from source)/{{version}}/\' main.go',
        if: '>=0.9.0',
      },
      'go mod download',
      'go build -v -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/duf',
    ],
    env: {
      GO111MODULE: 'on',
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X main.Version={{version}}',
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
      'duf -version | tee out',
      'grep {{version}} out',
      'duf',
    ],
  },
}
