import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'google.com/protobuf-go',
  name: 'protobuf-go',
  programs: [
    'protoc-gen-go',
  ],
  buildDependencies: {
    'go.dev': '^1.17',
  },
  distributable: {
    url: 'https://github.com/protocolbuffers/protobuf-go/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o $BUILDLOC ./cmd/protoc-gen-go',
    ],
    env: {
      BUILDLOC: '{{prefix}}/bin/protoc-gen-go',
      GO_LDFLAGS: [
        '-s',
        '-w',
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
      'cp $FIXTURE test.proto',
      'protoc test.proto --go_out=.',
      'grep \'package test\' test/test.pb.go',
    ],
  },
}
