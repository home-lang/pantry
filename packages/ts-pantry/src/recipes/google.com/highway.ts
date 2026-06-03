import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'google.com/highway',
  name: 'highway',
  programs: [],
  buildDependencies: {
    'cmake.org': '*',
  },
  distributable: {
    url: 'https://github.com/google/highway/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake -S . -B builddir $ARGS',
      'cmake --build builddir',
      'cmake --install builddir',
      'mkdir -p {{prefix}}/share/',
      'cp -R hwy {{prefix}}/share/',
    ],
    env: {
      ARGS: [
        '-DBUILD_SHARED_LIBS=ON',
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DHWY_ENABLE_TESTS=OFF',
        '-DHWY_ENABLE_EXAMPLES=OFF',
        '-DCMAKE_BUILD_TYPE=Release',
      ],
      'linux/x86-64': {
        ARGS: [
          '-DCMAKE_EXE_LINKER_FLAGS=-Wl,--allow-shlib-undefined',
        ],
      },
    },
  },
  test: {
    script: [
      'cp -R {{prefix}}/share/hwy .',
      'c++ -std=c++11 -I. hwy/examples/benchmark.cc $CXXFLAGS -lhwy',
      'exit 0',
      './a.out',
    ],
  },
}
