import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'terragrunt.gruntwork.io',
  name: 'terragrunt',
  description: 'Terragrunt is a flexible orchestration tool that allows Infrastructure as Code written in OpenTofu/Terraform to scale.',
  homepage: 'https://terragrunt.gruntwork.io/',
  github: 'https://github.com/gruntwork-io/terragrunt',
  programs: ['terragrunt'],
  versionSource: {
    type: 'github-releases',
    repo: 'gruntwork-io/terragrunt',
  },
  distributable: {
    url: 'https://github.com/gruntwork-io/terragrunt/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'terraform.io': '*',
  },
  buildDependencies: {
    'go.dev': '^1.18',
  },

  build: {
    script: [
      'go build -v -ldflags="$LDFLAGS" -o "{{prefix}}"/bin/terragrunt',
    ],
    env: {
      'LDFLAGS': ['-s', '-w', '-X=main.VERSION={{version}}', '-X=github.com/gruntwork-io/go-commons/version.Version={{version}}'],
    },
  },
}
