import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'postgresql.org/libpq',
  name: 'libpq',
  programs: [],
  dependencies: {
    'kerberos.org': '*',
    'openssl.org': '^1.1',
    'zlib.net': '^1',
    'unicode.org': '^71',
    linux: {
      'gnu.org/readline': '*',
    },
  },
  buildDependencies: {
    linux: {
      'gnu.org/bison': '*',
      'github.com/westes/flex': '*',
    },
  },
  distributable: {
    url: 'https://ftp.postgresql.org/pub/source/v{{version.raw}}/postgresql-{{version.raw}}.tar.bz2',
    stripComponents: 1,
  },
  build: {
    script: [
      'export CFLAGS="$(echo $CFLAGS | tr \' \' \'\\n\' | sed -e \'/^-w$/d\' | tr \'\\n\' \' \')"',
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make -C src/bin install $DIRS',
      'make -C src/include install $DIRS',
      'make -C src/interfaces install $DIRS',
      'make -C src/common install $DIRS',
      'make -C src/port install $DIRS',
    ],
    env: {
      ARGS: [
        '--disable-debug',
        '--prefix={{prefix}}',
        '--with-gssapi',
        '--with-openssl',
        '--libdir={{prefix}}/lib',
        '--includedir={{prefix}}/include',
      ],
      DIRS: [
        'libdir={{prefix}}/lib',
        'includedir={{prefix}}/include',
        'pkgincludedir={{prefix}}/include/postgresql',
        'includedir_server={{prefix}}/include/postgresql/server',
        'includedir_internal={{prefix}}/include/postgresql/internal',
      ],
    },
  },
  test: {
    script: [
      'cc libpq.c -lpq -o libpqtest',
      'test "$(./libpqtest)" = \'Connection to database attempted and failed\'',
    ],
  },
}
