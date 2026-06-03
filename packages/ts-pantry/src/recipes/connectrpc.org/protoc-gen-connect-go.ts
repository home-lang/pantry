import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'connectrpc.org/protoc-gen-connect-go',
  name: 'protoc-gen-connect-go',
  programs: [
    'protoc-gen-connect-go',
  ],
  buildDependencies: {
    'go.dev': '^1.20',
  },
  distributable: {
    url: 'https://github.com/connectrpc/connect-go/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'mkdir -p {{ prefix }}/bin',
      'go build -v -trimpath -ldflags="$LDFLAGS" -o $BUILDLOC ./cmd/protoc-gen-connect-go',
    ],
    env: {
      GO111MODULE: 'on',
      CGO_ENABLED: 0,
      BUILDLOC: '{{prefix}}/bin/protoc-gen-connect-go',
      LDFLAGS: [
        '-s',
        '-w',
        '-X main.version={{version}}',
        '-X main.debugMode=false',
      ],
      linux: {
        LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
