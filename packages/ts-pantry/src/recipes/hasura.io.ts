import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'hasura.io',
  name: 'hasura',
  description: 'Blazing fast, instant realtime GraphQL APIs on all your data with fine grained access control, also trigger webhooks on database events.',
  homepage: 'https://hasura.io',
  github: 'https://github.com/hasura/graphql-engine',
  programs: ['hasura'],
  versionSource: {
    type: 'github-releases',
    repo: 'hasura/graphql-engine',
  },
  distributable: {
    url: 'https://github.com/hasura/graphql-engine/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.16',
  },

  build: {
    script: [
      'mkdir -p cli-ext/bin',
      'printf \'#!/bin/sh\\necho "cli-ext stub"\\n\' > cli-ext/bin/cli-ext-hasura',
      'chmod +x cli-ext/bin/cli-ext-hasura',
      'cd "cli"',
      'cp ../cli-ext/bin/cli-ext-hasura internal/cliext/static-bin/$PLATFORM/cli-ext',
      'go build -v -ldflags="$LDFLAGS" -o="{{prefix}}/bin/hasura" ./cmd/hasura',
      '',
    ],
    env: {
      'LDFLAGS': ['-s', '-w', '-X github.com/hasura/graphql-engine/cli/v2/version.BuildVersion={{version}}', '-X github.com/hasura/graphql-engine/cli/v2/plugins.IndexBranchRef=master'],
    },
  },
}
