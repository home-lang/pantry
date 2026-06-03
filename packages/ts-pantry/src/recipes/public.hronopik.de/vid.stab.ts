import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'public.hronopik.de/vid.stab',
  name: 'vid',
  programs: [],
  buildDependencies: {
    'cmake.org': '*',
  },
  distributable: {
    url: 'https://github.com/georgmartius/vid.stab/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake . $ARGS',
      'make install',
    ],
    env: {
      ARGS: [
        '-DCMAKE_INSTALL_PREFIX="{{prefix}}"',
        '-DCMAKE_BUILD_TYPE=Release',
        '-DUSE_OMP=OFF',
      ],
    },
  },
  test: {
    script: [
      'c++ vidstab_version.cpp -o vidstab_version -lvidstab',
      './vidstab_version',
    ],
  },
}
