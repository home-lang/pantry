import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/anchore/grype',
  name: 'grype',
  programs: [
    'grype',
  ],
  buildDependencies: {
    'go.dev': '^1.21',
  },
  distributable: {
    url: 'https://github.com/anchore/grype/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build $GO_ARGS -ldflags="$LD_FLAGS" ./cmd/grype',
    ],
    env: {
      LD_FLAGS: [
        '-s -w',
        '-X main.version={{version}}',
        '-X main.gitCommit=pkgx',
      ],
      linux: {
        LD_FLAGS: [
          '-buildmode=pie',
        ],
      },
      GO_ARGS: [
        '-trimpath',
        '-o="{{prefix}}/bin/grype"',
      ],
    },
  },
  test: {
    script: [
      'grype --version',
      'grype --version | grep {{version}}',
    ],
  },
}
