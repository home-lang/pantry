import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'docker.com/buildx',
  name: 'buildx',
  programs: [
    'buildx',
  ],
  buildDependencies: {
    'go.dev': '^1.21',
  },
  distributable: {
    url: 'git+https://github.com/docker/buildx.git',
  },
  build: {
    script: [
      'go build $ARGS -ldflags="$LDFLAGS" ./cmd/buildx',
    ],
    env: {
      REV: '$(git rev-parse --short HEAD)',
      ARGS: [
        '-trimpath',
        '-o={{prefix}}/bin/buildx',
      ],
      LDFLAGS: [
        '-s',
        '-w',
        '-X github.com/docker/buildx/version.Version=v{{version}}',
        '-X github.com/docker/buildx/version.Revision=${REV}',
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
      'buildx version | grep {{version}}',
      'buildx help | grep \'Extended build capabilities with BuildKit\'',
    ],
  },
}
