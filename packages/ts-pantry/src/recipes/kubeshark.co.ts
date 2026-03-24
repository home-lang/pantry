import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'kubeshark.co',
  name: 'kubeshark',
  description: 'The API traffic analyzer for Kubernetes providing real-time K8s protocol-level visibility, capturing and monitoring all traffic and payloads going in, out and across containers, pods, nodes and clusters. Inspired by Wireshark, purposely built for Kubernetes',
  homepage: 'https://www.kubeshark.co/',
  github: 'https://github.com/kubeshark/kubeshark',
  programs: ['kubeshark'],
  versionSource: {
    type: 'github-releases',
    repo: 'kubeshark/kubeshark',
    tagPattern: /\/^v\//,
  },
  distributable: {
    url: 'git+https://github.com/kubeshark/kubeshark',
  },
  buildDependencies: {
    'go.dev': '^1.19',
    'gnu.org/make': '*',
    'git-scm.org': '*',
  },

  build: {
    script: [
      'make build',
      'mkdir -p "{{ prefix }}"/bin',
      'mv bin/kubeshark_$PLATFORM "{{ prefix }}"/bin/kubeshark',
      '',
    ],
    env: {
      'VER': '{{version}}',
    },
  },
}
