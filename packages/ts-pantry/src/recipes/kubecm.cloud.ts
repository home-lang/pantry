import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'kubecm.cloud',
  name: 'kubecm',
  description: 'Manage your kubeconfig more easily.',
  homepage: 'https://kubecm.cloud',
  github: 'https://github.com/sunny0826/kubecm',
  programs: ['kubecm'],
  versionSource: {
    type: 'github-releases',
    repo: 'sunny0826/kubecm',
  },
  distributable: {
    url: 'https://github.com/sunny0826/kubecm/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.22',
  },

  build: {
    script: [
      'make build  BUILD_TARGET_PKG_DIR="{{ prefix }}/bin" TAG={{ version }} KUBECM_VERSION={{ version }}',
    ],
    env: {
      'CGO_ENABLED': '0',
    },
  },
}
