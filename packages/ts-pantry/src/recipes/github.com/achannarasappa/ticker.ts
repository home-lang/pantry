import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/achannarasappa/ticker',
  name: 'ticker',
  programs: [
    'ticker',
  ],
  buildDependencies: {
    'go.dev': '~1.22.0',
  },
  distributable: {
    url: 'https://github.com/achannarasappa/ticker/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -v -ldflags="${GO_LDFLAGS}" -o "{{ prefix }}"/bin/ticker .',
    ],
    env: {
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X github.com/achannarasappa/ticker/cmd.Version={{version}}',
        '-X github.com/achannarasappa/ticker/v4/cmd.Version={{version}}',
        '-X github.com/achannarasappa/ticker/v5/cmd.Version={{version}}',
      ],
      linux: {
        GO_LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
