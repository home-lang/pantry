import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/sctplab/usrsctp',
  name: 'usrsctp',
  programs: [],
  buildDependencies: {
    'cmake.org': '*',
    linux: {
      'gnu.org/gcc': '*',
    },
  },
  distributable: {
    url: 'https://github.com/sctplab/usrsctp/archive/refs/tags/{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake -S . -B build $CMAKE_ARGS',
      'cmake --build build',
      'cmake --install build',
    ],
    env: {
      CMAKE_ARGS: [
        '-DCMAKE_INSTALL_PREFIX="{{prefix}}',
        '-DCMAKE_INSTALL_LIBDIR=lib',
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_FIND_FRAMEWORK=LAST',
        '-DCMAKE_VERBOSE_MAKEFILE=ON',
        '-Wno-dev',
        '-DBUILD_TESTING=OFF',
        '-Dsctp_build_shared_lib=ON',
      ],
    },
  },
  test: {
    script: [
      'cc test.c -lusrsctp -lpthread -o test',
      './test',
    ],
  },
}
