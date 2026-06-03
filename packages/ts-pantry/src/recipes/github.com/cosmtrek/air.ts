import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/cosmtrek/air',
  name: 'air',
  programs: [
    'air',
  ],
  buildDependencies: {
    'git-scm.org': '*',
    'go.dev': '^1.22',
    'golangci-lint.run': '*',
  },
  distributable: {
    url: 'https://github.com/cosmtrek/air/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'unset LDFLAGS',
        if: 'darwin',
      },
      'make build',
      'mkdir -p "{{ prefix }}"/bin',
      'mv air "{{ prefix }}"/bin',
    ],
    env: {
      linux: {
        LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
