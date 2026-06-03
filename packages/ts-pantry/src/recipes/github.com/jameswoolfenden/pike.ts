import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/jameswoolfenden/pike',
  name: 'pike',
  programs: [
    'pike',
  ],
  buildDependencies: {
    'go.dev': '^1.22',
    'git-scm.org': '*',
  },
  distributable: {
    url: 'git+https://github.com/JamesWoolfenden/pike',
  },
  build: {
    script: [
      {
        run: './set-version.sh',
        if: '<0.4.7',
      },
      'go mod download',
      'go build -v -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/pike main.go',
    ],
    env: {
      CGO_ENABLED: 0,
      GO_LDFLAGS: [
        '-extldflags=-static',
        '-w',
        '-s',
        '-X github.com/jameswoolfenden/pike/src.Version=v{{version}}',
      ],
    },
  },
  test: {
    script: [
      'test "$(pike --version)" = "pike version v{{version}}"',
      'pike scan -d .',
    ],
  },
}
