import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'wundergraph.com',
  name: 'wunderctl',
  description: 'WunderGraph is a Backend for Frontend Framework to optimize frontend, fullstack and backend developer workflows through API Composition.',
  homepage: 'https://wundergraph.com',
  github: 'https://github.com/wundergraph/wundergraph',
  programs: ['wunderctl'],
  versionSource: {
    type: 'github-releases',
    repo: 'wundergraph/wundergraph',
  },
  distributable: {
    url: 'https://github.com/wundergraph/wundergraph/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.20',
  },

  build: {
    script: [
      'go mod download',
      'go build $ARGS -ldflags="$LDFLAGS" ./cmd/wunderctl',
    ],
    env: {
      'GO111MODULE': 'on',
      'CGO_ENABLED': '0',
      'ARGS': ['-v', '-trimpath', '-o "{{prefix}}"/bin/wunderctl'],
      'LDFLAGS': ['-s', '-w', '-X \'main.commit={{version}}\'', '-X \'main.builtBy=dev\'', '-X \'main.version=dev\''],
    },
  },
}
