import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/tom-on-the-internet/cemetery-escape',
  name: 'cemetery-escape',
  programs: [
    'cemetery-escape',
  ],
  buildDependencies: {
    'go.dev': '^1.21',
  },
  distributable: {
    url: 'https://github.com/tom-on-the-internet/cemetery-escape/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -ldflags="$LDFLAGS" -o {{prefix}}/bin/cemetery-escape',
    ],
    env: {
      LDFLAGS: [
        '-s',
        '-w',
      ],
      linux: {
        LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
