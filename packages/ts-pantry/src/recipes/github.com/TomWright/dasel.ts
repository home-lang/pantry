import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/TomWright/dasel",
  name: "dasel",
  programs: [
    "dasel",
  ],
  buildDependencies: {
    'go.dev': "^1",
  },
  distributable: {
    url: "https://github.com/TomWright/dasel/archive/refs/tags/{{version.tag}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      // The CLI main package lives in ./cmd/dasel (root is the library package in
      // both v2 and v3); `go install` with no path built the library → no binary.
      "go install -ldflags=\"$GO_LDFLAGS\" ./cmd/dasel",
    ],
    env: {
      GOBIN: "{{prefix}}/bin",
      GO_LDFLAGS: [
        "-X 'github.com/tomwright/dasel/v2/internal.Version={{version}}'",
        "-X 'github.com/tomwright/dasel/v3/internal.Version={{version}}'",
      ],
      linux: {
        GO_LDFLAGS: [
          "-buildmode=pie",
        ],
      },
    },
  },
  test: {
    script: [
      "test \"$(dasel --version)\" = \"dasel version {{version}}\"\nEXEC=\"-r json\"",
      "test \"$(dasel version)\" = {{version}}\nEXEC=\"query\"",
      "test \"$(cat $FIXTURE | dasel $EXEC 'hello.world')\" = '\"Hello, World!\"'",
    ],
  },
}
