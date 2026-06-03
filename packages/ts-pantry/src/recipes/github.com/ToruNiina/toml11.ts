import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/ToruNiina/toml11',
  name: 'toml11',
  programs: [],
  buildDependencies: {
    'cmake.org': '>=3.1',
    linux: {
      'gnu.org/gcc': '^14',
    },
  },
  distributable: {
    url: 'https://github.com/ToruNiina/toml11/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake -S . -B build -DCMAKE_INSTALL_PREFIX={{prefix}} -DCMAKE_BUILD_TYPE=Release -Dtoml11_BUILD_TESTS=OFF',
      'cmake --build build',
      'cmake --install build',
    ],
  },
  test: {
    script: [
      'c++ $FIXTURE -o test -std=c++14',
      './test',
    ],
  },
}
