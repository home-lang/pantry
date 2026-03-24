import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'databricks.com',
  name: 'databricks',
  description: 'Databricks CLI',
  github: 'https://github.com/databricks/cli',
  programs: ['databricks'],
  versionSource: {
    type: 'github-releases',
    repo: 'databricks/cli',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/databricks/cli/archive/refs/tags/v{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.21',
  },

  build: {
    script: [
      'go build $ARGS -ldflags="$GO_LDFLAGS"',
    ],
    env: {
      'ARGS': ['-trimpath', '-o={{prefix}}/bin/databricks'],
      'GO_LDFLAGS': ['-s', '-w', '-X github.com/databricks/cli/internal/build.buildVersion={{version}}'],
    },
  },
}
