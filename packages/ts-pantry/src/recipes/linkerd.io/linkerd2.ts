import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'linkerd.io/linkerd2',
  name: 'linkerd2',
  programs: [
    'linkerd',
  ],
  buildDependencies: {
    'go.dev': '^1.21',
    'git-scm.org': '*',
  },
  distributable: {
    url: 'git+https://github.com/linkerd/linkerd2',
  },
  build: {
    script: [
      'go mod tidy',
      './bin/build-cli-bin',
      'mkdir -p "{{ prefix }}"/bin',
      'mv target/cli/$PLATFORM/linkerd "{{ prefix }}"/bin',
    ],
    env: {
      CGO_ENABLED: '0',
      CI_FORCE_CLEAN: '1',
      darwin: {
        PLATFORM: 'darwin',
      },
      'linux/aarch64': {
        PLATFORM: 'linux-arm64',
      },
      'linux/x86-64': {
        PLATFORM: 'linux-amd64',
      },
    },
  },
  test: {
    script: [
      'test "$(linkerd version --client)" = "Client version: stable-{{version}}"',
      'linkerd install --ignore-cluster --crds > crds.yml',
      'test -f crds.yml',
      'linkerd install --ignore-cluster > linkerd.yml',
      'test -f linkerd.yml',
    ],
  },
}
