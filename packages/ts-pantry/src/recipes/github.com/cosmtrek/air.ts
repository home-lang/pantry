import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/cosmtrek/air',
  name: 'air',
  programs: [
    'air',
  ],
  buildDependencies: {
    'git-scm.org': '*',
    'go.dev': '^1.22',
  },
  distributable: {
    url: 'https://github.com/cosmtrek/air/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    // Build the binary directly with `go build`. `make build` depends on the
    // `check` target which runs golangci-lint; the linter is irrelevant to
    // producing the binary and its prebuilt binary is the wrong arch in CI.
    script: [
      'go build $GO_ARGS -ldflags="$LDFLAGS" -o {{ prefix }}/bin/air',
    ],
    env: {
      GO_ARGS: [
        '-trimpath',
      ],
      LDFLAGS: [
        '-s',
        '-w',
        '-X main.airVersion=v{{version}}',
      ],
      linux: {
        LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
