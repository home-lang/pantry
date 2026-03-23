import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'musepack.net',
  name: 'musepack',
  description: 'Audio compression format and tools',
  homepage: 'https://www.musepack.net/',
  programs: ['mpc2sv8', 'mpcchap', 'mpccut', 'mpcdec', 'mpcenc', 'mpcgain', 'wavcmp'],
  distributable: {
    url: 'https://files.musepack.net/source/musepack_src_r{{version.major}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'musepack.net/libreplaygain': '*',
    'musepack.net/libcuefile': '*',
  },
  buildDependencies: {
    'cmake.org': '*',
  },

  build: {
    script: [
      'cmake . $CMAKE_ARGS',
      'make install',
      'mkdir -p {{prefix}}/lib',
      'cp libmpcdec/libmpcdec.* {{prefix}}/lib/',
    ],
    env: {
      'CMAKE_ARGS': ['-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DCMAKE_INSTALL_LIBDIR=lib', '-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_FIND_FRAMEWORK=LAST', '-DCMAKE_VERBOSE_MAKEFILE=ON', '-Wno-dev', '-DBUILD_TESTING=OFF', '-DCMAKE_EXE_LINKER_FLAGS=-lm -Wl,--allow-multiple-definition', '-DCMAKE_SHARED_LINKER_FLAGS=-lm -Wl,--allow-multiple-definition'],
    },
  },
}
