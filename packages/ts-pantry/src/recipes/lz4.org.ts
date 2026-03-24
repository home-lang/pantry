import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'lz4.org',
  name: 'lz4',
  description: 'Extremely Fast Compression algorithm',
  homepage: 'https://lz4.github.io/lz4/',
  github: 'https://github.com/lz4/lz4',
  programs: ['lz4'],
  versionSource: {
    type: 'github-releases',
    repo: 'lz4/lz4',
    tagPattern: /\/^LZ4 \//,
  },
  distributable: {
    url: 'https://github.com/lz4/lz4/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      'make --jobs {{hw.concurrency}} install PREFIX="{{prefix}}"',
    ],
  },
}
