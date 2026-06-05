import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/go-acme/lego',
  name: 'lego',
  programs: [
    'lego',
  ],
  buildDependencies: {
    'go.dev': '^1.25',
  },
  distributable: {
    url: 'https://github.com/go-acme/lego/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'go build -v -ldflags="${GO_LDFLAGS}" -o {{ prefix }}/bin/lego ./cmd/lego',
        if: '<5',
      },
      {
        run: 'go build -v -ldflags="${GO_LDFLAGS}" -o {{ prefix }}/bin/lego .',
        if: '>=5',
      },
    ],
    env: {
      CGO_ENABLED: '0',
      GO11MODULE: 'on',
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X main.version={{ version }}',
      ],
      linux: {
        GO_LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
