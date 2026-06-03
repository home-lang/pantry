import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/TartanLlama/expected',
  name: 'expected',
  programs: [],
  buildDependencies: {
    'cmake.org': '^3',
  },
  distributable: {
    url: 'https://github.com/TartanLlama/expected/archive/refs/tags/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake .. -DCMAKE_INSTALL_PREFIX={{prefix}} -DCMAKE_BUILD_TYPE=Release',
      'make --jobs {{ hw.concurrency }} install',
    ],
  },
  test: {
    script: [
      'mv $FIXTURE b.cpp',
      'c++ b.cpp -std=c++17',
      'out="$(./a.out)"',
      'test "$out" = "Result: 2',
      'Error: Division by zero"',
    ],
  },
}
