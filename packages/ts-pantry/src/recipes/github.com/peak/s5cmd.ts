import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/peak/s5cmd',
  name: 's5cmd',
  programs: [
    's5cmd',
  ],
  buildDependencies: {
    'git-scm.org': '*',
    'go.dev': '~1.20',
  },
  distributable: {
    url: 'git+https://github.com/peak/s5cmd',
  },
  build: {
    script: [
      'go build -v -ldflags="${GO_LDFLAGS}" -mod=vendor -o "{{ prefix }}"/bin/s5cmd',
    ],
    env: {
      CGO_ENABLED: 0,
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X github.com/peak/s5cmd/v2/version.Version={{version}}',
        '-X github.com/peak/s5cmd/v2/version.GitCommit=$(git rev-parse --short HEAD || echo)',
      ],
      linux: {
        GO_LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
