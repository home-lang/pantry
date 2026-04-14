import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'cfssl.org',
  name: 'cfssl',
  description: 'CFSSL: PKI and TLS toolkit from Cloudflare',
  homepage: 'https://cfssl.org/',
  github: 'https://github.com/cloudflare/cfssl',
  programs: ['cfssl', 'cfssl-bundle', 'cfssl-certinfo', 'cfssl-newkey', 'cfssl-scan', 'cfssljson', 'mkbundle', 'multirootca'],
  versionSource: {
    type: 'github-releases',
    repo: 'cloudflare/cfssl',
  },
  distributable: {
    url: 'https://github.com/cloudflare/cfssl/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.20',
  },

  build: {
    script: [
      'go build $ARGS -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/cfssl ./cmd/cfssl',
      'go build $ARGS -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/cfssl-bundle ./cmd/cfssl-bundle',
      'go build $ARGS -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/cfssl-certinfo ./cmd/cfssl-certinfo',
      'go build $ARGS -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/cfssl-newkey ./cmd/cfssl-newkey',
      'go build $ARGS -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/cfssl-scan ./cmd/cfssl-scan',
      'go build $ARGS -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/cfssljson ./cmd/cfssljson',
      'go build $ARGS -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/mkbundle ./cmd/mkbundle',
      'go build $ARGS -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/multirootca ./cmd/multirootca',
    ],
    env: {
      'ARGS': ['-trimpath'],
      'GO_LDFLAGS': ['-s', '-w', '-X github.com/cloudflare/cfssl/cli/version.version={{version}}'],
    },
  },
}
