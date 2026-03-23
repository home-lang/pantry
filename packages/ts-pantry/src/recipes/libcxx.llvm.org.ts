import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'libcxx.llvm.org',
  name: 'libcxx.llvm',
  description: 'The LLVM Project is a collection of modular and reusable compiler and toolchain technologies.',
  homepage: 'http://llvm.org',
  github: 'https://github.com/llvm/llvm-project',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'llvm/llvm-project',
    tagPattern: /\/^llvmorg-\//,
  },
  distributable: {
    url: 'https://github.com/llvm/llvm-project/releases/download/llvmorg-{{ version }}/llvm-project-{{ version }}.src.tar.xz',
    stripComponents: 1,
  },
  buildDependencies: {
    'cmake.org': '>=3<3.29',
    'ninja-build.org': '1',
    'python.org': '>=3<3.12',
    'llvm.org': '*',
  },

  build: {
    script: [
      'cmake ../runtimes -G Ninja $ARGS',
      'ninja cxx cxxabi unwind',
      'ninja install-cxx install-cxxabi install-unwind',
      'cd "${{prefix}}/lib"',
      'TARGET="$(find . -maxdepth 1 -type d -name \\*-unknown-linux-gnu)"',
      'if test -n "$TARGET"; then',
      '  mv "$TARGET"/* .',
      '  rmdir "$TARGET"',
      '  ln -s . "$TARGET"',
      'fi',
      '',
    ],
    env: {
      'ARGS': ['-DCMAKE_INSTALL_PREFIX="{{ prefix }}"', '-DCMAKE_BUILD_TYPE=Release', '-DLLVM_INCLUDE_DOCS=OFF', '-DLLVM_ENABLE_RUNTIMES="libcxx;libcxxabi;libunwind"', '-DLLVM_INCLUDE_TESTS=OFF', '-DLLVM_ENABLE_RTTI=ON'],
    },
  },
}
