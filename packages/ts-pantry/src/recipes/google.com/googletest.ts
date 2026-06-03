import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'google.com/googletest',
  name: 'googletest',
  programs: [],
  buildDependencies: {
    'cmake.org': '^3',
  },
  distributable: {
    url: 'https://github.com/google/googletest/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake .. $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      ARGS: [
        '-DBUILD_TESTING=OFF',
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DCMAKE_BUILD_TYPE=Release',
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
      'STD="c++14"',
      'STD="c++17"',
      'c++ $FIXTURE -std=$STD -lgtest -lgtest_main -pthread',
      './a.out',
    ],
  },
}
