import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'modernc.org/goyacc',
  name: 'goyacc',
  programs: [
    'goyacc',
  ],
  buildDependencies: {
    'go.dev': '~1.19',
  },
  distributable: {
    url: 'https://gitlab.com/cznic/goyacc/-/archive/{{version.tag}}/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -v -ldflags="${GO_LDFLAGS}" -o "{{ prefix }}"/bin/goyacc',
      'go test',
    ],
    env: {
      CGO_ENABLED: 0,
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
  test: {
    script: [
      'goyacc -o test.go $FIXTURE',
      'grep \'package main\' test.go',
    ],
  },
}
