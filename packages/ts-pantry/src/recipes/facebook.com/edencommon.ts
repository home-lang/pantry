import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'facebook.com/edencommon',
  name: 'edencommon',
  programs: [],
  dependencies: {
    'facebook.com/folly': '*',
    'gflags.github.io': '*',
    'google.com/glog': '*',
    'facebook.com/fb303': '*',
    'facebook.com/mvfst': '*',
    'openssl.org': '^1.1',
    'sourceware.org/bzip2': '^1',
    'boost.org': '~1.88',
    linux: {
      'gnu.org/gcc/libstdcxx': '14',
    },
  },
  buildDependencies: {
    'cmake.org': '*',
    'google.com/googletest': '*',
    linux: {
      'gnu.org/gcc': '14',
    },
  },
  distributable: {
    url: 'https://github.com/facebookexperimental/edencommon/archive/v{{version.raw}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'sed -i \'s/COMPONENTS cpp2 py)/COMPONENTS cpp2)/\' CMakeLists.txt',
      {
        run: 'sed -i \'s/add_subdirectory(test)/#add_subdirectory(test)/\' {os,utils}/CMakeLists.txt',
        'working-directory': 'eden/common',
      },
      'cmake -S . -B _build $ARGS',
      'cmake --build _build',
      'cmake --install _build',
    ],
    env: {
      ARGS: [
        '-DBUILD_SHARED_LIBS=ON',
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DCMAKE_INSTALL_LIBDIR=lib',
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_VERBOSE_MAKEFILE=ON',
        '-Wno-dev',
        '-DBUILD_TESTING=OFF',
        '-DCMAKE_CXX_STANDARD=20',
        '-DCMAKE_CXX_STANDARD_REQUIRED=ON',
      ],
      linux: {
        ARGS: [
          '-DCMAKE_C_FLAGS=-fPIC',
          '-DCMAKE_CXX_FLAGS=-fPIC',
          '-DCMAKE_EXE_LINKER_FLAGS=-Wl,-pie',
        ],
      },
    },
  },
  test: {
    script: [
      'c++ -std=c++20 -DGLOG_USE_GLOG_EXPORT test.cc -o test -ledencommon_utils -lfolly -lglog -lfmt $EXTRA',
      './test 1',
    ],
  },
}
