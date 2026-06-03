import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "gitlab.com/gitlab-org/cli",
  name: "cli",
  programs: [
    "glab",
  ],
  buildDependencies: {
    'go.dev': "^1.18",
  },
  distributable: {
    url: "https://gitlab.com/gitlab-org/cli/-/archive/v{{version}}/cli-v{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "go mod download",
      "go build -v -trimpath -ldflags=\"$GO_LDFLAGS\" -o '{{prefix}}/bin/glab' ./cmd/glab",
    ],
    env: {
      GO111MODULE: "on",
      GO_LDFLAGS: [
        "-s",
        "-w",
        "-X main.version={{version}}",
        "-X main.buildDate=$(date -u +'%Y-%m-%dT%H:%M:%SZ')",
        "-X main.debugMode=false",
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
      "glab --version",
      "glab --version | grep -E \"glab.*{{version}}\"",
      "git clone https://gitlab.com/cli-automated-testing/homebrew-testing.git",
      "glab repo contributors | grep \"Matt Nohr\"\nglab issue list --all | grep \"This is a test issue\"",
    ],
  },
}
