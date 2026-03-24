import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'postgresql.org',
  name: 'postgresql',
  description: 'Mirror of the official PostgreSQL GIT repository. Note that this is just a *mirror* - we don\\',
  homepage: 'https://www.postgresql.org/',
  github: 'https://github.com/postgres/postgres',
  programs: ['clusterdb', 'createdb', 'dropdb', 'dropuser', 'ecpg', 'initdb', 'pg_archivecleanup', 'pg_basebackup', 'pg_config', 'pg_controldata', 'pg_ctl', 'pg_dump', 'pg_dumpall', 'pg_isready', 'pg_receivewal', 'pg_recvlogical', 'pg_resetwal', 'pg_restore', 'pg_rewind', 'pg_test_fsync', 'pg_test_timing', 'pg_upgrade', 'pg_waldump', 'pgbench', 'postgres', 'psql', 'reindexdb', 'vacuumdb'],
  versionSource: {
    type: 'github-releases',
    repo: 'postgres/postgres',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://github.com/postgres/postgres/archive/refs/tags/REL_{{version.major}}_{{version.minor}}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '^1.0.1',
    'gnu.org/readline': '*',
    'zlib.net': '*',
    'lz4.org': '*',
    'gnome.org/libxml2': '~2.13',
    'gnome.org/libxslt': '*',
    'unicode.org': '^73',
  },
  buildDependencies: {
    'gnu.org/bison': '*',
    'github.com/westes/flex': '^2.5.31',
    'perl.org': '*',
  },

  build: {
    script: [
      'export CFLAGS="$(echo $CFLAGS | tr \' \' \'\\n\' | sed -e \'/^-w$/d\' | tr \'\\n\' \' \')"',
      'sed -i \'s|\\([^\\t]*sgml.*\\)$|#\\1|\' GNUmakefile.in doc/src/Makefile',
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make install-world',
    ],
    env: {
      'CC': 'clang',
      'CXX': 'clang++',
      'LD': 'clang',
      'ARGS': ['--prefix={{prefix}}', '--with-ssl=openssl', '--with-lz4', '--with-libxml', '--with-libxslt'],
      'CFLAGS': '$CFLAGS -Wno-incompatible-function-pointer-types',
    },
  },
}
