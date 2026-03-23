import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'terraform-docs.io',
  name: 'terraform-docs',
  description: 'Generate documentation from Terraform modules in various output formats',
  homepage: 'https://terraform-docs.io',
  github: 'https://github.com/terraform-docs/terraform-docs',
  programs: ['', '', '', '', '', '', '', '', '', ''],
  versionSource: {
    type: 'github-releases',
    repo: 'terraform-docs/terraform-docs',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/terraform-docs/terraform-docs/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'go mod download',
      'go build -v -ldflags="$LDFLAGS" -o "{{prefix}}"/bin/terraform-docs',
    ],
  },
}
