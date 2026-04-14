import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'helm.sh',
  name: 'helm',
  description: 'The Kubernetes Package Manager',
  homepage: 'https://helm.sh/',
  github: 'https://github.com/helm/helm',
  programs: ['helm'],
  versionSource: {
    type: 'github-releases',
    repo: 'helm/helm',
  },
  distributable: {
    url: 'https://github.com/helm/helm/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.19',
  },

  build: {
    script: [
      'sed -i -f $PROP Makefile',
      'mkdir -p "{{prefix}}/bin"',
      'make install VERSION=v{{version}} INSTALL_PATH="{{prefix}}/bin"',
    ],
  },
}
