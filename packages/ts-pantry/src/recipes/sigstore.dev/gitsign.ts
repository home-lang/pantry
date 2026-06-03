import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'sigstore.dev/gitsign',
  name: 'gitsign',
  programs: [
    'gitsign',
    'gitsign-credential-cache',
  ],
  dependencies: {
    'git-scm.org': '*',
  },
  buildDependencies: {
    'go.dev': '~1.23.4',
  },
  distributable: {
    url: 'https://github.com/sigstore/gitsign/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o "{{prefix}}"/bin/gitsign',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o "{{prefix}}"/bin/gitsign-credential-cache ./cmd/gitsign-credential-cache',
    ],
    env: {
      GOPROXY: 'https://proxy.golang.org,direct',
      GOSUMDB: 'sum.golang.org',
      GO111MODULE: 'on',
      CGO_ENABLED: 0,
      GO_LDFLAGS: [
        '-buildid=',
        '-X github.com/sigstore/gitsign/pkg/version.gitVersion={{version}}',
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
      'gitsign version',
      'gitsign version | grep {{version}}',
      'gitsign-credential-cache --version | grep {{version}}',
    ],
  },
}
