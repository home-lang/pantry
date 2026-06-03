import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/gromgit/pup',
  name: 'pup',
  programs: [
    'pup',
  ],
  buildDependencies: {
    'go.dev': '^1.23',
  },
  distributable: {
    url: 'https://github.com/gromgit/pup/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build ${GO_ARGS} -ldflags="${GO_LDFLAGS}" ./',
    ],
    env: {
      CGO_ENABLED: 0,
      GO_ARGS: [
        '-o {{prefix}}/bin/',
      ],
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
