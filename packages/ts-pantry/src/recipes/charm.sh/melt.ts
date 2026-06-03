import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'charm.sh/melt',
  name: 'melt',
  programs: [
    'melt',
  ],
  buildDependencies: {
    'go.dev': '^1.18',
  },
  distributable: {
    url: 'https://github.com/charmbracelet/melt/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'go build -v -ldflags="$LDFLAGS" ./cmd/melt',
      'mkdir -p "{{ prefix }}"/bin',
      'mv melt "{{ prefix }}"/bin',
    ],
    env: {
      GO111MODULE: 'on',
      LDFLAGS: [
        '-s',
        '-w',
        '-X=main.Version={{version}}',
      ],
      linux: {
        LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
