import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'capnproto.org',
  name: 'capnproto',
  programs: ['capnp', 'capnpc', 'capnpc-c++', 'capnpc-capnp'],
  distributable: {
    url: 'https://capnproto.org/capnproto-c++-{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'zlib.net': '*',
  },
  buildDependencies: {
    'cmake.org': '^3',
  },

  build: {
    script: [
      'cmake -S . -B build_shared -DBUILD_SHARED_LIBS=ON $CMAKE_ARGS',
      'cmake --build build_shared',
      'cmake --install build_shared',
      'cmake -S . -B build_static -DBUILD_SHARED_LIBS=OFF $CMAKE_ARGS',
      'cmake --build build_static',
      'cp -a build_static/src/capnp/*.a build_static/src/kj/*.a {{prefix}}/lib',
    ],
    env: {
      'CMAKE_ARGS': ['-DCMAKE_CXX_STANDARD=20', '-DCMAKE_INSTALL_RPATH={{ prefix }}/lib', '-DCMAKE_INSTALL_PREFIX={{ prefix }}', '-DCMAKE_INSTALL_LIBDIR={{ prefix }}/lib', '-DCMAKE_BUILD_TYPE=Release', '-Wno-dev', '-DCMAKE_CXX_FLAGS=-fPIC', '-DCMAKE_POSITION_INDEPENDENT_CODE=ON'],
    },
  },
}
