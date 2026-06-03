import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "docker.com/machine",
  name: "machine",
  programs: [
    "docker-machine",
  ],
  buildDependencies: {
    'gnu.org/automake': "*",
    'go.dev': "*",
    linux: {
      'curl.se': "*",
    },
  },
  distributable: {
    url: "https://gitlab.com/gitlab-org/ci-cd/docker-machine/-/archive/v{{version}}-gitlab.22/docker-machine-v{{version}}-gitlab.22.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "curl -L \"$URL\" | tar -xz --strip-components=1",
      {
        run: "sed -i.bak 's|GO_LDFLAGS :=|GO_LDFLAGS := -buildmode=pie|g' mk/main.mk\nrm mk/*.bak\n",
        if: "linux",
      },
      "make build",
    ],
    env: {
      URL: "https://gitlab.com/gitlab-org/ci-cd/docker-machine/-/archive/v{{version}}-gitlab.22/docker-machine-v{{version}}-gitlab.22.tar.gz",
      GOPATH: "$SRCROOT",
      GO111MODULE: "auto",
    },
  },
  test: {
    script: [
      "docker-machine --version | grep {{version}}",
    ],
  },
}
