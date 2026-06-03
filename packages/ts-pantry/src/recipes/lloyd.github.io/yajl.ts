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
        // yajl's reformatter/verify CMakeLists read the deprecated target
        // LOCATION property (GET_TARGET_PROPERTY ... LOCATION), removed in
        // modern CMake; CMP0026=OLD re-permits it, and the min-version shim
        // lets its pre-3.5 cmake_minimum_required parse under CMake 4.x.
        '-DCMAKE_POLICY_VERSION_MINIMUM=3.5',
        '-DCMAKE_POLICY_DEFAULT_CMP0026=OLD',
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
