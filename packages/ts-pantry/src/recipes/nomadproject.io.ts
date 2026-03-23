import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'nomadproject.io',
  name: 'nomad',
  description: 'Nomad is an easy-to-use, flexible, and performant workload orchestrator that can deploy a mix of microservice, batch, containerized, and non-containerized applications. Nomad is easy to operate and scale and has native Consul and Vault integrations.',
  homepage: 'https://www.nomadproject.io',
  github: 'https://github.com/hashicorp/nomad',
  programs: ['nomad'],
  versionSource: {
    type: 'github-releases',
    repo: 'hashicorp/nomad',
  },
  distributable: {
    url: 'https://github.com/hashicorp/nomad/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '~1.22',
  },

  build: {
    script: [
      'make pkg/{{hw.platform}}_$GOARCH/nomad',
      'install -Dm755 pkg/{{hw.platform}}_$GOARCH/nomad {{prefix}}/bin/nomad',
    ],
  },
}
