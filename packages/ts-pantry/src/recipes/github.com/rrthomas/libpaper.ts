import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/rrthomas/libpaper',
  name: 'libpaper',
  programs: [
    'paper',
  ],
  buildDependencies: {
    'gnu.org/make': '*',
    'gnu.org/help2man': '*',
  },
  distributable: {
    url: 'https://github.com/rrthomas/libpaper/releases/download/v{{version}}/libpaper-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $CONFIGURE_ARGS',
      'make check',
      'make install',
    ],
    env: {
      CONFIGURE_ARGS: [
        '--enable-relocatable',
        '--disable-debug',
        '--disable-dependency-tracking',
        '--prefix="{{prefix}}"',
        '--libdir="{{prefix}}/lib"',
        '--sysconfdir="{{prefix}}/etc"',
      ],
    },
  },
  test: {
    script: [
      'paper --version | grep {{version}}',
      'paper --all',
      'cc test.c -lpaper -o test',
      './test',
    ],
  },
}
