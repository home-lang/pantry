import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'stripe.com',
  name: 'stripe',
  description: 'A command-line tool for Stripe',
  homepage: 'https://stripe.com/docs/stripe-cli',
  github: 'https://github.com/stripe/stripe-cli',
  programs: ['stripe'],
  versionSource: {
    type: 'github-releases',
    repo: 'stripe/stripe-cli',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/stripe/stripe-cli/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.19',
  },

  build: {
    script: [
      'make setup',
      'go build -v -ldflags="$LDFLAGS" -o stripe cmd/stripe/main.go',
      'mkdir -p "{{prefix}}"/bin',
      'mv stripe "{{prefix}}"/bin',
      '',
    ],
    env: {
      'LDFLAGS': ['-s', '-w', '-X=main.Version={{version}}', '-X=github.com/stripe/stripe-cli/pkg/version.Version={{version}}'],
    },
  },
}
