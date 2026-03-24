import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'fx.wtf',
  name: 'fx',
  description: 'Terminal JSON viewer & processor',
  homepage: 'https://fx.wtf',
  github: 'https://github.com/antonmedv/fx',
  programs: ['fx'],
  versionSource: {
    type: 'github-releases',
    repo: 'antonmedv/fx',
  },
  distributable: {
    url: 'https://github.com/antonmedv/fx/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.19',
  },

  build: {
    script: [
      'go mod download',
      'mkdir -p "{{ prefix }}"/bin',
      'go build -v -trimpath -ldflags="$LDFLAGS" -o $BUILDLOC .',
      '',
    ],
    env: {
      'GOPROXY': 'https://proxy.golang.org,direct',
      'GOSUMDB': 'sum.golang.org',
      'GO111MODULE': 'on',
      'CGO_ENABLED': '0',
      'BUILDLOC': '{{prefix}}/bin/fx',
      'LDFLAGS': ['-s', '-w'],
    },
  },
}
