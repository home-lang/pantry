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
      'test -f go.mod || go mod init',
      'go mod tidy',
      'go mod vendor',
      'sed -i "s/^const VERSION.*/var VERSION = \\"{{ version }}\\"/" sup.go',
      'go build ${GO_ARGS} -ldflags="${GO_LDFLAGS}" ./cmd/sup',
    ],
    env: {
      GO_ARGS: [
        '-o "{{prefix}}/bin/"',
      ],
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X sup.VERSION={{ version }}',
      ],
      linux: {
        CGO_ENABLED: 0,
      },
    },
  },
}
