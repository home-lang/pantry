import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/dundee/gdu',
  name: 'gdu',
  programs: [
    'gdu',
  ],
  buildDependencies: {
    'go.dev': '*',
  },
  distributable: {
    url: 'https://github.com/dundee/gdu/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -v -ldflags="${GO_LDFLAGS}" -o "{{ prefix }}"/bin/gdu ./cmd/gdu',
    ],
    env: {
      CGO_ENABLED: 0,
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X github.com/dundee/gdu/v{{version.major}}/build.Version="{{version}}"',
        '-X github.com/dundee/gdu/v{{version.major}}/build.Time="$(date +\'%Y-%m-%d\')"',
        '-X github.com/dundee/gdu/v{{version.major}}/build.User="pkgx"',
      ],
      linux: {
        GO_LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
