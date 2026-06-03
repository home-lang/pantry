import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'khronos.org/glslang',
  name: 'glslang',
  programs: [
    'glslang',
    'glslangValidator',
  ],
  buildDependencies: {
    'cmake.org': '*',
    'python.org': '~3.11',
  },
  distributable: {
    url: 'https://github.com/KhronosGroup/glslang/archive/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'cmake -S . -B build $ARGS',
      'cmake --build build',
      'cmake --install build',
    ],
    env: {
      ARGS: [
        '-DBUILD_EXTERNAL=OFF',
        '-DENABLE_CTEST=OFF',
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DCMAKE_INSTALL_LIBDIR={{prefix}}/lib',
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_FIND_FRAMEWORK=LAST',
        '-DCMAKE_VERBOSE_MAKEFILE=ON',
        '-Wno-dev',
        '-DBUILD_TESTING=OFF',
        '-DENABLE_OPT=OFF',
      ],
      linux: {
        ARGS: [
          '-DCMAKE_EXE_LINKER_FLAGS=-lstdc++fs',
        ],
      },
    },
  },
  test: {
    script: [
      'glslang --version | grep {{version}}',
      'glslangValidator -i test.vert test.frag',
    ],
  },
}
