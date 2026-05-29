import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'openmp.llvm.org',
  name: 'libomp',
  description: 'The LLVM Project is a collection of modular and reusable compiler and toolchain technologies.',
  homepage: 'https://llvm.org',
  github: 'https://github.com/llvm/llvm-project',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'llvm/llvm-project',
    tagPattern: /^llvmorg-(.+)$/,
  },
  distributable: {
    url: 'https://github.com/llvm/llvm-project/releases/download/llvmorg-{{version}}/llvm-project-{{version}}.src.tar.xz',
    stripComponents: 1,
  },
  buildDependencies: {
    'cmake.org': '*',
    linux: {
      'python.org': '~3.11',
      'perl.org': '*',
    },
  },

  build: {
    script: [
      'cmake -S openmp -B build/shared $ARGS',
      'cmake --build build/shared',
      'cmake --install build/shared',
      'cmake -S openmp -B build/static -DLIBOMP_ENABLE_SHARED=OFF $ARGS',
      'cmake --build build/static',
      'cmake --install build/static',
    ],
    env: {
      'ARGS': ['-DLIBOMP_INSTALL_ALIASES=OFF', '-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_VERBOSE_MAKEFILE=ON', '-Wno-dev', '-DBUILD_TESTING=OFF'],
      linux: {
        ARGS: ['-DLIBOMP_INSTALL_ALIASES=OFF', '-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_VERBOSE_MAKEFILE=ON', '-Wno-dev', '-DBUILD_TESTING=OFF', '-DOPENMP_ENABLE_LIBOMPTARGET=OFF'],
      },
    },
  },
}
