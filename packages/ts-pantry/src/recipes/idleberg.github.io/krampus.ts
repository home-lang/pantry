import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'idleberg.github.io/krampus',
  name: 'krampus',
  programs: [
    'krampus',
  ],
  buildDependencies: {
    'go.dev': '^1.20',
  },
  distributable: {
    url: 'https://github.com/idleberg/krampus/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -ldflags="$LDFLAGS" -o {{ prefix }}/bin/krampus',
    ],
    env: {
      LDFLAGS: [
        '-s',
        '-w',
        '-X',
        'main.Version={{ version }}',
      ],
      linux: {
        LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
  test: {
    script: [
      'krampus --version | grep v{{ version }}',
    ],
  },
}
