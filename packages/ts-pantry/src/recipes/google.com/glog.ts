import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'google.com/glog',
  name: 'glog',
  programs: [],
  dependencies: {
    'gflags.github.io': '~2.2',
  },
  buildDependencies: {
    'cmake.org': '*',
  },
  distributable: {
    url: 'https://github.com/google/glog/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake -S . -B build -G "Unix Makefiles" $ARGS',
      'cmake --build build',
      'cmake --build build --target install',
    ],
    env: {
      ARGS: [
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DBUILD_SHARED_LIBS=ON',
        '-DCMAKE_CXX_FLAGS=-std=c++14',
      ],
    },
  },
  test: {
    script: [
      'cat $FIXTURE >main.cpp',
      'cat $FIXTURE >CMakeLists.txt',
      'cmake -S . -B build',
      'cmake --build build',
      './build/myapp',
    ],
  },
}
