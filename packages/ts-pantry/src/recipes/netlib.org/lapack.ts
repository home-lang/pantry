import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'netlib.org/lapack',
  name: 'lapack',
  programs: [],
  dependencies: {
    'gnu.org/gcc': '^11',
  },
  buildDependencies: {
    'gnu.org/binutils': '*',
    'cmake.org': '~3.24',
  },
  distributable: {
    url: 'https://github.com/Reference-LAPACK/lapack/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'sed -i -f $PROP CMakeLists.txt',
        'working-directory': '..',
      },
      'cmake .. $CMAKE_ARGS',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      CMAKE_ARGS: [
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DCMAKE_INSTALL_LIBDIR=lib',
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_FIND_FRAMEWORK=LAST',
        '-DCMAKE_VERBOSE_MAKEFILE=ON',
        '-Wno-dev',
        '-DBUILD_TESTING=OFF',
        '-DBUILD_SHARED_LIBS:BOOL=ON',
        '-DLAPACKE:BOOL=ON',
      ],
      darwin: {
        CC: 'clang',
        CXX: 'clang++',
        LD: 'clang',
        CMAKE_ARGS: [
          '-DCMAKE_AR=/usr/bin/ar',
          '-DCMAKE_RANLIB=/usr/bin/ranlib',
        ],
      },
    },
  },
  test: {
    script: [
      'pkg-config --modversion lapack',
      'pkg-config --modversion lapack | grep {{version}}',
      '$CC test.c -llapacke -o test',
      './test',
    ],
  },
}
