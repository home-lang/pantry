import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'vale.sh',
  name: 'vale',
  description: ':pencil: A markup-aware linter for prose built with speed and extensibility in mind.',
  homepage: 'https://vale.sh/',
  github: 'https://github.com/errata-ai/vale',
  programs: ['vale'],
  versionSource: {
    type: 'github-releases',
    repo: 'errata-ai/vale',
  },
  distributable: {
    url: 'https://github.com/errata-ai/vale/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '~1.21',
  },

  build: {
    script: [
      'go mod download',
      'go build $ARGS -ldflags="$GO_LDFLAGS" ./cmd/vale',
    ],
    env: {
      'ARGS': ['-v', '-trimpath', '-o {{prefix}}/bin/vale'],
      'GO_LDFLAGS': ['-s', '-w', '-X main.version=v{{version}}'],
    },
  },
}
