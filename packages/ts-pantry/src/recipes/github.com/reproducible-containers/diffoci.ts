import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/reproducible-containers/diffoci',
  name: 'diffoci',
  programs: [
    'diffoci',
  ],
  buildDependencies: {
    'go.dev': '1.21.0',
  },
  distributable: {
    url: 'https://github.com/reproducible-containers/diffoci/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make',
      'mkdir -p {{prefix}}/bin',
      'make install',
    ],
    env: {
      PREFIX: '${{prefix}}',
      VERSION: '${{version}}',
      linux: {
        GO_LDFLAGS: [
          '-s',
          '-w',
          '-X github.com/reproducible-containers/diffoci/cmd/diffoci/version.Version={{version}}',
          '-buildmode=pie',
        ],
      },
    },
  },
}
