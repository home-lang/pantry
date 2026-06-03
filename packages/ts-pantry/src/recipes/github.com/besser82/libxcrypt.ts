import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/besser82/libxcrypt',
  name: 'libxcrypt',
  programs: [],
  buildDependencies: {
    'freedesktop.org/pkg-config': '~0.29',
    'perl.org': '*',
  },
  distributable: {
    url: 'https://github.com/besser82/libxcrypt/releases/download/v{{version}}/libxcrypt-{{version}}.tar.xz',
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
        '--disable-valgrind',
        '--disable-symvers',
        '--disable-failure-tokens',
      ],
    },
  },
  test: {
    script: [
      'cc -L{{prefix}}/lib -lcrypt fixture.c',
      './a.out',
    ],
  },
}
