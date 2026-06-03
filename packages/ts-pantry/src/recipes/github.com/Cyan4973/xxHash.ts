import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/Cyan4973/xxHash',
  name: 'xxHash',
  programs: [
    'xxhsum',
    'xxh32sum',
    'xxh64sum',
    'xxh128sum',
  ],
  distributable: {
    url: 'https://github.com/Cyan4973/xxHash/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make --jobs {{ hw.concurrency }}',
      'make --jobs {{ hw.concurrency }} install $ARGS',
    ],
    env: {
      ARGS: [
        'PREFIX={{prefix}}',
      ],
    },
  },
  test: {
    script: [
      'pkg-config --modversion libxxhash | grep {{version}}',
    ],
  },
}
