import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'musepack.net/libreplaygain',
  name: 'libreplaygain',
  programs: [],
  buildDependencies: {
    'cmake.org': '*',
    linux: {
      'gnu.org/gcc': '*',
    },
  },
  distributable: {
    url: 'https://files.musepack.net/source/libreplaygain_r{{version.major}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake -S . -B build $CMAKE_ARGS',
      'cmake --build build',
      'cmake --install build',
      'mkdir -p {{prefix}}/include',
      'cp -r include/replaygain {{prefix}}/include/',
    ],
    env: {
      darwin: {
        CFLAGS: '$CFLAGS -Wno-implicit-function-declaration',
      },
      CMAKE_ARGS: [
        '-DCMAKE_INSTALL_PREFIX="{{prefix}}',
        '-DCMAKE_INSTALL_LIBDIR=lib',
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_FIND_FRAMEWORK=LAST',
        '-DCMAKE_VERBOSE_MAKEFILE=ON',
        '-Wno-dev',
        '-DBUILD_TESTING=OFF',
      ],
    },
  },
  test: {
    script: [
      'cc test.c -o test',
      './test',
    ],
  },
}
