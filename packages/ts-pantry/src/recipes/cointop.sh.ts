import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'cointop.sh',
  name: 'cointop',
  description: 'A fast and lightweight interactive terminal based UI application for tracking cryptocurrencies 🚀',
  homepage: 'https://cointop.sh',
  github: 'https://github.com/cointop-sh/cointop',
  programs: ['cointop'],
  versionSource: {
    type: 'github-releases',
    repo: 'cointop-sh/cointop',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/cointop-sh/cointop/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'curl.se/ca-certs': '*',
  },
  buildDependencies: {
    'go.dev': '^1.17',
  },

  build: {
    script: [
      'go build -ldflags="$LDFLAGS" -o "{{prefix}}/bin/cointop"',
      '',
    ],
    env: {
      'LDFLAGS': ['-s', '-w', '-X github.com/cointop-sh/cointop/cointop.version={{version}}'],
    },
  },
}
