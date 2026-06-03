import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "github.com/containers/gvisor-tap-vsock",
  name: "gvisor-tap-vsock",
  programs: [
    "gvproxy",
    "qemu-wrapper",
  ],
  buildDependencies: {
    'go.dev': "^1.18",
  },
  distributable: {
    url: "https://github.com/containers/gvisor-tap-vsock/archive/refs/tags/v{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "sed -i.bak 's/go build/go build -buildmode=pie/g' Makefile\nrm Makefile.bak\n",
        if: "linux",
      },
      "make --jobs {{ hw.concurrency }}",
      "mkdir -p \"{{ prefix }}\"",
      "cp -a bin \"{{ prefix }}\"",
    ],
  },
  test: {
    script: [
      "gvproxy -help",
      "gvproxy -help 2>&1 | grep \"Usage of gvproxy:\"",
    ],
  },
}
