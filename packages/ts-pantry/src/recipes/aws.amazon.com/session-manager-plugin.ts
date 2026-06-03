import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "aws.amazon.com/session-manager-plugin",
  name: "session-manager-plugin",
  programs: [
    "session-manager-plugin",
  ],
  buildDependencies: {
    'go.dev': 1.23,
    'gnu.org/make': "*",
  },
  distributable: {
    url: "https://github.com/aws/session-manager-plugin/archive/{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "echo \"{{version}}\" > VERSION\nsed -i -e 's/1.2+.0.0/{{version.raw}}/g' src/version/version.go",
        if: "<1.2.804",
      },
      "make GO_BUILD=\"go build\" build-${PLATFORM}",
      "mkdir -p \"{{ prefix }}\"/bin",
      "mv ./bin/${BIN_DIR}/session-manager-plugin \"{{prefix}}\"/bin/",
    ],
    env: {
      CGO_ENABLED: 0,
      'darwin/aarch64': {
        PLATFORM: "darwin-arm64",
        BIN_DIR: "darwin_arm64_plugin",
      },
      'darwin/x86-64': {
        PLATFORM: "darwin-amd64",
        BIN_DIR: "darwin_amd64_plugin",
      },
      'linux/aarch64': {
        PLATFORM: "arm64",
        BIN_DIR: "linux_arm64_plugin",
      },
      'linux/x86-64': {
        PLATFORM: "linux-amd64",
        BIN_DIR: "linux_amd64_plugin",
      },
    },
  },
  test: {
    script: [
      "semverator satisfies \">={{version.raw}}\" \"$(session-manager-plugin --version)\"",
      "session-manager-plugin",
    ],
  },
}
