import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/cirruslabs/cirrus-cli',
  name: 'cirrus-cli',
  programs: [
    'cirrus',
  ],
  buildDependencies: {
    'go.dev': '^1.22',
  },
  distributable: {
    url: 'https://github.com/cirruslabs/cirrus-cli/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -v -ldflags="${GO_LDFLAGS}" -o {{ prefix }}/bin/cirrus ./cmd/cirrus',
    ],
    env: {
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X github.com/cirruslabs/cirrus-cli/internal/version.Version={{ version }}',
        '-X github.com/cirruslabs/cirrus-cli/internal/version.Commit=release',
      ],
      linux: {
        GO_LDFLAGS: [
          '-buildmode=pie',
        ],
      },
      darwin: {
        CGO_ENABLED: 1,
      },
    },
  },
  test: {
    script: [
      'test "$(cirrus --version)" = "cirrus version {{version}}-release"',
      'cirrus validate -f $FIXTURE',
    ],
  },
}
