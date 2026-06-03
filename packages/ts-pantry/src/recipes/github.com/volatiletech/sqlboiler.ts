import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/volatiletech/sqlboiler',
  name: 'sqlboiler',
  programs: [
    'sqlboiler',
  ],
  buildDependencies: {
    'go.dev': '^1.21',
  },
  distributable: {
    url: 'https://github.com/volatiletech/sqlboiler/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'sed -i \'s/^const sqlBoilerVersion = ".*"/const sqlBoilerVersion = "{{version}}"/\' main.go',
      'go mod download',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o {{prefix}}/bin/sqlboiler .',
    ],
    env: {
      GO_LDFLAGS: [
        '-s',
        '-w',
      ],
      linux: {
        GO_LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
