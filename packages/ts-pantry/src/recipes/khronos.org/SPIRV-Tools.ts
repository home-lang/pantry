import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'khronos.org/SPIRV-Tools',
  name: 'SPIRV-Tools',
  programs: [
    'spirv-as',
    'spirv-cfg',
    'spirv-dis',
    'spirv-lesspipe.sh',
    'spirv-link',
    'spirv-lint',
    'spirv-objdump',
    'spirv-opt',
    'spirv-reduce',
    'spirv-val',
  ],
  buildDependencies: {
    'cmake.org': '*',
    'python.org': '~3.11',
    'git-scm.org': 2,
  },
  distributable: {
    url: 'https://github.com/KhronosGroup/SPIRV-Tools/archive/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      'git clone https://github.com/KhronosGroup/SPIRV-Headers external/spirv-headers',
      'cmake -S . -B build $ARGS',
      'cmake --build build',
      'cmake --install build',
    ],
    env: {
      CPATH: [
        '$SRCROOT/include/spirv-tools',
      ],
      ARGS: [
        '-DBUILD_SHARED_LIBS=ON',
        '-DPython3_EXECUTABLE={{deps.python.org.prefix}}/bin/python',
        '-DSPIRV_SKIP_TESTSS=ON',
        '-DSPIRV_TOOLS_BUILD_STATIC=ON',
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
      'clang -o test main.cpp -std=c++11 -lSPIRV-Tools -lSPIRV-Tools-link -lSPIRV-Tools-opt $LIBS',
      './test',
    ],
  },
}
