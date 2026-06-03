import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'earthly.dev/earthly',
  name: 'earthly',
  programs: [
    'earthly',
  ],
  buildDependencies: {
    'go.dev': '*',
  },
  distributable: {
    url: 'https://github.com/earthly/earthly/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -v -ldflags="${GO_LDFLAGS}" -o "{{ prefix }}"/bin/earthly ./cmd/earthly',
    ],
    env: {
      CGO_ENABLED: 0,
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X main.Version="{{ version }}"',
        '-X main.GitSha="$( git rev-parse HEAD )"',
        '-X main.BuiltBy="pkgx"',
        '-X main.DefaultInstallationName="earthly"',
      ],
      linux: {
        GO_LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
