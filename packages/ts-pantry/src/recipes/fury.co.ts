import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'fury.co',
  name: 'fury',
  description: 'Gemfury CLI',
  homepage: 'https://fury.co/guide/cli',
  github: 'https://github.com/gemfury/cli',
  programs: ['fury'],
  versionSource: {
    type: 'github-releases',
    repo: 'gemfury/cli',
  },
  distributable: {
    url: 'git+https://github.com/gemfury/cli.git',
  },
  buildDependencies: {
    'go.dev': '^1.21',
  },

  build: {
    script: [
      'go build $ARGS -ldflags="$LDFLAGS" ./cmd/fury',
    ],
    env: {
      'ARGS': ['-v', '-trimpath', '-o={{prefix}}/bin/fury'],
      'LDFLAGS': ['-s', '-w', '-X main.Version={{version}}'],
    },
  },
}
