import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'khronos.org/SPIRV-Cross',
  name: 'SPIRV-Cross',
  programs: [
    'spirv-cross',
  ],
  buildDependencies: {
    'cmake.org': '*',
  },
  distributable: {
    url: 'https://github.com/KhronosGroup/SPIRV-Cross/archive/{{version.tag}}.tar.gz',
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
        '-DSPIRV_CROSS_SHARED=ON',
        '-DSPIRV_CROSS_ENABLE_TESTS=OFF',
        '-DSPIRV_CROSS_STATIC=ON',
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DCMAKE_INSTALL_LIBDIR={{prefix}}/lib',
        '-DCMAKE_BUILD_TYPE=Release',
        '-Wno-dev',
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
      'glslangValidator -H -V -o test.spv test.frag',
      'spirv-cross --version 310 --es test.spv',
    ],
  },
}
