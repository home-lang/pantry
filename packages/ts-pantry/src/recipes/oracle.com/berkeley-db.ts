import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'oracle.com/berkeley-db',
  name: 'berkeley-db',
  programs: [
    'db_verify',
    'db_upgrade',
    'db_tuner',
    'db_replicate',
    'db_stat',
    'db_recover',
    'db_load',
    'db_log_verify',
    'db_printlog',
    'db_dump',
    'db_hotbackup',
    'db_deadlock',
    'db_checkpoint',
    'db_convert',
    'db_archive',
  ],
  dependencies: {
    'openssl.org': '^1.1.1',
  },
  distributable: {
    url: 'https://download.oracle.com/berkeley-db/db-{{version}}.tar.gz',
    stripComponents: 1,
  },
  build: {
    script: [
      '../dist/configure $ARGS',
      'make install DOCLIST=license',
      'rm -rf "{{prefix}}/docs"',
    ],
    env: {
      ARGS: [
        '--disable-debug',
        '--disable-static',
        '--prefix={{prefix}}',
        '--enable-cxx',
        '--enable-compat185',
        '--enable-sql',
        '--enable-sql_codegen',
        '--enable-dbm',
        '--enable-stl',
      ],
    },
  },
  test: {
    script: [
      'c++ fixture.cpp -ldb_cxx',
      './a.out',
      'test -f test.db',
    ],
  },
}
