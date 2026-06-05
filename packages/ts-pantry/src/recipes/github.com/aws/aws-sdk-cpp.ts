import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/aws/aws-sdk-cpp',
  name: 'aws-sdk-cpp',
  programs: [],
  dependencies: {
    'curl.se': '*',
    'zlib.net': '1',
    'openssl.org': '1.1',
  },
  buildDependencies: {
    'cmake.org': '*',
    'git-scm.org': '^2',
    linux: {
      'kernel.org/linux-headers': '^5',
    },
  },
  distributable: {
    url: 'git+https://github.com/aws/aws-sdk-cpp',
  },
  build: {
    script: [
      'git submodule update --init --recursive',
      'cmake -S . -B build $ARGS',
      'cmake --build build -j {{hw.concurrency}}',
      'cmake --install build',
    ],
    env: {
      LDFLAGS: '-Wl,-rpath,{{prefix}}',
      ARGS: [
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DENABLE_TESTING=OFF',
        '-DZLIB_INCLUDE_DIR={{deps.zlib.net.prefix}}/include',
        '-Dcrypto_INCLUDE_DIR={{deps.openssl.org.prefix}}/include',
      ],
      linux: {
        ARGS: [
          '-DZLIB_LIBRARY={{deps.zlib.net.prefix}}/lib/libz.so',
          '-Dcrypto_LIBRARY={{deps.openssl.org.prefix}}/lib/libcrypto.so',
        ],
      },
      darwin: {
        ARGS: [
          '-DZLIB_LIBRARY={{deps.zlib.net.prefix}}/lib/libz.dylib',
          '-Dcrypto_LIBRARY={{deps.openssl.org.prefix}}/lib/libcrypto.dylib',
        ],
      },
    },
  },
  test: {
    script: [
      'mv $FIXTURE test.cpp',
      'c++ -std=c++11 test.cpp -laws-cpp-sdk-core -o test',
      './test',
    ],
  },
}
