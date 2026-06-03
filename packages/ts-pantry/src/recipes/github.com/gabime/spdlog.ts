import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/gabime/spdlog',
  name: 'spdlog',
  programs: [],
  dependencies: {
    'fmt.dev': '^11',
  },
  buildDependencies: {
    'cmake.org': '^3',
    darwin: {
      'llvm.org': '*',
    },
  },
  distributable: {
    url: 'https://github.com/gabime/spdlog/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    'working-directory': 'build',
    script: [
      'sed -i.bak "s|// #define SPDLOG_FMT_EXTERNAL|#define SPDLOG_FMT_EXTERNAL|" ../include/spdlog/tweakme.h',
      'cmake .. -DSPDLOG_BUILD_BENCH=OFF -DSPDLOG_BUILD_TESTS=OFF -DSPDLOG_FMT_EXTERNAL=ON -DSPDLOG_BUILD_SHARED=ON -DCMAKE_INSTALL_PREFIX={{prefix}} -DCMAKE_BUILD_TYPE=Release',
      'make --jobs {{ hw.concurrency }} install',
    ],
  },
  test: {
    script: [
      'mv $FIXTURE b.cpp',
      'c++ -std=c++11 b.cpp -lfmt',
      './a.out',
      'cat basic-log.txt | grep Test',
    ],
  },
}
