import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/clever/microplane',
  name: 'microplane',
  programs: [
    'mp',
  ],
  dependencies: {
    'git-scm.org': '^2',
  },
  buildDependencies: {
    'go.dev': '^1.18',
  },
  distributable: {
    url: 'https://github.com/clever/microplane/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'go build -v -ldflags="$LDFLAGS" -o {{ prefix }}/bin/mp',
    ],
    env: {
      LDFLAGS: [
        '-s',
        '-w',
        '-X main.version=v{{ version }}',
      ],
      linux: {
        LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
