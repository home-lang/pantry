import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'atlasgo.io',
  name: 'atlas',
  description: 'Manage your database schema as code',
  homepage: 'https://atlasgo.io',
  github: 'https://github.com/ariga/atlas',
  programs: ['atlas'],
  versionSource: {
    type: 'github-releases',
    repo: 'ariga/atlas',
  },
  distributable: {
    url: 'https://github.com/ariga/atlas/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.20',
  },

  build: {
    script: [
      'go mod download',
      'go build -v -trimpath -ldflags="$LDFLAGS" -o $BUILDLOC .',
    ],
    env: {
      'GOPROXY': 'https://proxy.golang.org,direct',
      'GOSUMDB': 'sum.golang.org',
      'GO111MODULE': 'on',
      'BUILDLOC': '{{prefix}}/bin/atlas',
      'LDFLAGS': ['-s', '-w', '-X ariga.io/atlas/cmd/atlas/internal/cmdapi.version=v{{version}}'],
    },
  },
}
