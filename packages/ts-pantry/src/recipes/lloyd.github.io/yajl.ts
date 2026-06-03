import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'lloyd.github.io/yajl',
  name: 'yajl',
  programs: [
    'json_reformat',
    'json_verify',
  ],
  buildDependencies: {
    'cmake.org': '*',
    linux: {
      'gnu.org/gcc': '*',
      'gnu.org/make': '*',
    },
  },
  distributable: {
    url: 'https://github.com/lloyd/yajl/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake . $CMAKE_ARGS',
      'make install',
      'mkdir -p {{prefix}}/include/yajl',
      'cp src/api/*.h {{prefix}}/include/yajl/',
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
      'pkg-config --modversion yajl | grep {{version}}',
      'json_verify < test.json | grep JSON is valid"',
    ],
  },
}
