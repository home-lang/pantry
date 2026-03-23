import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'granted.dev',
  name: 'granted',
  description: 'The easiest way to access your cloud.',
  homepage: 'https://granted.dev',
  github: 'https://github.com/common-fate/granted',
  programs: ['granted'],
  versionSource: {
    type: 'github-releases',
    repo: 'common-fate/granted',
  },
  distributable: {
    url: 'https://github.com/common-fate/granted/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.19',
  },

  build: {
    script: [
      'go mod download',
      'go build -v -trimpath -ldflags="$LDFLAGS" -o $BUILDLOC ./cmd/granted',
    ],
    env: {
      'GOPROXY': 'https://proxy.golang.org,direct',
      'GOSUMDB': 'sum.golang.org',
      'GO111MODULE': 'on',
      'CGO_ENABLED': '0',
      'BUILDLOC': '{{prefix}}/bin/granted',
      'LDFLAGS': ['-s', '-w', '-X github.com/common-fate/granted/internal/build.Version={{version}}'],
    },
  },
}
