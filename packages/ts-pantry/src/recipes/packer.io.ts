import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'packer.io',
  name: 'packer',
  description: 'Packer is a tool for creating identical machine images for multiple platforms from a single source configuration.',
  homepage: 'https://packer.io',
  github: 'https://github.com/hashicorp/packer',
  programs: ['packer'],
  versionSource: {
    type: 'github-releases',
    repo: 'hashicorp/packer/tags',
    tagPattern: /\/^v\//,
  },
  distributable: {
    url: 'https://github.com/hashicorp/packer/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.18',
  },

  build: {
    script: [
      'go mod download',
      'go build -v -ldflags="$GO_LDFLAGS" -o "{{ prefix }}"/bin/packer',
    ],
    env: {
      'GO111MODULE': 'on',
      'GO_LDFLAGS': ['-s', '-w', '-X=main.Version={{version}}'],
    },
  },
}
