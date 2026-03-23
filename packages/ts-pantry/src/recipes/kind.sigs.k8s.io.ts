import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'kind.sigs.k8s.io',
  name: 'kind',
  description: 'Kubernetes IN Docker - local clusters for testing Kubernetes',
  homepage: 'https://kind.sigs.k8s.io/',
  github: 'https://github.com/kubernetes-sigs/kind',
  programs: ['kind'],
  versionSource: {
    type: 'github-releases',
    repo: 'kubernetes-sigs/kind',
  },
  distributable: {
    url: 'https://github.com/kubernetes-sigs/kind/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.18',
  },

  build: {
    script: [
      'go mod download',
      'go build $GOFLAGS -o {{prefix}}/bin/kind ./cmd/kind',
    ],
  },
}
