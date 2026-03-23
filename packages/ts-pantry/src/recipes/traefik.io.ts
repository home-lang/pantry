import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'traefik.io',
  name: 'traefik',
  description: 'The Cloud Native Application Proxy',
  homepage: 'https://traefik.io/',
  github: 'https://github.com/traefik/traefik',
  programs: ['traefik'],
  versionSource: {
    type: 'github-releases',
    repo: 'traefik/traefik',
  },
  distributable: {
    url: 'https://github.com/traefik/traefik/releases/download/v{{version}}/traefik-v{{version}}.src.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '*',
  },

  build: {
    script: [
      'go generate',
      'go build $GO_ARGS -ldflags="$LD_FLAGS" ./cmd/traefik',
    ],
    env: {
      'GO_ARGS': ['-trimpath', '-o="{{prefix}}/bin/traefik"'],
      'LD_FLAGS': ['-s', '-w', '-X github.com/traefik/traefik/v{{version.major}}/pkg/version.Version={{version}}'],
    },
  },
}
