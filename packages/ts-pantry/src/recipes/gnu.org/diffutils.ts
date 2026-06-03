import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnu.org/diffutils',
  name: 'diffutils',
  programs: [
    'cmp',
    'diff',
    'diff3',
    'sdiff',
  ],
  distributable: {
    url: 'https://ftp.gnu.org/gnu/diffutils/diffutils-{{ version.raw }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      FORCE_UNSAFE_CONFIGURE: 1,
      ARGS: [
        '--prefix={{prefix}}',
      ],
      'linux/aarch64': {
        ARGS: [
          '--build=aarch64-unknown-linux-gnu',
        ],
      },
    },
  },
  test: {
    script: [
      'echo "aaaa" > test-file',
      'cmp test-file $FIXTURE',
    ],
  },
}
