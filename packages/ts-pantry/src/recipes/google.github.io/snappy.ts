import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'google.github.io/snappy',
  name: 'snappy',
  programs: [],
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
    'cmake.org': '*',
    'gnu.org/patch': '*',
  },
  distributable: {
    url: 'https://github.com/google/snappy/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'sed -i -e \'s/ -Werror//g\' -e \'/# Disable RTTI./{N;N;d;}\' CMakeLists.txt',
      'cmake . $ARGS',
      'make install',
      'make clean',
      'cmake . -DBUILD_SHARED_LIBS=ON $ARGS',
      'make install',
    ],
    env: {
      ARGS: [
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DCMAKE_BUILD_TYPE=Release',
        '-DSNAPPY_BUILD_TESTS=OFF',
        '-DSNAPPY_BUILD_BENCHMARKS=OFF',
      ],
    },
  },
  test: {
    script: [
      'mv $FIXTURE fixture.cpp',
      'c++ fixture.cpp -lsnappy -std=c++11',
      './a.out',
    ],
  },
}
