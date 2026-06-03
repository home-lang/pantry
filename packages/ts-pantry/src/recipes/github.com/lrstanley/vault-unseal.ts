import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/lrstanley/vault-unseal',
  name: 'vault-unseal',
  programs: [
    'vault-unseal',
  ],
  buildDependencies: {
    'go.dev': '*',
  },
  distributable: {
    url: 'https://github.com/lrstanley/vault-unseal/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -v -ldflags="${GO_LDFLAGS}" -o "{{ prefix }}"/bin/vault-unseal',
    ],
    env: {
      CGO_ENABLED: 0,
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X main.version="{{ version }}"',
        '-X main.commit="$( git rev-parse HEAD )"',
        '-X main.date="$( date --iso-8601=minutes )"',
      ],
      linux: {
        GO_LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
