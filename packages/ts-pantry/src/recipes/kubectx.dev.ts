import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'kubectx.dev',
  name: 'kube',
  description: 'Tool that can switch between kubectl contexts easily and create aliases',
  homepage: 'https://kubectx.dev',
  github: 'https://github.com/ahmetb/kubectx',
  programs: ['kubectx', 'kubens'],
  versionSource: {
    type: 'github-releases',
    repo: 'ahmetb/kubectx',
  },
  distributable: {
    url: 'git+https://github.com/ahmetb/kubectx.git',
  },
  dependencies: {
    'github.com/junegunn/fzf': '*',
  },
  buildDependencies: {
    'go.dev': '^1.20',
  },

  build: {
    script: [
      'go build -o \'{{ prefix }}/bin/kubectx\' ./cmd/kubectx',
      'go build -o \'{{ prefix }}/bin/kubens\' ./cmd/kubens',
    ],
    env: {
      'CGO_ENABLED': '0',
    },
  },
}
