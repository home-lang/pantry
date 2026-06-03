import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'blake2.net/libb2',
  name: 'libb2',
  programs: [],
  buildDependencies: {
    'gnu.org/gcc': '*',
  },
  distributable: {
    url: 'https://github.com/BLAKE2/libb2/releases/download/v{{version}}/libb2-{{version}}.tar.gz',
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
        '--disable-dependency-tracking',
        '--disable-silent-rules',
      ],
      'darwin/x86-64': {
        ARGS: [
          '--enable-fat',
        ],
      },
      'linux/x86-64': {
        ARGS: [
          '--enable-fat',
        ],
      },
      'linux/aarch64': {
        ARGS: [
          '--enable-native="no"',
        ],
      },
    },
  },
  test: {
    script: [
      'pkg-config --modversion libb2 | grep {{version.raw}}',
    ],
  },
}
