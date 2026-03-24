import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'zlib.net',
  name: 'zlib',
  description: 'A massively spiffy yet delicately unobtrusive compression library.',
  homepage: 'http://zlib.net/',
  github: 'https://github.com/madler/zlib',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'madler/zlib',
  },
  distributable: {
    url: 'https://zlib.net/zlib-{{version.raw}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      './configure --prefix="{{prefix}}"',
      'make --jobs {{ hw.concurrency }} install',
    ],
  },
}
