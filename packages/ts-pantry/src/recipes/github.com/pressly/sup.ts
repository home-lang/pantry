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
      // The release tarball is pre-modules (GOPATH-era): it ships a vendor/
      // dir but no go.mod and no vendor/modules.txt, so -mod=vendor cannot be
      // used. Drop the stale vendor dir, create a go.mod with the correct
      // module path, and resolve deps from the network with -mod=mod.
      'rm -rf vendor',
      'test -f go.mod || go mod init github.com/pressly/sup',
      'go mod tidy',
      'sed -i \'s/^const VERSION.*/const VERSION = "{{ version }}"/\' sup.go',
      'go build ${GO_ARGS} -ldflags="${GO_LDFLAGS}" ./cmd/sup',
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
      GOFLAGS: '-mod=mod',
      linux: {
        CGO_ENABLED: 0,
      },
    },
  },
}
