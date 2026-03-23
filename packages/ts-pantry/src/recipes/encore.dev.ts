import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'encore.dev',
  name: 'encore',
  description: 'Open Source Development Platform for building robust type-safe distributed systems with declarative infrastructure',
  homepage: 'https://encore.dev',
  github: 'https://github.com/encoredev/encore',
  programs: ['encore', 'git-remote-encore'],
  versionSource: {
    type: 'github-releases',
    repo: 'encoredev/encore',
  },
  distributable: {
    url: 'https://github.com/encoredev/encore/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'encore.dev/go': '^1.21',
  },
  buildDependencies: {
    'go.dev': '~1.23.3',
  },

  build: {
    script: [
      'go mod download',
      'go build $ARGS -ldflags="$GO_LDFLAGS" -o "{{prefix}}"/bin/encore ./cli/cmd/encore',
      'go build $ARGS -ldflags="$GO_LDFLAGS" -o "{{prefix}}"/bin/git-remote-encore ./cli/cmd/git-remote-encore',
      'cp -a runtime "{{prefix}}"',
      'cp -a runtimes "{{prefix}}"',
      'ln -s runtimes/go "{{prefix}}/runtime"',
    ],
    env: {
      'GO111MODULE': 'on',
      'ARGS': ['-v', '-trimpath'],
      'GO_LDFLAGS': ['-s', '-w', '-X \'encr.dev/internal/version.Version={{version}}\''],
    },
  },
}
