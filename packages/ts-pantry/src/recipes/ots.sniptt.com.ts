import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'ots.sniptt.com',
  name: 'ots',
  description: '🔐 Share end-to-end encrypted secrets with others via a one-time URL',
  homepage: 'https://ots.sniptt.com',
  github: 'https://github.com/sniptt-official/ots',
  programs: ['ots'],
  versionSource: {
    type: 'github-releases',
    repo: 'sniptt-official/ots',
  },
  distributable: {
    url: 'https://github.com/sniptt-official/ots/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.19',
  },

  build: {
    script: [
      'go mod download',
      'mkdir -p "{{prefix}}"/bin',
      'go build -v -trimpath -ldflags="$LDFLAGS" -o $BUILDLOC .',
      '',
    ],
    env: {
      'GOPROXY': 'https://proxy.golang.org,direct',
      'GOSUMDB': 'sum.golang.org',
      'GO111MODULE': 'on',
      'CGO_ENABLED': '0',
      'BUILDLOC': '{{prefix}}/bin/ots',
      'LDFLAGS': ['-s', '-w', '-X github.com/sniptt-official/ots/build.Version={{version}}'],
    },
  },
}
