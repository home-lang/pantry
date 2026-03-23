import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'assimp.org',
  name: 'assimp',
  description: 'The official Open-Asset-Importer-Library Repository. Loads 40+ 3D-file-formats into one unified and clean data structure. ',
  homepage: 'https://www.assimp.org/',
  github: 'https://github.com/assimp/assimp',
  programs: ['assimp'],
  versionSource: {
    type: 'github-releases',
    repo: 'assimp/assimp',
  },
  distributable: {
    url: 'https://github.com/assimp/assimp/archive/v{{version}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'zlib.net': '*',
  },
  buildDependencies: {
    'gnu.org/make': '*',
    'cmake.org': '*',
    'ninja-build.org': '*',
  },

  build: {
    script: [
      'curl $PATCH | patch -p1 || true',
      'cmake -S . -B build -G Ninja $CMAKE_ARGS',
      'cmake --build build',
      'cmake --install build',
      'cp -a contrib {{prefix}}/include',
    ],
    env: {
      'PATCH': 'https://github.com/assimp/assimp/commit/5a89d6fee138f8bc979b508719163a74ddc9a384.patch?full_index=1',
      'CMAKE_ARGS': ['-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DCMAKE_INSTALL_LIBDIR=lib', '-DCMAKE_BUILD_TYPE=Release', '-DCMAKE_FIND_FRAMEWORK=LAST', '-DCMAKE_VERBOSE_MAKEFILE=ON', '-Wno-dev', '-DASSIMP_BUILD_TESTS=OFF', '-DASSIMP_BUILD_ASSIMP_TOOLS=ON', '-DCMAKE_INSTALL_RPATH="{{prefix}}"'],
    },
  },
}
