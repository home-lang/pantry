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
      // yajl's reformatter/verify CMakeLists read the target LOCATION property
      // (removed in CMake 4.x, so CMP0026 no longer helps). It's only used to
      // stage a copy of the built binary — swap it for the modern
      // $<TARGET_FILE:..> generator expression, which ADD_CUSTOM_COMMAND
      // evaluates correctly. The real install is a separate INSTALL(TARGETS).
      'sed -i \'s/GET_TARGET_PROPERTY(binPath json_reformat LOCATION)/SET(binPath $<TARGET_FILE:json_reformat>)/\' reformatter/CMakeLists.txt',
      'sed -i \'s/GET_TARGET_PROPERTY(binPath json_verify LOCATION)/SET(binPath $<TARGET_FILE:json_verify>)/\' verify/CMakeLists.txt',
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
        // yajl's ancient cmake_minimum_required is rejected by CMake 4.x.
        '-DCMAKE_POLICY_VERSION_MINIMUM=3.5',
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
