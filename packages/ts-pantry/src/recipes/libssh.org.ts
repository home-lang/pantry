import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'libssh.org',
  name: 'libssh',
  programs: [],
  distributable: {
    url: 'https://www.libssh.org/files/{{ version.major }}.{{ version.minor }}/libssh-{{ version }}.tar.xz',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '^1.1',
    'zlib.net': '^1',
  },
  buildDependencies: {
    'cmake.org': '^3',
  },

  build: {
    script: [
      'cmake .. $ARGS',
      'make install',
      'mv src/libssh.a {{ prefix }}/lib',
      '',
    ],
    env: {
      'ARGS': ['-DBUILD_STATIC_LIB=ON', '-DWITH_SYMBOL_VERSIONING=OFF', '-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_INSTALL_PREFIX={{prefix}}'],
    },
  },
}
