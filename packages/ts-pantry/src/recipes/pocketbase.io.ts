import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'pocketbase.io',
  name: 'pocketbase',
  description: 'Open source backend for your next project in 1 file',
  homepage: 'https://pocketbase.io/',
  github: 'https://github.com/pocketbase/pocketbase',
  programs: ['pocketbase'],
  versionSource: {
    type: 'github-releases',
    repo: 'pocketbase/pocketbase',
  },
  distributable: {
    url: 'git+https://github.com/pocketbase/pocketbase.git',
  },
  buildDependencies: {
    'go.dev': '>=1.16',
  },

  build: {
    script: [
      'go build $ARGS -ldflags="$LDFLAGS" ./examples/base',
    ],
    env: {
      'CGO_ENABLED': '0',
      'ARGS': ['-trimpath', '-o="{{prefix}}/bin/pocketbase"'],
      'LDFLAGS': ['-s', '-w', '-X github.com/pocketbase/pocketbase.Version={{version}}'],
    },
  },
}
