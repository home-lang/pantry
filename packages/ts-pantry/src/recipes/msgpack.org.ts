import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'msgpack.org',
  name: 'msgpack',
  description: 'MessagePack implementation for C and C++ / msgpack.org[C/C++]',
  github: 'https://github.com/msgpack/msgpack-c',
  programs: [],
  versionSource: {
    type: 'github-releases',
    repo: 'msgpack/msgpack-c',
    tagPattern: /\/^c-\//,
  },
  distributable: {
    url: 'https://github.com/msgpack/msgpack-c/releases/download/{{version.tag}}/msgpack-{{version.tag}}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'cmake.org': '*',
    'google.com/googletest': '*',
  },

  build: {
    script: [
      'cmake -S . -B build $ARGS',
      'cmake --build build',
      'cmake --install build',
      'cd "${{prefix}}/lib/pkgconfig/"',
      'ln -s msgpack-c.pc msgpack.pc',
    ],
    env: {
      'ARGS': ['-DMSGPACK_BUILD_TESTS=OFF', '-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DCMAKE_INSTALL_LIBDIR=lib', '-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_FIND_FRAMEWORK=LAST', '-DCMAKE_VERBOSE_MAKEFILE=ON', '-Wno-dev', '-DBUILD_TESTING=OFF'],
    },
  },
}
