import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'cnquery.io',
  name: 'cnquery',
  description: 'open source, cloud-native, graph-based asset inventory',
  homepage: 'https://cnquery.io',
  github: 'https://github.com/mondoohq/cnquery',
  programs: ['cnquery'],
  versionSource: {
    type: 'github-releases',
    repo: 'mondoohq/cnquery',
  },
  distributable: {
    url: 'https://github.com/mondoohq/cnquery/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '~1.21',
  },

  build: {
    script: [
      'go build $ARGS -ldflags="$LD_FLAGS" ./apps/cnquery/cnquery.go',
    ],
    env: {
      'LD_FLAGS': ['-s', '-w'],
      'ARGS': ['-v', '-trimpath', '-o={{prefix}}/bin/cnquery'],
    },
  },
}
