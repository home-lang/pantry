import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/matoszz/blowfish',
  name: 'blowfish',
  programs: [
    'blowfish',
  ],
  buildDependencies: {
    'go.dev': '*',
  },
  distributable: {
    url: 'git+https://github.com/matoszz/blowfish',
  },
  build: {
    script: [
      'go build -v -ldflags="${GO_LDFLAGS}" -o "{{ prefix }}"/bin/blowfish main.go',
    ],
    env: {
      CGO_ENABLED: '0',
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X github.com/matoszz/blowfish/cmd.BuildVersion={{ version }}',
      ],
      linux: {
        GO_LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
