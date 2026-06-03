import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'apache.org/avro',
  name: 'avro',
  programs: [
    'avroappend',
    'avrocat',
    'avromod',
    'avropipe',
  ],
  dependencies: {
    'digip.org/jansson': '*',
    'google.github.io/snappy': '*',
    'tukaani.org/xz': '*',
    'zlib.net': '*',
  },
  buildDependencies: {
    'gnu.org/tar': '*',
    'curl.se': '*',
    'cmake.org': '*',
    'freedesktop.org/pkg-config': '*',
    linux: {
      'gnu.org/gcc': '*',
      'gnu.org/make': '*',
    },
  },
  distributable: undefined,
  build: {
    script: [
      {
        run: 'curl -LsS https://github.com/apache/avro/archive/release-{{version}}.tar.gz | tar -xz --strip-components=1 -C ../..',
      },
      'cmake -S . -B build $CMAKE_ARGS',
      'cmake --build build',
      'cmake --install build',
    ],
    env: {
      CMAKE_ARGS: [
        '-DCMAKE_INSTALL_PREFIX="{{prefix}}',
        '-DCMAKE_INSTALL_LIBDIR=lib',
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_FIND_FRAMEWORK=LAST',
        '-DCMAKE_VERBOSE_MAKEFILE=ON',
        '-Wno-dev',
        '-DBUILD_TESTING=OFF',
      ],
    },
  },
  test: {
    script: [
      'cc quickstop.c -o test -lavro -Wno-incompatible-pointer-types',
      './test',
      'pkg-config --modversion avro-c | grep {{version}}',
    ],
  },
}
