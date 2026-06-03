import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'llvm.org/clang-format',
  name: 'clang-format',
  programs: [
    'clang-format',
    'git-clang-format',
  ],
  dependencies: {
    'gnome.org/libxml2': '*',
    'invisible-island.net/ncurses': '*',
    'python.org': '<3.12',
    'zlib.net': '*',
  },
  buildDependencies: {
    'cmake.org': '*',
    'curl.se': '*',
    'facebook.com/zstd': '*',
  },
  distributable: {
    url: 'https://github.com/llvm/llvm-project/releases/download/llvmorg-{{ version }}/llvm-project-{{ version }}.src.tar.xz',
    stripComponents: 1,
  },
  build: {
    script: [
      'mkdir -p {{prefix}}/bin {{prefix}}/share/clang',
      'cmake $CMAKE_ARGS -S llvm -B build --fresh',
      'cmake --build build --target clang-format',
      'install -p build/bin/clang-format {{prefix}}/bin/',
      'install -p clang/tools/clang-format/git-clang-format {{prefix}}/bin/',
      'install -p clang/tools/clang-format/clang-format* {{prefix}}/share/clang/',
    ],
    env: {
      RES_CLANG: 'https://github.com/llvm/llvm-project/releases/download/llvmorg-{{version}}/clang-{{version}}.src.tar.xz',
      RES_CMAKE: 'https://github.com/llvm/llvm-project/releases/download/llvmorg-{{version}}/cmake-{{version}}.src.tar.xz',
      RES_THIRD_PARTY: 'https://github.com/llvm/llvm-project/releases/download/llvmorg-{{version}}/third-party-{{version}}.src.tar.xz',
      CMAKE_ARGS: [
        '-DCMAKE_INSTALL_PREFIX="{{prefix}}',
        '-DCMAKE_INSTALL_LIBDIR=lib',
        '-DCMAKE_BUILD_TYPE=Release',
        '-DCMAKE_FIND_FRAMEWORK=LAST',
        '-DCMAKE_VERBOSE_MAKEFILE=ON',
        '-Wno-dev',
        '-DLLVM_ENABLE_PROJECTS=clang',
        '-DLLVM_INCLUDE_BENCHMARKS=OFF',
        '-DLLVM_INCLUDE_TESTS=OFF',
      ],
    },
  },
  test: {
    script: [
      'clang-format --version 2>&1 | tee out',
      'grep {{version}} out',
      'clang-format -style=Google $FIXTURE',
    ],
  },
}
