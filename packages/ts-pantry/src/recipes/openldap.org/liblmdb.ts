import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'openldap.org/liblmdb',
  name: 'liblmdb',
  programs: [
    'mdb_copy',
    'mdb_dump',
    'mdb_load',
    'mdb_stat',
  ],
  buildDependencies: {
    darwin: {
      'gnu.org/patch': '*',
    },
  },
  distributable: {
    url: 'https://git.openldap.org/openldap/openldap/-/archive/LMDB_{{version}}/openldap-LMDB_{{version}}.tar.gz',
    stripComponents: 3,
  },
  build: {
    script: [
      {
        run: 'if test "{{hw.platform}}" = "darwin"; then patch -p1 < props/mdb-darwin-fix.patch; fi',
        if: '=0.9.34',
      },
      'sed -i -e \'s/^prefix\\t=/prefix\\t?=/\' Makefile',
      'make prefix={{prefix}} --jobs {{ hw.concurrency }} install',
      {
        run: 'cp $PROP {{prefix}}/lib/pkgconfig/lmdb.pc',
        'working-directory': '${{prefix}}/lib/pkgconfig',
      },
    ],
    env: {
      linux: {
        CC: 'clang',
        CXX: 'clang++',
        LD: 'clang',
      },
    },
  },
}
