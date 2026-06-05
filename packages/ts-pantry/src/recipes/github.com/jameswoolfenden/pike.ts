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
    // Pin the git checkout to the release tag. Without it the clone builds
    // from default-branch HEAD instead of the requested version. There is no
    // `set-version.sh` in the tree — the version is injected purely via the
    // `-X .../src.Version=v{{version}}` ldflag (matching upstream goreleaser).
    url: 'git+https://github.com/JamesWoolfenden/pike',
    ref: 'v{{version}}',
  } as Recipe['distributable'] & { ref: string },
  build: {
    script: [
      'go mod download',
      'go build -v -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/pike main.go',
    ],
    env: {
      CGO_ENABLED: '0',
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
