import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'dgraph.io',
  name: 'dgraph',
  description: 'high-performance graph database for real-time use cases',
  homepage: 'https://dgraph.io/docs',
  github: 'https://github.com/dgraph-io/dgraph',
  programs: ['dgraph'],
  versionSource: {
    type: 'github-releases',
    repo: 'hypermodeinc/dgraph',
  },
  distributable: {
    url: 'https://github.com/hypermodeinc/dgraph/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '~1.22.12',
  },

  build: {
    script: [
      'go mod download',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/dgraph ./dgraph',
    ],
    env: {
      'CGO_ENABLED': '0',
      'GO_LDFLAGS': ['-s', '-w', '-X github.com/dgraph-io/dgraph/x.dgraphVersion={{version}}', '-X github.com/dgraph-io/dgraph/v{{version.major}}/x.dgraphVersion={{version}}', '-X github.com/hypermodeinc/dgraph/x.dgraphVersion={{version}}', '-X github.com/hypermodeinc/dgraph/v{{version.major}}/x.dgraphVersion={{version}}'],
    },
  },
}
