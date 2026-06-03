import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'google.com/fullycapable',
  name: 'fullycapable',
  programs: [
    'capsh',
    'getcap',
    'getpcaps',
    'setcap',
  ],
  distributable: {
    url: 'https://mirrors.edge.kernel.org/pub/linux/libs/security/linux-privs/libcap2/libcap-{{ version.raw }}.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make $ARGS --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        'prefix={{prefix}}',
        'lib=lib',
        'RAISE_SETFCAP=no',
      ],
      CFLAGS: '$CFLAGS -Wno-implicit-function-declaration',
    },
  },
}
