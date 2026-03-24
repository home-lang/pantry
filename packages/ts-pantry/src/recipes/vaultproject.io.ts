import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'vaultproject.io',
  name: 'vault',
  description: 'A tool for secrets management, encryption as a service, and privileged access management',
  homepage: 'https://www.vaultproject.io/',
  github: 'https://github.com/hashicorp/vault',
  programs: ['vault'],
  versionSource: {
    type: 'github-releases',
    repo: 'hashicorp/vault',
  },
  distributable: {
    url: 'git+https://github.com/hashicorp/vault',
  },
  buildDependencies: {
    'go.dev': '>=1.22',
    'git-scm.org': '*',
  },

  build: {
    script: [
      'go mod tidy',
      'CGO_ENABLED=0 go build -ldflags="-s -w -X github.com/hashicorp/vault/sdk/version.GitCommit=pantry" -o bin/vault .',
      'install -D bin/vault {{prefix}}/bin/vault',
    ],
  },
}
