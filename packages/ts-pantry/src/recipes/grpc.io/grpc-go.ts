import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'grpc.io/grpc-go',
  name: 'grpc-go',
  programs: [
    'protoc-gen-go-grpc',
  ],
  dependencies: {
    'google.com/protobuf-go': '^1',
  },
  buildDependencies: {
    'go.dev': '^1.19',
  },
  distributable: {
    url: 'https://github.com/grpc/grpc-go/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o $BUILDLOC .',
    ],
    env: {
      BUILDLOC: '{{prefix}}/bin/protoc-gen-go-grpc',
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
      'protoc --go_out=. --go-grpc_out=. test.proto',
      'grep \'package test\' test/test_grpc.pb.go',
    ],
  },
}
