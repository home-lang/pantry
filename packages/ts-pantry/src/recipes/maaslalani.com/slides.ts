import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'maaslalani.com/slides',
  name: 'slides',
  programs: [
    'slides',
  ],
  buildDependencies: {
    'go.dev': '^1.18',
  },
  distributable: {
    url: 'https://github.com/maaslalani/slides/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -v -ldflags="$LDFLAGS"',
      'mkdir -p "{{ prefix }}"/bin',
      'mv slides "{{ prefix }}"/bin',
    ],
    env: {
      LDFLAGS: [
        '-s',
        '-w',
        '-X main.version={{ version }}',
        '-X main.revision=tea',
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
      'slides --help',
    ],
  },
}
