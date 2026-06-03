import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/redis/hiredis',
  name: 'hiredis',
  programs: [],
  distributable: {
    url: 'https://github.com/redis/hiredis/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'make install $ARGS',
    ],
    env: {
      ARGS: [
        'PREFIX="{{prefix}}"',
        'INSTALL_INCLUDE_PATH="{{prefix}}/include"',
        'INSTALL_LIBRARY_PATH="{{prefix}}/lib"',
        'INSTALL_PKGCONF_PATH="{{prefix}}/lib/pkgconfig"',
      ],
    },
  },
  test: {
    script: [
      'pkg-config --modversion hiredis | grep {{version}}',
    ],
  },
}
