import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'kubernetes.io/kubectl',
  name: 'kubectl',
  programs: [
    'kubectl',
  ],
  buildDependencies: {
    'go.dev': '~1.25.0',
    'gnu.org/coreutils': '^9.1.0',
    'gnu.org/bash': '^5.1',
    'rsync.samba.org': '*',
    'curl.se': '*',
  },
  distributable: {
    url: 'https://github.com/kubernetes/kubernetes/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make WHAT=cmd/kubectl',
      'mkdir -p "{{ prefix }}"/bin',
      'mv _output/bin/kubectl "{{ prefix }}"/bin',
    ],
  },
  test: {
    script: [
      'kubectl | grep "kubectl controls the Kubernetes cluster manager."',
      'echo $(kubectl version || true) | grep "v{{version}}"',
    ],
  },
}
