import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'sqlc.dev',
  name: 'sqlc',
  description: 'Generate type-safe code from SQL',
  homepage: 'https://sqlc.dev/',
  github: 'https://github.com/sqlc-dev/sqlc',
  programs: ['sqlc'],
  versionSource: {
    type: 'github-releases',
    repo: 'sqlc-dev/sqlc',
  },
  distributable: {
    url: 'https://github.com/sqlc-dev/sqlc/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '^1.22',
  },

  build: {
    script: [
      'go mod download',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/sqlc ./cmd/sqlc',
    ],
    env: {
      'GO_LDFLAGS': ['-s', '-w'],
    },
  },
}
