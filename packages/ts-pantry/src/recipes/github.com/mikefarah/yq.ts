import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/mikefarah/yq',
  name: 'yq',
  programs: [
    'yq',
  ],
  buildDependencies: {
    'go.dev': '^1.18',
    'pandoc.org': '*',
  },
  distributable: {
    url: 'https://github.com/mikefarah/yq/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -v -ldflags="$LDFLAGS"',
      './scripts/generate-man-page-md.sh',
      './scripts/generate-man-page.sh',
      'mkdir -p {{ prefix }}/bin',
      'mv yq {{ prefix }}/bin',
      'mkdir -p {{ prefix }}/share/man/man1',
      'mv yq.1 {{ prefix }}/share/man/man1',
    ],
    env: {
      LDFLAGS: [
        '-s -w',
      ],
      linux: {
        LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
