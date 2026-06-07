import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'opensuse.org/libsolv',
  name: 'libsolv',
  programs: [],
  platforms: ['linux'],
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
        prop: {
          extname: 'h',
          content: [
            '#ifndef POOL_PARSERPMRICHDEP_H',
            '#define POOL_PARSERPMRICHDEP_H',
            '#include <solv/pool.h>',
            '#ifdef __cplusplus',
            'extern "C" {',
            '#endif',
            'extern Id pool_parserpmrichdep(Pool *pool, const char *dep);',
            '#ifdef __cplusplus',
            '}',
            '#endif',
            '#endif',
          ],
        },
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
      'printf \'#include <solv/pool.h>\\n#include <solv/repo.h>\\nint main(void){Pool *pool=pool_create();Repo *repo=repo_create(pool,"test");(void)repo;pool_free(pool);return 0;}\\n\' > fixture.c',
      'cc fixture.c -o test -lsolv',
      './test',
    ],
  },
}
