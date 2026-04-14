import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'upliftci.dev',
  name: 'uplift',
  description: 'Semantic versioning the easy way. Powered by Conventional Commits. Built for use with CI.',
  homepage: 'https://upliftci.dev',
  github: 'https://github.com/gembaadvantage/uplift',
  programs: ['uplift'],
  versionSource: {
    type: 'github-releases',
    repo: 'gembaadvantage/uplift',
  },
  distributable: {
    url: 'https://github.com/gembaadvantage/uplift/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.19',
  },

  build: {
    script: [
      'go mod download',
      'mkdir -p "{{prefix}}"/bin',
      'go build -v -trimpath -ldflags="$LDFLAGS" -o $BUILDLOC ./cmd/uplift',
      '',
    ],
    env: {
      'GOPROXY': 'https://proxy.golang.org,direct',
      'GOSUMDB': 'sum.golang.org',
      'GO111MODULE': 'on',
      'CGO_ENABLED': '0',
      'BUILDLOC': '{{prefix}}/bin/uplift',
      'LDFLAGS': ['-s', '-w', '-X github.com/gembaadvantage/uplift/internal/version.version={{version}}'],
    },
  },
}
