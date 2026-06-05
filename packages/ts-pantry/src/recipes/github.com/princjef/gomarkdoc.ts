import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/princjef/gomarkdoc',
  name: 'gomarkdoc',
  programs: [
    'gomarkdoc',
  ],
  buildDependencies: {
    'go.dev': '^1.18',
  },
  distributable: {
    url: 'https://github.com/princjef/gomarkdoc/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'go build -ldflags="$LDFLAGS" -o gomarkdoc ./cmd/gomarkdoc',
      'mkdir -p "{{ prefix }}"/bin',
      'mv gomarkdoc "{{ prefix }}"/bin',
    ],
    env: {
      CGO_ENABLED: '0',
      LDFLAGS: [
        '-extldflags=-static',
        '-w',
        '-s',
        '-X=main.version=v{{version}}',
      ],
    },
  },
  test: {
    script: [
      'test "$(gomarkdoc --version)" = "v{{version}}"',
      'gomarkdoc -o example.md',
      'test -f example.md',
    ],
  },
}
