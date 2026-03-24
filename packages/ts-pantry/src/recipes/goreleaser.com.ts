import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'goreleaser.com',
  name: 'goreleaser',
  description: 'Deliver Go binaries as fast and easily as possible',
  homepage: 'https://goreleaser.com/',
  github: 'https://github.com/goreleaser/goreleaser',
  programs: ['goreleaser'],
  versionSource: {
    type: 'github-releases',
    repo: 'goreleaser/goreleaser',
  },
  distributable: {
    url: 'https://github.com/goreleaser/goreleaser/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.21',
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
      'BUILDLOC': '{{prefix}}/bin/goreleaser',
      'LDFLAGS': ['-s', '-w', '-X main.version={{version}}'],
    },
  },
}
