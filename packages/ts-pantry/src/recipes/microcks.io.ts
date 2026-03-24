import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'microcks.io',
  name: 'microcks-cli',
  description: 'Simple CLI for interacting with Microcks test APIs',
  homepage: 'https://microcks.io',
  github: 'https://github.com/microcks/microcks-cli',
  programs: ['microcks-cli'],
  versionSource: {
    type: 'github-releases',
    repo: 'microcks/microcks-cli',
  },
  distributable: {
    url: 'git+https://github.com/microcks/microcks-cli.git',
  },
  dependencies: {
    'curl.se/ca-certs': '*',
  },
  buildDependencies: {
    'go.dev': '=1.23.0',
  },

  build: {
    script: [
      'go build $ARGS -ldflags="$GO_LDFLAGS" .',
    ],
    env: {
      'ARGS': ['-trimpath', '-o={{prefix}}/bin/microcks-cli'],
      'GO_LDFLAGS': ['-s', '-w', '-X github.com/microcks/microcks-cli/version.Version={{version}}'],
    },
  },
}
