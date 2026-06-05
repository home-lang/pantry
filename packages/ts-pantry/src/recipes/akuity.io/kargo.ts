import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'akuity.io/kargo',
  name: 'kargo',
  programs: [
    'kargo',
  ],
  buildDependencies: {
    'go.dev': '^1.19',
    'linux/aarch64': {
      'gnu.org/gcc': '14',
      'gnu.org/binutils': '~2.44',
    },
  },
  distributable: {
    url: 'https://github.com/akuity/kargo/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/kargo ./cmd/cli',
    ],
    env: {
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X github.com/akuity/kargo/internal/version.version={{version}}',
        '-X github.com/akuity/kargo/internal/version.buildDate=$(date -u +\'%Y-%m-%dT%H:%M:%SZ\')',
        '-X github.com/akuity/kargo/internal/version.gitCommit=pkgx',
        '-X github.com/akuity/kargo/internal/version.gitTreeState=clean',
        '-X github.com/akuity/kargo/pkg/x/version.version={{version}}',
        '-X github.com/akuity/kargo/pkg/x/version.buildDate=$(date -u +\'%Y-%m-%dT%H:%M:%SZ\')',
        '-X github.com/akuity/kargo/pkg/x/version.gitCommit=pkgx',
        '-X github.com/akuity/kargo/pkg/x/version.gitTreeState=clean',
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
      'kargo version',
      'test "$(kargo version)" = "Client Version: {{version}}"',
    ],
  },
}
