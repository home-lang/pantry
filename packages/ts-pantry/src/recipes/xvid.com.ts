import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'xvid.com',
  name: 'xvid',
  programs: [],
  distributable: {
    url: 'https://downloads.xvid.com/downloads/xvidcore-{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make --jobs {{ hw.concurrency }} install',
      '',
    ],
    env: {
      'ARGS': ['--prefix="{{prefix}}"', '--disable-assembly'],
    },
  },
}
