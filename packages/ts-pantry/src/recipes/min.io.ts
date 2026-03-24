import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'min.io',
  name: 'minio',
  description: 'MinIO is a high-performance, S3 compatible object store, open sourced under GNU AGPLv3 license.',
  homepage: 'https://min.io',
  github: 'https://github.com/minio/minio',
  programs: ['minio'],
  versionSource: {
    type: 'github-releases',
    repo: 'minio/minio',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/minio/minio/archive/RELEASE.2023-10-25T06-33-25Z.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '*',
  },

  build: {
    script: [
      'go build $GO_ARGS -ldflags="$LD_FLAGS"',
    ],
    env: {
      'GO_ARGS': ['-trimpath', '-o="{{prefix}}/bin/minio"'],
      'LD_FLAGS': ['-s', '-w', '-X github.com/minio/minio/cmd.ReleaseTag=2023-10-25T06-33-25Z'],
    },
  },
}
