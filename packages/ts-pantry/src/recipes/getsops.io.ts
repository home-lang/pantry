import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'getsops.io',
  name: 'sops',
  description: 'Simple and flexible tool for managing secrets',
  homepage: 'https://getsops.io/',
  github: 'https://github.com/getsops/sops',
  programs: ['sops'],
  versionSource: {
    type: 'github-releases',
    repo: 'getsops/sops',
  },
  distributable: {
    url: 'git+https://github.com/getsops/sops.git',
  },
  buildDependencies: {
    'go.dev': '^1.19',
  },

  build: {
    script: [
      'go mod tidy',
      'go build $GO_ARGS -ldflags="$GO_LDFLAGS" ./cmd/sops',
    ],
    env: {
      'GO_ARGS': ['-trimpath', '-o="{{prefix}}/bin/sops"'],
      'GO_LDFLAGS': ['-s', '-w', '-X github.com/getsops/sops/v3/version.Version={{version}}'],
    },
  },
}
