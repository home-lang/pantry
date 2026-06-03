import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/adamritter/fastgron',
  name: 'fastgron',
  programs: [
    'fastgron',
  ],
  dependencies: {
    'curl.se': '*',
    linux: {
      'gnu.org/gcc': '*',
    },
  },
  buildDependencies: {
    'gnu.org/bash': '^5',
    'gnu.org/make': '*',
    'cmake.org': '^3',
  },
  distributable: {
    url: 'https://github.com/adamritter/fastgron/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake -B build ${CMAKE_ARGS}',
      'cmake --build build --verbose',
      'cmake --install build',
    ],
    env: {
      CMAKE_ARGS: [
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DCMAKE_BUILD_PARALLEL_LEVEL={{hw.concurrency}}',
      ],
      darwin: {
        CMAKE_ARGS: [
          '-DCMAKE_CXX_COMPILER=clang++',
        ],
      },
      linux: {
        CMAKE_ARGS: [
          '-DCMAKE_POSITION_INDEPENDENT_CODE=true',
        ],
      },
    },
  },
  test: {
    script: [
      'test "$(fastgron --version 2>&1| cut -d\' \' -f 3)" = {{version}}',
    ],
  },
}
