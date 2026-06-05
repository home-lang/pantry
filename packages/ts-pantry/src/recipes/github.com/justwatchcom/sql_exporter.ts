import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/justwatchcom/sql_exporter',
  name: 'sql_exporter',
  programs: [
    'sql_exporter',
  ],
  buildDependencies: {
    'git-scm.org': '*',
    'go.dev': '^1.21',
  },
  distributable: {
    url: 'https://github.com/justwatchcom/sql_exporter/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -v -ldflags="${LDFLAGS}" -o {{prefix}}/bin/sql_exporter',
    ],
    env: {
      CGO_ENABLED: '0',
      LDFLAGS: [
        '-s',
        '-w',
        '-X github.com/prometheus/common/version.Version={{version}}',
        '-X github.com/prometheus/common/version.Branch="$( git branch --show-current )"',
        '-X github.com/prometheus/common/version.BuildUser="${USER}"',
        '-X github.com/prometheus/common/version.BuildDate="$(date +%Y-%m-%d %H:%M:%S)"',
      ],
      linux: {
        LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
