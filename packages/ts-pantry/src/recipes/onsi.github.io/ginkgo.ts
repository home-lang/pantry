import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'onsi.github.io/ginkgo',
  name: 'ginkgo',
  programs: [
    'ginkgo',
  ],
  buildDependencies: {
    'go.dev': '^1.20',
  },
  distributable: {
    url: 'https://github.com/onsi/ginkgo/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -v -ldflags="${LDFLAGS}" -o "{{ prefix }}"/bin/ginkgo ./ginkgo/main.go',
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
