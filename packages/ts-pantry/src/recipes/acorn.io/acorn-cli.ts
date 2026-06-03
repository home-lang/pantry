import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'acorn.io/acorn-cli',
  name: 'acorn-cli',
  programs: [
    'acorn',
  ],
  buildDependencies: {
    'go.dev': '*',
  },
  distributable: {
    url: 'https://github.com/acorn-io/runtime/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -v -ldflags="${LDFLAGS}" -o "{{ prefix }}"/bin/acorn',
    ],
    env: {
      CGO_ENABLED: 0,
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
