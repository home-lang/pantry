import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'hashicorp.com/consul-template',
  name: 'consul-template',
  programs: [
    'consul-template',
  ],
  buildDependencies: {
    'go.dev': '^1.20',
  },
  distributable: {
    url: 'https://github.com/hashicorp/consul-template/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go mod download',
      'go build -v -trimpath -ldflags="$GO_LDFLAGS" -o \'{{prefix}}/bin/consul-template\' .',
    ],
    env: {
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
