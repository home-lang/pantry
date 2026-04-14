import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'infracost.io',
  name: 'infracost',
  description: 'Cloud cost estimates for Terraform in pull requests💰📉 Shift FinOps Left!',
  homepage: 'https://www.infracost.io/docs/',
  github: 'https://github.com/infracost/infracost',
  programs: ['infracost'],
  versionSource: {
    type: 'github-releases',
    repo: 'infracost/infracost',
  },
  distributable: {
    url: 'https://github.com/infracost/infracost/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.19',
  },

  build: {
    script: [
      'go mod download',
      'mkdir -p "{{prefix}}"/bin',
      'go build -v -trimpath -ldflags="$LDFLAGS" -o $BUILDLOC ./cmd/infracost',
      '',
    ],
    env: {
      'GOPROXY': 'https://proxy.golang.org,direct',
      'GOSUMDB': 'sum.golang.org',
      'GO111MODULE': 'on',
      'CGO_ENABLED': '0',
      'BUILDLOC': '{{prefix}}/bin/infracost',
      'LDFLAGS': ['-s', '-w', '-X github.com/infracost/infracost/internal/version.Version={{version}}'],
    },
  },
}
