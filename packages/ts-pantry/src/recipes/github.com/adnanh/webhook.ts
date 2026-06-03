import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/adnanh/webhook',
  name: 'webhook',
  programs: [
    'webhook',
  ],
  buildDependencies: {
    'go.dev': '^1.21',
  },
  distributable: {
    url: 'https://github.com/adnanh/webhook/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -v -ldflags="${LDFLAGS}" -o {{prefix}}/bin/webhook',
    ],
    env: {
      CGO_ENABLED: 1,
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
