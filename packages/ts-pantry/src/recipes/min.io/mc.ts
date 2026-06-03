import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'min.io/mc',
  name: 'mc',
  programs: [
    'mc',
  ],
  buildDependencies: {
    'go.dev': '*',
  },
  distributable: {
    url: 'https://github.com/minio/mc/archive/RELEASE.2023-10-24T21-42-22Z.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'go build $GO_ARGS -ldflags="$LD_FLAGS"',
    ],
    env: {
      GO_ARGS: [
        '-trimpath',
        '-o="{{prefix}}/bin/mc"',
      ],
      linux: {
        GO_ARGS: [
          '-buildmode=pie',
        ],
      },
      LD_FLAGS: [
        '-s',
        '-w',
        '-X github.com/minio/mc/cmd.ReleaseTag=2023-10-24T21-42-22Z',
      ],
    },
  },
  test: {
    script: [
      'mc --version | grep "2023-10-24T21-42-22Z"',
      'mc mb test',
    ],
  },
}
