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
    url: 'https://github.com/llvm/llvm-project/releases/download/llvmorg-{{version}}/openmp-{{version}}.src.tar.xz',
    stripComponents: 1,
  },
  buildDependencies: {
    'cmake.org': '*',
    'llvm.org': '*',
    'gnu.org/wget': '*',
  },

  build: {
    script: [
      'mkdir -p src',
      'find . -maxdepth 1 ! -name \'.\' ! -name \'src\' -exec mv {} ./src/ \\;',
      'mkdir -p cmake',
      'wget $CMAKE_URL && tar -xf cmake-{{version}}.src.tar.xz -C ./cmake --strip-components=1',
      'rm cmake-{{version}}.src.tar.xz',
      'cmake -S src -B build/shared $ARGS',
      'cmake --build build/shared',
      'cmake --install build/shared',
      'cmake -S src -B build/static -DLIBOMP_ENABLE_SHARED=OFF $ARGS',
      'cmake --build build/static',
      'cmake --install build/static',
      '',
    ],
    env: {
      'CMAKE_URL': 'https://github.com/llvm/llvm-project/releases/download/llvmorg-{{version}}/cmake-{{version}}.src.tar.xz',
      'ARGS': ['-DLIBOMP_INSTALL_ALIASES=OFF', '-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_VERBOSE_MAKEFILE=ON', '-Wno-dev', '-DBUILD_TESTING=OFF'],
    },
  },
}
