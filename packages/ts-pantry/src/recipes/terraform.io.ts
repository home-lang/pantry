import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'terraform.io',
  name: 'terraform',
  description: 'Terraform enables you to safely and predictably create, change, and improve infrastructure. It is a source-available tool that codifies APIs into declarative configuration files that can be shared amongst team members, treated as code, edited, reviewed, and versioned.',
  homepage: 'https://www.terraform.io',
  github: 'https://github.com/hashicorp/terraform',
  programs: ['terraform'],
  versionSource: {
    type: 'github-releases',
    repo: 'hashicorp/terraform',
  },
  distributable: {
    url: 'https://github.com/hashicorp/terraform/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '~1.24.1',
  },

  build: {
    script: [
      'EXTRA="-mod=mod"',
      'sed -i \'/tlskyber/s|^|// |\' go.mod',
      'go mod download',
      'go build -v -ldflags="$LDFLAGS" $EXTRA -o "{{prefix}}/bin/terraform"',
    ],
    env: {
      'GO111MODULE': 'on',
      'LDFLAGS': ['-s', '-w', '-X=github.com/hashicorp/terraform/version.Version={{version}}', '-X=github.com/hashicorp/terraform/version.dev=no'],
    },
  },
}
