import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'dagger.io',
  name: 'dagger',
  description: 'An engine to run your pipelines in containers',
  homepage: 'https://dagger.io',
  github: 'https://github.com/dagger/dagger',
  programs: ['dagger'],
  versionSource: {
    type: 'github-releases',
    repo: 'dagger/dagger',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/dagger/dagger/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.18',
  },

  build: {
    script: [
      'go build -v -ldflags="$LDFLAGS" ./cmd/dagger',
      'mkdir -p "{{prefix}}"/bin',
      'mv dagger "{{prefix}}"/bin',
      '',
    ],
    env: {
      'CGO_ENABLED': '0',
      'LDFLAGS': ['-s', '-w', '-X github.com/dagger/dagger/engine.Version={{version}}'],
    },
  },
}
