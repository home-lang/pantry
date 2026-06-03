import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/aristocratos/btop',
  name: 'btop',
  programs: [
    'btop',
  ],
  dependencies: {
    linux: {
      'gnu.org/gcc/libstdcxx': 14,
    },
  },
  buildDependencies: {
    linux: {
      'gnu.org/gcc': 14,
      'llvm.org': '*',
    },
  },
  distributable: {
    url: 'https://github.com/aristocratos/btop/archive/refs/tags/{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'sed -i -e \'s/ifdef __clang__/if 1/\' -e \'1i\\#define _GNU_SOURCE\' intel_gpu_top.c',
        if: 'linux/x86-64',
        'working-directory': 'src/linux/intel_gpu_top',
      },
      'make',
      'make install PREFIX={{prefix}}',
    ],
    env: {
      linux: {
        CXX: 'g++',
        LD: 'clang++',
        CXXFLAGS: '$CXXFLAGS -ffat-lto-objects',
        LDFLAGS: '$LDFLAGS -Wl,-lstdc++,-ldl -fno-lto',
      },
    },
  },
}
