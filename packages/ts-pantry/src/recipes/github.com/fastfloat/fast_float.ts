import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/fastfloat/fast_float',
  name: 'fast_float',
  programs: [],
  buildDependencies: {
    'cmake.org': '*',
  },
  distributable: {
    url: 'https://github.com/fastfloat/fast_float/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake -S . -B build $CMAKE_ARGS',
      'cmake --install build',
    ],
    env: {
      CMAKE_ARGS: [
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DCMAKE_BUILD_TYPE=Release',
        '-Wno-dev',
      ],
    },
  },
  test: {
    script: [
      'c++ -std=c++11 $FIXTURE -o test',
      'test "$(./test)" = "parsed the number 3.1416"',
    ],
  },
}
