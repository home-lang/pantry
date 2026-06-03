import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/bazelbuild/buildtools",
  name: "buildtools",
  programs: [
    "buildifier",
    "buildozer",
    "unused_deps",
  ],
  buildDependencies: {
    'go.dev': "^1.19",
  },
  distributable: {
    url: "https://github.com/bazelbuild/buildtools/archive/refs/tags/v{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "go mod download",
      "go build -ldflags \"$LDFLAGS\" -o {{prefix}}/bin/buildifier ./buildifier",
      "go build -ldflags \"$LDFLAGS\" -o {{prefix}}/bin/buildozer ./buildozer",
      "go build -ldflags \"$LDFLAGS\" -o {{prefix}}/bin/unused_deps ./unused_deps",
    ],
    env: {
      LDFLAGS: [
        "-s",
        "-w",
        "-X main.buildVersion={{version}}",
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
      "buildifier -version | grep {{version}}",
      "buildozer -version | grep {{version}}",
      "unused_deps -version | grep {{version}}",
      "echo 'cc_library(name = \"foo\",srcs=[\"foo.cc\"])' > BUILD",
      "buildifier BUILD",
      "diff -u <(echo 'cc_library(\n    name = \"foo\",\n    srcs = [\"foo.cc\"],\n)' ) BUILD\n",
      "buildozer 'add deps //base' //:foo",
      "diff -u <(echo 'cc_library(\n    name = \"foo\",\n    srcs = [\"foo.cc\"],\n    deps = [\"//base\"],\n)' ) BUILD\n",
    ],
  },
}
