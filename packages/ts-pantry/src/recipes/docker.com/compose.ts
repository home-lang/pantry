import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'docker.com/compose',
  name: 'compose',
  programs: [
    'docker-compose',
  ],
  buildDependencies: {
    'go.dev': '*',
  },
  distributable: {
    url: 'https://github.com/docker/compose/archive/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build $ARGS -ldflags="$GO_LDFLAGS" ./cmd',
    ],
    env: {
      ARGS: [
        '-trimpath',
        '-o={{prefix}}/bin/docker-compose',
      ],
      GO_LDFLAGS: [
        '-s',
        '-w',
        '-X github.com/docker/compose/v2/internal.Version={{version}}',
        '-X github.com/docker/compose/v5/internal.Version={{version}}',
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
      'docker-compose --version | tee out',
      'grep {{version}} out',
    ],
  },
}
