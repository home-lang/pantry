import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'turso.tech',
  name: 'turso',
  description: 'Command line interface to Turso.',
  homepage: 'https://turso.tech',
  github: 'https://github.com/tursodatabase/turso-cli',
  programs: ['turso'],
  versionSource: {
    type: 'github-releases',
    repo: 'tursodatabase/turso-cli',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'git+https://github.com/tursodatabase/turso-cli',
  },
  buildDependencies: {
    'go.dev': '^1.20',
  },

  build: {
    script: [
      'go mod download',
      'go generate --tags=prod ./...',
      'go build $ARGS -ldflags="$LDFLAGS" ./cmd/turso',
    ],
    env: {
      'GO111MODULE': 'on',
      'CGO_ENABLED': '0',
      'ARGS': ['-v', '-trimpath', '-tags=prod', '-o "{{prefix}}"/bin/turso'],
      'LDFLAGS': ['-s', '-w', '-X main.debugMode=false'],
    },
  },
}
