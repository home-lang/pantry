import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/google/gops',
  name: 'gops',
  programs: [
    'gops',
  ],
  dependencies: {
    'go.dev': '*',
  },
  buildDependencies: {
    'go.dev': '*',
  },
  distributable: {
    url: 'https://github.com/google/gops/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -ldflags="$LDFLAGS"',
      'install -Dm755 gops "{{ prefix }}"/bin/gops',
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
