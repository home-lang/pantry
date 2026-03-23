import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'depot.dev',
  name: 'depot',
  description: '🖥️ Depot CLI, build your Docker images in the cloud',
  homepage: 'https://depot.dev',
  github: 'https://github.com/depot/cli',
  programs: ['depot'],
  versionSource: {
    type: 'github-releases',
    repo: 'depot/cli',
  },
  distributable: {
    url: 'https://github.com/depot/cli/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '~1.21',
    'gnu.org/coreutils': '*',
  },

  build: {
    script: [
      'go build -v -ldflags="${GO_LDFLAGS}" -o "{{ prefix }}"/bin/depot ./cmd/depot',
    ],
    env: {
      'GO_LDFLAGS': ['-s', '-w', '-X github.com/depot/cli/internal/build.Version={{version}}', '-X github.com/depot/cli/internal/build.Date="$(date +%F)"', '-X github.com/depot/cli/internal/build.SentryEnvironment=release'],
    },
  },
}
