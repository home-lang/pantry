import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'opensuse.org/libsolv',
  name: 'libsolv',
  programs: [],
  dependencies: {
    'zlib.net': '*',
    'tukaani.org/xz': '*',
    'sourceware.org/bzip2': '*',
    'facebook.com/zstd': '*',
    'libexpat.github.io': '*',
    'rpm.org/rpm': '*',
  },
  buildDependencies: {
    'cmake.org': '^3',
  },
  distributable: {
    url: 'https://github.com/openSUSE/libsolv/archive/refs/tags/{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: 'cp $PROP pool_parserpmrichdep.h',
        'working-directory': '.compat-headers/solv',
      },
      'cmake -S . -B build $CMAKE_ARGS',
      'cmake --build build',
      'cmake --install build',
      'install -Dm644 .compat-headers/solv/pool_parserpmrichdep.h {{prefix}}/include/solv/pool_parserpmrichdep.h',
    ],
    env: {
      CMAKE_ARGS: [
        '-DCMAKE_INSTALL_PREFIX={{prefix}}',
        '-DCMAKE_BUILD_TYPE=Release',
        '-DENABLE_STATIC=ON',
        '-DENABLE_SUSEREPO=ON',
        '-DENABLE_COMPS=ON',
        '-DENABLE_HELIXREPO=ON',
        '-DENABLE_DEBIAN=ON',
        '-DENABLE_MDKREPO=ON',
        '-DENABLE_ARCHREPO=ON',
        '-DENABLE_CUDFREPO=ON',
        '-DENABLE_CONDA=ON',
        '-DENABLE_APPDATA=ON',
        '-DMULTI_SEMANTICS=ON',
        '-DENABLE_LZMA_COMPRESSION=ON',
        '-DENABLE_BZIP2_COMPRESSION=ON',
        '-DENABLE_ZSTD_COMPRESSION=ON',
        '-DENABLE_ZCHUNK_COMPRESSION=ON',
        '-DENABLE_RPMDB=ON',
        '-DENABLE_RPMMD=ON',
        '-DENABLE_RPMPKG=ON',
      ],
    },
  },
  test: {
    script: [
      'cc $FIXTURE -o test -lsolv',
      './test',
    ],
  },
}
