import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'kernel.org/libcap',
  name: 'libcap',
  programs: [
    'capsh',
    'getcap',
    'getpcaps',
    'setcap',
  ],
  distributable: {
    url: 'https://git.kernel.org/pub/scm/libs/libcap/libcap.git/snapshot/libcap-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make $ARGS install',
    ],
    env: {
      ARGS: [
        'prefix={{prefix}}',
        'lib=lib',
        '--jobs {{ hw.concurrency }}',
      ],
    },
  },
  test: {
    script: [
      'getpcaps --license',
      'test "$(getpcaps --license|head -1)" = \'--license see LICENSE file for details.\'',
    ],
  },
}
