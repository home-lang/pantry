import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'krew.sigs.k8s.io',
  name: 'kubectl-krew',
  description: '📦 Find and install kubectl plugins',
  homepage: 'https://sigs.k8s.io/krew/',
  github: 'https://github.com/kubernetes-sigs/krew',
  programs: ['kubectl-krew'],
  versionSource: {
    type: 'github-releases',
    repo: 'kubernetes-sigs/krew',
  },
  distributable: {
    url: 'git+https://github.com/kubernetes-sigs/krew',
  },
  dependencies: {
    'git-scm.org': '*',
  },
  buildDependencies: {
    'go.dev': '^1.21',
  },

  build: {
    script: [
      'export KREW_ROOT=$(pwd)/.krew',
      'export PATH=${PATH}:${KREW_ROOT}/bin',
      'go build \\',
      '  -tags netgo \\',
      '  -mod readonly \\',
      '  -ldflags "-w \\',
      '            -X sigs.k8s.io/krew/internal/version.gitCommit=$(git rev-parse --short HEAD) \\',
      '            -X sigs.k8s.io/krew/internal/version.gitTag={{version}}" \\',
      '  -o "{{prefix}}/bin/kubectl-krew" \\',
      '  ./cmd/krew',
      '',
    ],
    env: {
      'CGO_ENABLED': '0',
    },
  },
}
