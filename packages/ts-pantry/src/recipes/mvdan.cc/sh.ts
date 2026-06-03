import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "mvdan.cc/sh",
  name: "sh",
  programs: [
    "shfmt",
  ],
  buildDependencies: {
    'go.dev': "^1.26.1",
    'git-scm.org': "*",
  },
  distributable: {
    url: "https://github.com/mvdan/sh/archive/refs/tags/{{ version.tag }}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "git config --global user.email \"builder@pkgx.dev\"\ngit config --global user.name \"pkgx\"\ngit init\ngit add .\ngit commit -m v{{version}}\ngit tag v{{version}}",
        if: ">=3.13.0",
      },
      "go mod download",
      "go build -v -trimpath -ldflags=\"$GO_LDFLAGS\" -o '{{prefix}}/bin/shfmt' ./cmd/shfmt",
    ],
    env: {
      GO_LDFLAGS: [
        "-s",
        "-w",
        "-X main.version=v{{version}}",
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
      "test \"$(shfmt --version)\" = \"v{{version}}\"",
      "test \"$(echo 'echo \"hello world\"; echo 42' | shfmt)\" = \"$(cat $FIXTURE)\"",
    ],
  },
}
