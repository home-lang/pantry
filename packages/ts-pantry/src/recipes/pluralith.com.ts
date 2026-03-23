import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'pluralith.com',
  name: 'pluralith',
  description: 'A tool for Terraform state visualisation and automated generation of infrastructure documentation',
  homepage: 'https://www.pluralith.com',
  github: 'https://github.com/Pluralith/pluralith-cli',
  programs: ['pluralith'],
  versionSource: {
    type: 'github-releases',
    repo: 'Pluralith/pluralith-cli',
  },
  distributable: {
    url: 'https://github.com/Pluralith/pluralith-cli/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'curl.se/ca-certs': '*',
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
      'BUILDLOC': '{{prefix}}/bin/pluralith',
      'LDFLAGS': ['-s', '-w'],
    },
  },
}
