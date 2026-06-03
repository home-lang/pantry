import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/fabio42/sasqwatch',
  name: 'sasqwatch',
  programs: [
    'sasqwatch',
  ],
  buildDependencies: {
    'go.dev': '^1.20',
  },
  distributable: {
    url: 'https://github.com/fabio42/sasqwatch/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'go build -v -ldflags="$LDFLAGS"',
      'mkdir -p {{ prefix }}/bin',
      'mv sasqwatch {{ prefix }}/bin',
    ],
    env: {
      LDFLAGS: [
        '-s',
        '-w',
        '-X=github.com/fabio42/sasqwatch/cmd.Version={{version}}',
      ],
      linux: {
        LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
