import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/chrusty/protoc-gen-jsonschema",
  name: "protoc-gen-jsonschema",
  programs: [
    "protoc-gen-jsonschema",
  ],
  dependencies: {
    'protobuf.dev': "*",
  },
  buildDependencies: {
    'go.dev': "^1.11",
  },
  distributable: {
    url: "https://github.com/chrusty/protoc-gen-jsonschema/archive/refs/tags/{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "sed -i.bak -e's/const version =.*/const version = \"v{{version}}\"/' main.go\nrm main.go.bak\n",
        'working-directory': "cmd/protoc-gen-jsonschema",
      },
      "go build -ldflags=\"$LDFLAGS\" -o \{{prefix}}/bin/protoc-gen-jsonschema\ cmd/protoc-gen-jsonschema/main.go",
      "mkdir -p \{{prefix}}/share\",
      "cp -a internal/converter/testdata \{{prefix}}/share/\",
    ],
    env: {
      LDFLAGS: [
        "-s",
        "-w",
      ],
      linux: {
        LDFLAGS: [
          "-buildmode=pie",
        ],
      },
    },
  },
  test: {
    script: [
      "test \"$(protoc-gen-jsonschema -version)\" = \"v{{version}}\"",
      "protoc --jsonschema_out=. --proto_path=\{{prefix}}\/share/testdata/proto \{{prefix}}\/share/testdata/proto/ArrayOfPrimitives.proto",
      "test \"$(shasum ArrayOfPrimitives.json)\" = \"1ad855b587988fc0b5d672de7e7146e04ff7d3e4  ArrayOfPrimitives.json\"",
    ],
  },
}
