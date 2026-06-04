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
      // LMDB's Makefile ships no pkg-config file; pkgx supplied one via a $PROP
      // prop that doesn't exist in the ported recipe (so `cp $PROP …` failed on
      // an empty arg). Write a standard relocatable lmdb.pc inline instead.
      {
        run: `mkdir -p {{prefix}}/lib/pkgconfig
cat > {{prefix}}/lib/pkgconfig/lmdb.pc <<'PC'
prefix={{prefix}}
exec_prefix=\${prefix}
libdir=\${exec_prefix}/lib
includedir=\${prefix}/include

Name: lmdb
Description: Lightning Memory-Mapped Database
Version: {{version}}
Libs: -L\${libdir} -llmdb
Cflags: -I\${includedir}
PC`,
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
