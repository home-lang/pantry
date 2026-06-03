import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'sigstore.dev/cosign',
  name: 'cosign',
  programs: [
    'cosign',
  ],
  buildDependencies: {
    'go.dev': '~1.24.3',
  },
  distributable: {
    url: 'git+https://github.com/sigstore/cosign.git',
  },
  build: {
    script: [
      'go mod download',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/cosign ./cmd/cosign',
    ],
    env: {
      GO111MODULE: 'on',
      CGO_ENABLED: 0,
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X sigs.k8s.io/release-utils/version.gitVersion=v{{version}}',
        '-X sigs.k8s.io/release-utils/version.gitCommit=pkgx',
        '-X sigs.k8s.io/release-utils/version.gitTreeState=clean',
        '-X sigs.k8s.io/release-utils/version.buildDate=$(date -u +\'%Y-%m-%dT%H:%M:%SZ\')',
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
      'cosign version',
      'cosign version 2>&1 | grep {{version}}',
    ],
  },
}
