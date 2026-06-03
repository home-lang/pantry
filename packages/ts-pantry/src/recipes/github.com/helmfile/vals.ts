import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/helmfile/vals',
  name: 'vals',
  programs: [
    'vals',
  ],
  buildDependencies: {
    'go.dev': '*',
  },
  distributable: {
    url: 'https://github.com/helmfile/vals/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o "{{ prefix }}"/bin/vals ./cmd/vals',
    ],
    env: {
      GO_LDFLAGS: [
        '-w',
        '-s',
        '-X main.version=v{{version}}',
      ],
      linux: {
        GO_LDFLAGS: [
          '-buildmode=pie',
          '-extldflags=-lm',
        ],
      },
    },
  },
  test: {
    script: [
      'vals --help 2>&1 | grep "vals is a Helm-like configuration"',
      'echo $(vals version || true) | grep "v{{version}}" || \\ vals --help 2>&1 | grep -v "Print vals version"',
    ],
  },
}
