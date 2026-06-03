import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "kubernetes.io/minikube",
  name: "minikube",
  programs: [
    "minikube",
  ],
  dependencies: {
    'kubernetes.io/kubectl': "*",
  },
  buildDependencies: {
    'go.dev': "^1.19",
    'github.com/kevinburke/go-bindata': "*",
  },
  distributable: {
    url: "https://github.com/kubernetes/minikube/archive/refs/tags/v{{version}}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "sed -E -i.bak -e's/(_LDFLAGS := \"?)/\\1-buildmode=pie /' Makefile\nrm Makefile.bak\n",
        if: "linux",
      },
      "make",
      "mkdir -p \"{{ prefix }}\"/bin",
      "mv out/minikube \"{{ prefix }}\"/bin",
    ],
  },
  test: {
    script: [
      "minikube version",
    ],
  },
}
