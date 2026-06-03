import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/zegl/kube-score',
  name: 'kube-score',
  programs: [
    'kube-score',
  ],
  buildDependencies: {
    'go.dev': '^1.18',
  },
  distributable: {
    url: 'https://github.com/zegl/kube-score/archive/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -ldflags="$LDFLAGS" ./cmd/kube-score',
      'mkdir -p "{{ prefix }}"/bin',
      'mv kube-score "{{ prefix }}"/bin',
    ],
    env: {
      LDFLAGS: [
        '-s -w -X main.version=v{{ version }}',
      ],
      linux: {
        LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
