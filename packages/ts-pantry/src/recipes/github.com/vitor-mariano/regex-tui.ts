import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/vitor-mariano/regex-tui',
  name: 'regex-tui',
  programs: [],
  buildDependencies: {
    'go.dev': '=1.25.1',
  },
  distributable: {
    url: 'https://github.com/vitor-mariano/regex-tui/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'go build -v -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/regex-tui .',
    ],
    env: {
      GO_LDFLAGS: [
        '-s',
        '-w',
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
      'regex-tui --help 2>&1 | tee out',
      'grep \'Usage of regex-tui\' out',
      'grep \'regexp2\' out',
    ],
  },
}
