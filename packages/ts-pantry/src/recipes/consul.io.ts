import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'consul.io',
  name: 'consul',
  description: 'Consul is a distributed, highly available, and data center aware solution to connect and configure applications across dynamic, distributed infrastructure.',
  homepage: 'https://www.consul.io',
  github: 'https://github.com/hashicorp/consul',
  programs: ['consul'],
  versionSource: {
    type: 'github-releases',
    repo: 'hashicorp/consul',
  },
  distributable: {
    url: 'https://github.com/hashicorp/consul/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.20',
  },

  build: {
    script: [
      'go mod download',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o \'{{prefix}}/bin/consul\' .',
    ],
    env: {
      'GO_LDFLAGS': ['-s', '-w', '-X github.com/hashicorp/consul/version.fullVersion={{version}}', '-X github.com/hashicorp/consul/version.BuildDate=$(date -u +\'%Y-%m-%dT%H:%M:%SZ\')'],
    },
  },
}
