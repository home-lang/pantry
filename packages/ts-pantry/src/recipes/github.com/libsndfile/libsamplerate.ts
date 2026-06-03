import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/libsndfile/libsamplerate',
  name: 'libsamplerate',
  programs: [],
  buildDependencies: {
    'cmake.org': '*',
    'freedesktop.org/pkg-config': '*',
  },
  distributable: {
    url: 'https://github.com/libsndfile/libsamplerate/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake -S . -B build/shared -DBUILD_SHARED_LIBS=ON $ARGS',
      'cmake --build build/shared',
      'cmake --build build/shared --target install',
      'cmake -S . -B build/static -DBUILD_SHARED_LIBS=OFF $ARGS',
      'cmake --build build/static',
      'cmake --build build/static --target install',
    ],
    env: {
      ARGS: [
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DLIBSAMPLERATE_EXAMPLES=OFF',
        '-DBUILD_TESTING=OFF',
      ],
    },
  },
  test: {
    script: [
      'mv $FIXTURE test.c',
      'cc test.c -lsamplerate -o test',
      './test',
    ],
  },
}
