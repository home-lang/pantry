import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'rclone.org',
  name: 'rclone',
  description: '"rsync for cloud storage" - Google Drive, S3, Dropbox, Backblaze B2, One Drive, Swift, Hubic, Wasabi, Google Cloud Storage, Azure Blob, Azure Files, Yandex Files',
  homepage: 'https://rclone.org/',
  github: 'https://github.com/rclone/rclone',
  programs: ['rclone'],
  versionSource: {
    type: 'github-releases',
    repo: 'rclone/rclone',
  },
  distributable: {
    url: 'https://github.com/rclone/rclone/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'go.dev': '*',
  },

  build: {
    script: [
      'go build $ARGS -ldflags=\'-s -w -X github.com/rclone/rclone/fs.Version=v{{version}}\'',
    ],
    env: {
      'CGO_ENABLED': '0',
      'ARGS': ['-trimpath', '-o={{prefix}}/bin/rclone'],
    },
  },
}
