import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/danfis/libccd',
  name: 'libccd',
  programs: [],
  buildDependencies: {
    'cmake.org': '*',
  },
  distributable: {
    url: 'https://github.com/danfis/libccd/archive/v{{version.marketing}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake . $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '-DCMAKE_INSTALL_PREFIX="{{prefix}}"',
        '-DENABLE_DOUBLE_PRECISION=ON',
      ],
    },
  },
  test: {
    script: [
      'cc -o test test.c -lccd',
      './test',
    ],
  },
}
