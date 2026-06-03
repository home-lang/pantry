import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'emcrisostomo.github.io/fswatch',
  name: 'fswatch',
  programs: [
    'fswatch',
  ],
  distributable: {
    url: 'https://github.com/emcrisostomo/fswatch/releases/download/{{version}}/fswatch-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--disable-debug',
        '--disable-dependency-tracking',
      ],
      linux: {
        LDFLAGS: '$LDFLAGS -Wl,-lstdc++fs,-lpthread',
      },
    },
  },
  test: {
    script: [
      'fswatch --version | tee out',
      'grep \'fswatch {{version}}\' out',
    ],
  },
}
