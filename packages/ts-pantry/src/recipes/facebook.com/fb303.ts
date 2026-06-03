import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'facebook.com/fb303',
  name: 'fb303',
  programs: [],
  dependencies: {
    'github.com/facebookincubator/fizz': '*',
    'facebook.com/wangle': '*',
    'facebook.com/folly': '*',
    'facebook.com/fbthrift': '>=2023.12.18.0',
    'fmt.dev': '^12',
    'gflags.github.io': '^2.2.2',
    'google.com/glog': '^0.7',
    'libsodium.org': '^1.0.19',
    'openssl.org': '^1.1',
    'github.com/Cyan4973/xxHash': '^0.8',
    linux: {
      'zlib.net': '^1',
      'gnu.org/gcc/libstdcxx': 14,
    },
  },
  buildDependencies: {
    'cmake.org': '*',
    'facebook.com/mvfst': '*',
    'boost.org': '^1.84',
    linux: {
      'gnu.org/gcc': 14,
    },
  },
  distributable: {
    url: 'https://github.com/facebook/fb303/archive/v{{version.raw}}.tar.gz',
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
        '-DPYTHON_EXTENSIONS=OFF',
        '-DBUILD_SHARED_LIBS=ON',
        '-DCMAKE_CXX_STANDARD=20',
      ],
      darwin: {
        CMAKE_ARGS: [
          '-DCMAKE_SHARED_LINKER_FLAGS=-Wl,-undefined,dynamic_lookup',
        ],
      },
      linux: {
        CMAKE_ARGS: [
          '-DCMAKE_C_FLAGS=-fPIC',
          '-DCMAKE_CXX_FLAGS=-fPIC',
        ],
      },
      'linux/x86-64': {
        CMAKE_ARGS: [
          '-DCMAKE_EXE_LINKER_FLAGS=-Wl,-pie',
        ],
      },
      'linux/aarch64': {
        CMAKE_ARGS: [
          '-DCMAKE_EXE_LINKER_FLAGS=-Wl,-pie,-latomic',
        ],
      },
    },
  },
  test: {
    script: [
      'c++ -std=c++20 -DGLOG_USE_GLOG_EXPORT test.cpp -o test $LDFLAGS $EXTRA_LIBS -lfb303_thrift_cpp -lfolly -lglog -lthriftprotocol -lthriftcpp2 -ldl -lboost_context -lfmt',
      './test | grep \'BaseService\'',
    ],
  },
}
