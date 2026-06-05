import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/github/git-sizer',
  name: 'git-sizer',
  programs: [
    'git-sizer',
  ],
  buildDependencies: {
    'go.dev': '^1.17',
  },
  distributable: {
    url: 'https://github.com/github/git-sizer/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'mkdir -p "{{ prefix }}"/bin',
      'go build -v -trimpath -ldflags="$LDFLAGS" -o $BUILDLOC .',
    ],
    env: {
      GOPROXY: 'https://proxy.golang.org,direct',
      GOSUMDB: 'sum.golang.org',
      GO111MODULE: 'on',
      CGO_ENABLED: '0',
      BUILDLOC: '{{prefix}}/bin/git-sizer',
      LDFLAGS: [
        '-s',
        '-w',
        '-X main.ReleaseVersion={{version}}',
      ],
      linux: {
        LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
  test: {
    script: [
      'test "$(git-sizer --version)" = "git-sizer release {{version}}"',
    ],
  },
}
