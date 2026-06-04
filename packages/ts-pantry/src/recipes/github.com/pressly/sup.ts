import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/pressly/sup',
  name: 'sup',
  programs: [
    'sup',
  ],
  buildDependencies: {
    'go.dev': '*',
  },
  distributable: {
    url: 'https://github.com/pressly/sup/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      // The release tarball is pre-modules (GOPATH-era) and ships a complete
      // vendor/ dir but no go.mod. Create one with the correct module path and
      // build straight from the vendored deps (no network, no tidy).
      'test -f go.mod || go mod init github.com/pressly/sup',
      'sed -i \'s/^const VERSION.*/const VERSION = "{{ version }}"/\' sup.go',
      'go build ${GO_ARGS} -mod=vendor -ldflags="${GO_LDFLAGS}" ./cmd/sup',
    ],
    env: {
      GO_ARGS: [
        '-o {{prefix}}/bin/',
      ],
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X github.com/pressly/sup.VERSION={{ version }}',
      ],
      GOFLAGS: '-mod=vendor',
      linux: {
        CGO_ENABLED: 0,
      },
    },
  },
}
