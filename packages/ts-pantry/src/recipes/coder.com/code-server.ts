import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "coder.com/code-server",
  name: "code-server",
  programs: [
    "code-server",
  ],
  github: "https://github.com/coder/code-server",
  versionSource: {
    type: "github-releases",
    repo: "coder/code-server",
    tagPattern: /^v(.+)$/,
  },
  distributable: undefined,
  build: {
    script: [
      "curl -L \"$DIST_URL\" -o code-server.tar.gz",
      "tar xzf code-server.tar.gz --strip-components=1 -C \"{{prefix}}\"",
    ],
    env: {
      "linux/x86-64": {
        DIST_URL: "https://github.com/coder/code-server/releases/download/v{{version}}/code-server-{{version}}-linux-amd64.tar.gz",
      },
      "linux/aarch64": {
        DIST_URL: "https://github.com/coder/code-server/releases/download/v{{version}}/code-server-{{version}}-linux-arm64.tar.gz",
      },
      "darwin/x86-64": {
        DIST_URL: "https://github.com/coder/code-server/releases/download/v{{version}}/code-server-{{version}}-macos-amd64.tar.gz",
      },
      "darwin/aarch64": {
        DIST_URL: "https://github.com/coder/code-server/releases/download/v{{version}}/code-server-{{version}}-macos-arm64.tar.gz",
      },
    },
    skip: ['verify-foreign-artifact'],
  },
  test: {
    script: [
      "code-server --version | grep {{version}}",
    ],
  },
}
