import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'juju.is',
  name: 'juju',
  description: 'Orchestration engine that enables the deployment, integration and lifecycle management of applications at any scale, on any infrastructure (Kubernetes or otherwise).',
  homepage: 'https://juju.is/',
  github: 'https://github.com/juju/juju',
  programs: ['juju'],
  versionSource: {
    type: 'github-releases',
    repo: 'juju/juju',
  },
  distributable: {
    url: 'https://github.com/juju/juju/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '*',
  },

  build: {
    script: [
      'go build -v -ldflags="${GO_LDFLAGS}" -o "{{ prefix }}"/bin/juju ./cmd/juju/main.go',
    ],
    env: {
      'CGO_ENABLED': '0',
      'GO_LDFLAGS': ['-s', '-w'],
    },
  },
}
