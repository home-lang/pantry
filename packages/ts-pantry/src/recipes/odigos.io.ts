import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'odigos.io',
  name: 'odigos',
  description: 'Distributed tracing without code changes. 🚀 Instantly monitor any application using OpenTelemetry and eBPF',
  homepage: 'https://odigos.io',
  github: 'https://github.com/keyval-dev/odigos',
  programs: ['odigos'],
  versionSource: {
    type: 'github-releases',
    repo: 'keyval-dev/odigos',
  },
  distributable: {
    url: 'https://github.com/keyval-dev/odigos/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.22',
  },

  build: {
    script: [
      'go mod download',
      'go build $ARGS -ldflags="$GO_LDFLAGS" ./',
    ],
    env: {
      'CGO_ENABLED': '0',
      'GO_LDFLAGS': ['-s', '-w', '-X github.com/keyval-dev/odigos/cli/cmd.OdigosVersion=v{{version}}', '-X github.com/odigos-io/odigos/cli/cmd.OdigosVersion=v{{version}}'],
      'ARGS': ['-v', '-trimpath', '-o={{prefix}}/bin/odigos', '-tags embed_manifests'],
    },
  },
}
