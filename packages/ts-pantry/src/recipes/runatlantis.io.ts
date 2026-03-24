import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'runatlantis.io',
  name: 'atlantis',
  description: 'Terraform Pull Request Automation tool',
  homepage: 'https://www.runatlantis.io/',
  github: 'https://github.com/runatlantis/atlantis',
  programs: ['atlantis'],
  versionSource: {
    type: 'github-releases',
    repo: 'runatlantis/atlantis',
  },
  distributable: {
    url: 'https://github.com/runatlantis/atlantis/archive/refs/tags/v{{version}}.tar.gz',
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
      'BUILDLOC': '{{prefix}}/bin/atlantis',
      'LDFLAGS': ['-s', '-w', '-X main.version={{version}}'],
    },
  },
}
