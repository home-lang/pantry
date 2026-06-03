import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "mergestat.com/mergestat-lite",
  name: "mergestat-lite",
  programs: [
    "mergestat",
  ],
  buildDependencies: {
    'go.dev': "^1.19",
    'cmake.org': "*",
    'git-scm.org': "*",
    'libgit2.org': "~1.7",
    'openssl.org': "*",
    'freedesktop.org/pkg-config': "*",
    'python.org': "^3",
  },
  distributable: {
    url: "git+https://github.com/mergestat/mergestat-lite",
    stripComponents: 1,
  },
  build: {
    script: [
      "git submodule update --init --recursive",
      {
        run: "sed -i.bak -e 's/@go build -o $@ -tags=\"static\"/@go build -o $@ -tags=\"static\" -buildmode=pie/' Makefile\nrm Makefile.bak\n",
        if: "linux",
      },
      "make libgit2 all",
      "mkdir -p \{{ prefix }}\/bin",
      "mv .build/mergestat {{prefix}}/bin/mergestat",
    ],
    env: {
      GOPROXY: "https://proxy.golang.org,direct",
      GOSUMDB: "sum.golang.org",
      GO111MODULE: "on",
    },
  },
  test: {
    script: [
      "git clone https://github.com/kelseyhightower/nocode",
      "mergestat summarize commits --json",
    ],
  },
}
