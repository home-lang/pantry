import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/alexellis/k3sup',
  name: 'k3sup',
  programs: [
    'k3sup',
  ],
  buildDependencies: {
    'go.dev': '^1.20',
  },
  distributable: {
    url: 'https://github.com/alexellis/k3sup/archive/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -v -ldflags="${LDFLAGS}" -o "{{ prefix }}"/bin/k3sup',
    ],
    env: {
      CGO_ENABLED: 0,
      LDFLAGS: [
        '-s',
        '-w',
        '-X github.com/alexellis/k3sup/cmd.Version={{ version }}',
        '-X github.com/alexellis/k3sup/cmd.GitCommit=$( git rev-parse HEAD )',
      ],
      linux: {
        LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
