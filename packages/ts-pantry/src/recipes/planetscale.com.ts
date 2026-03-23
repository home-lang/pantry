import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'planetscale.com',
  name: 'pscale',
  description: 'The CLI for PlanetScale Database',
  homepage: 'https://www.planetscale.com/',
  github: 'https://github.com/planetscale/cli',
  programs: ['pscale'],
  versionSource: {
    type: 'github-releases',
    repo: 'planetscale/cli',
  },
  distributable: {
    url: 'https://github.com/planetscale/cli/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '~1.22.4',
  },

  build: {
    script: [
      'go mod download',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/pscale ./cmd/pscale',
    ],
    env: {
      'GO111MODULE': 'on',
      'CGO_ENABLED': '0',
      'GO_LDFLAGS': ['-s', '-w', '-X main.version={{version}}'],
    },
  },
}
