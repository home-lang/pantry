import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'k3d.io',
  name: 'k3d',
  description: 'Little helper to run CNCF-certified Kubernetes clusters in Docker',
  homepage: 'https://k3d.io',
  github: 'https://github.com/k3d-io/k3d',
  programs: ['k3d'],
  versionSource: {
    type: 'github-releases',
    repo: 'k3d-io/k3d',
  },
  distributable: {
    url: 'https://github.com/k3d-io/k3d/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.18',
  },

  build: {
    script: [
      'make build BINDIR={{prefix}}/bin GIT_TAG_OVERRIDE={{version}}',
      '',
    ],
  },
}
