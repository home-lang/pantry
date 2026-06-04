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
    // docker-machine is a GOPATH-era project; its sources import
    // github.com/docker/machine/... so the tree must live under
    // $GOPATH/src/github.com/docker/machine (GO111MODULE=auto + no go.mod).
    script: [
      "mkdir -p src/github.com/docker/machine",
      {
        run: "curl -L \"$URL\" | tar -xz --strip-components=1",
        'working-directory': "src/github.com/docker/machine",
      },
      {
        run: "sed -i.bak 's|GO_LDFLAGS :=|GO_LDFLAGS := -buildmode=pie|g' mk/main.mk\nrm mk/*.bak\n",
        'working-directory': "src/github.com/docker/machine",
        if: "linux",
      },
      {
        run: "make build",
        'working-directory': "src/github.com/docker/machine",
      },
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
