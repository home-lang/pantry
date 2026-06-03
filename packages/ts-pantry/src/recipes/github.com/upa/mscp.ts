import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'github.com/upa/mscp',
  name: 'mscp',
  programs: [
    'mscp',
  ],
  dependencies: {
    'zlib.net': '^1.2.11',
    'openssl.org': '^1.1.1',
  },
  buildDependencies: {
    'gnu.org/bash': '*',
    'llvm.org': '*',
    'cmake.org': '*',
    'git-scm.org': '*',
  },
  distributable: {
    url: 'git+https://github.com/upa/mscp',
  },
  build: {
    script: [
      '#pip install libnacl',
      '#',
      '# this produce an error',
      '#',
      '# pip install abimap',
      'git submodule update --init',
      'patch -d libssh -p1 < patch/$(git --git-dir=./libssh/.git describe).patch',
      'cmake -B ${CMAKE_BUILD_PREFIX} \\',
      '      -D CMAKE_BUILD_TYPE=${CMAKE_BUILD_TYPE} \\',
      '      -D OPENSSL_ROOT_DIR={{deps.openssl.org.prefix}}',
      'cmake --build ${CMAKE_BUILD_PREFIX} --config ${CMAKE_BUILD_TYPE}',
      'cmake --install ${CMAKE_BUILD_PREFIX} --prefix ${CMAKE_INSTALL_PREFIX}',
    ],
    env: {
      CMAKE_BUILD_PREFIX: './build',
      CMAKE_INSTALL_PREFIX: '{{ prefix }}',
      CMAKE_BUILD_TYPE: 'Release',
    },
  },
}
