import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'khronos.org/opencl-headers',
  name: 'opencl-headers',
  programs: [],
  buildDependencies: {
    'gnu.org/make': '*',
    'cmake.org': '*',
    'python.org': '~3.11',
  },
  distributable: {
    url: 'https://github.com/KhronosGroup/OpenCL-Headers/archive/refs/tags/v{{version.raw}}.tar.gz',
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
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
      ],
    },
  },
  test: {
    script: [
      'mv $FIXTURE b.c',
      'cc b.c',
      './a.out',
    ],
  },
}
