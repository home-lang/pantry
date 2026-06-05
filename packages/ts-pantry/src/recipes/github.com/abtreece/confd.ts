import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/abtreece/confd',
  name: 'confd',
  programs: [
    'confd',
  ],
  buildDependencies: {
    'go.dev': '*',
  },
  distributable: {
    url: 'https://github.com/abtreece/confd/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'sed -i \'s/const Version = ".*"/const Version = "{{version}}"/\' version.go',
        'working-directory': 'cmd/confd',
      },
      'go build -ldflags "${GO_LDFLAGS}" -o "{{ prefix }}"/bin/confd ./cmd/confd',
    ],
    env: {
      CGO_ENABLED: '0',
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X main.GitSHA=$(git rev-parse --short HEAD || echo)',
        '-X main.Version={{ version }}',
      ],
      linux: {
        GO_LDFLAGS: [
          '-buildmode=pie',
        ],
      },
    },
  },
}
