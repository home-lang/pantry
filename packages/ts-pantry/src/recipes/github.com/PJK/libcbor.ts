import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/PJK/libcbor',
  name: 'libcbor',
  programs: [],
  buildDependencies: {
    'cmake.org': 3,
  },
  distributable: {
    url: 'https://github.com/PJK/libcbor/archive/refs/tags/{{ version.tag }}.tar.gz',
    stripComponents: 1,
  },
  build: {
    // The source ships a Bazel `BUILD` file; on case-insensitive (macOS)
    // filesystems `mkdir build` collides with it, so use `_build`.
    'working-directory': '_build',
    script: [
      'cmake .. $ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make install',
    ],
    env: {
      ARGS: [
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DWITH_EXAMPLES=OFF',
        '-DBUILD_SHARED_LIBS=ON',
      ],
    },
  },
  test: {
    script: [
      'mv $FIXTURE test.c',
      'cc -o test test.c -lcbor',
      './test',
    ],
  },
}
