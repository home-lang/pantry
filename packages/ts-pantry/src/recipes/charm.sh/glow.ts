import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'charm.sh/glow',
  name: 'glow',
  programs: [
    'glow',
  ],
  buildDependencies: {
    'go.dev': '^1.18',
  },
  distributable: {
    url: 'https://github.com/charmbracelet/glow/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'go build -v -ldflags="$LDFLAGS"',
      'mkdir -p "{{ prefix }}"/bin',
      'mv glow "{{ prefix }}"/bin',
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
