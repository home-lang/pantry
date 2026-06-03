import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/Esri/lerc',
  name: 'lerc',
  programs: [],
  buildDependencies: {
    'cmake.org': '*',
  },
  distributable: {
    url: 'https://github.com/Esri/lerc/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake -S . -B build $ARGS',
      'cmake --build build',
      'cmake --install build',
    ],
    env: {
      ARGS: [
        '-DCMAKE_INSTALL_PREFIX="{{prefix}}"',
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_VERBOSE_MAKEFILE=ON',
        '-DCMAKE_FIND_FRAMEWORK=LAST',
        '-Wno-dev',
        '-DBUILD_TESTING=OFF',
      ],
    },
  },
  test: {
    script: [
      'pkg-config --modversion Lerc | grep {{version}}',
      'cc test.cc -std=gnu++17 -lLerc -o test',
      './test',
    ],
  },
}
