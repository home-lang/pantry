import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gaia-gis.it/fossil/freexl',
  name: 'freexl',
  programs: [],
  dependencies: {
    'zlib.net/minizip': '^1',
    'libexpat.github.io': '^2',
  },
  buildDependencies: {
    'doxygen.nl': 1,
  },
  distributable: {
    url: 'https://www.gaia-gis.it/gaia-sins/freexl-sources/freexl-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '--prefix="{{prefix}}"',
      ],
      'linux/aarch64': {
        ARGS: [
          '--build=aarch64-unknown-linux-gnu',
        ],
      },
      'linux/x86-64': {
        ARGS: [
          '--build=x86_64-unknown-linux-gnu',
        ],
      },
    },
  },
  test: {
    script: [
      'mv $FIXTURE test.c',
      'cc test.c -lfreexl',
      './a.out',
    ],
  },
}
