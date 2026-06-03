import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'charm.sh/mods',
  name: 'mods',
  programs: [
    'mods',
  ],
  buildDependencies: {
    'go.dev': '~1.24.0',
  },
  distributable: {
    url: 'https://github.com/charmbracelet/mods/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'go build -v -ldflags="$GO_LDFLAGS"',
      'mkdir -p "{{ prefix }}"/bin',
      'mv mods "{{ prefix }}"/bin',
    ],
    env: {
      GO111MODULE: 'on',
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X=main.Version={{version}}',
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
      'mkdir -p "$DB_PATH"',
      'mods --version',
    ],
  },
}
