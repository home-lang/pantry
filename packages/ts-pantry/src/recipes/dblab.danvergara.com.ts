import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'dblab.danvergara.com',
  name: 'dblab',
  description: 'The database client every command line junkie deserves.',
  github: 'https://github.com/danvergara/dblab',
  programs: ['dblab'],
  versionSource: {
    type: 'github-releases',
    repo: 'danvergara/dblab',
  },
  distributable: {
    url: 'https://github.com/danvergara/dblab/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.21',
  },

  build: {
    script: [
      'go mod download',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o "{{prefix}}/bin/dblab" .',
    ],
    env: {
      'CGO_ENABLED': '0',
      'GO_LDFLAGS': ['-s', '-w', '-X main.version={{version}}'],
    },
  },
}
