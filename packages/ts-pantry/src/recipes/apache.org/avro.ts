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
  distributable: {
    url: 'https://github.com/apache/avro/archive/release-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    // avro is a polyglot monorepo; the C library (which provides avrocat /
    // avroappend / avromod / avropipe) lives in lang/c, not at the repo root —
    // the old `cmake -S .` failed with "does not appear to contain
    // CMakeLists.txt". Point cmake at lang/c.
    script: [
      'cmake -S lang/c -B build $CMAKE_ARGS',
      'cmake --build build',
      'cmake --install build',
    ],
    env: {
      CMAKE_ARGS: [
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
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
