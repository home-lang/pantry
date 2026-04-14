import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gqlgen.com',
  name: 'gqlgen',
  description: 'go generate based graphql server library',
  homepage: 'https://gqlgen.com',
  github: 'https://github.com/99designs/gqlgen',
  programs: ['gqlgen'],
  versionSource: {
    type: 'github-releases',
    repo: '99designs/gqlgen',
  },
  distributable: {
    url: 'https://github.com/99designs/gqlgen/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.18',
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
      'BUILDLOC': '{{prefix}}/bin/gqlgen',
      'LDFLAGS': ['-s', '-w', '-X graphql.version={{version}}'],
    },
  },
}
