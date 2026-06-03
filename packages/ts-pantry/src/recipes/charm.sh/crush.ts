import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'charm.sh/crush',
  name: 'crush',
  programs: [
    'crush',
  ],
  buildDependencies: {
    'go.dev': '=1.25.5',
  },
  distributable: {
    url: 'https://github.com/charmbracelet/crush/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'go build -v -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/crush .',
    ],
    env: {
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X github.com/charmbracelet/crush/internal/version.Version={{version}}',
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
      'crush --version | tee out',
      'grep \'crush version {{version}}\' out',
    ],
  },
}
