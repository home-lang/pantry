import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/skx/marionette',
  name: 'marionette',
  programs: [
    'marionette',
  ],
  buildDependencies: {
    'go.dev': '*',
  },
  distributable: {
    url: 'https://github.com/skx/marionette/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -v -ldflags="${LDFLAGS}" -o "{{ prefix }}"/bin/marionette',
    ],
    env: {
      CGO_ENABLED: 0,
      LDFLAGS: [
        '-s',
        '-w',
        '-X main.version={{version}}',
      ],
      linux: {
        LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
