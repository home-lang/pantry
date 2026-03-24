import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'temporal.io',
  name: 'temporal',
  description: 'Command-line interface for running Temporal Server and interacting with Workflows, Activities, Namespaces, and other parts of Temporal',
  homepage: 'https://temporal.io/',
  github: 'https://github.com/temporalio/cli',
  programs: ['temporal'],
  versionSource: {
    type: 'github-releases',
    repo: 'temporalio/cli',
  },
  distributable: {
    url: 'https://github.com/temporalio/cli/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.19',
  },

  build: {
    script: [
      'go mod download',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o "{{prefix}}/bin/temporal" ./cmd/temporal',
    ],
    env: {
      'GO111MODULE': 'on',
      'CGO_ENABLED': '0',
      'GO_LDFLAGS': ['-s', '-w', '-X github.com/temporalio/cli/headers.Version={{version}}', '-X github.com/temporalio/cli/temporalcli.Version={{version}}', '-X github.com/temporalio/cli/internal/temporalcli.Version={{version}}'],
    },
  },
}
