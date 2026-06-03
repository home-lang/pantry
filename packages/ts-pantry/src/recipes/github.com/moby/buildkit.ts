import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/moby/buildkit',
  name: 'buildkit',
  programs: [
    'buildctl',
  ],
  buildDependencies: {
    'go.dev': '^1.21',
  },
  distributable: {
    url: 'https://github.com/moby/buildkit/archive/refs/tags/v{{ version }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build -mod=vendor -ldflags "$LDFLAGS" -o {{prefix}}/bin/buildctl ./cmd/buildctl',
    ],
    env: {
      LDFLAGS: [
        '-s',
        '-w',
        '-X github.com/moby/buildkit/version.Version={{version}}',
        '-X github.com/moby/buildkit/version.Revision=$(git rev-parse HEAD)',
        '-X github.com/moby/buildkit/version.Package=github.com/moby/buildkit',
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
      'buildctl --version',
    ],
  },
}
