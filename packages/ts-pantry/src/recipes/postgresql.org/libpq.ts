import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'postgresql.org/libpq',
  name: 'libpq',
  programs: ['pg_config'],
  publish: { include: ['bin/pg_config', 'include/**', 'lib/libpq*', 'lib64/libpq*', 'lib/libpgcommon*.a', 'lib/libpgport*.a', 'lib/pkgconfig/libpq.pc', 'lib64/pkgconfig/libpq.pc', 'share/licenses/**', 'share/doc/**', 'COPY*', 'LICENSE*'] },
  dependencies: {
    'kerberos.org': '*',
    'openssl.org': '^1.1',
    'zlib.net': '^1',
  },
  buildDependencies: {
    linux: {
      'gnu.org/bison': '*',
      'github.com/westes/flex': '*',
    },
  },
  distributable: {
    url(version) {
      // Modern PostgreSQL releases use MAJOR.MINOR upstream; the catalog
      // normalizes their patch-zero spelling. Older 9.x releases keep PATCH.
      const raw = Number(version.split('.')[0]) >= 10 && /^\d+\.\d+\.0$/.test(version) ? version.replace(/\.0$/, '') : version
      return `https://ftp.postgresql.org/pub/source/v${raw}/postgresql-${raw}.tar.bz2`
    },
    stripComponents: 1,
  },
  build: {
    script: [
      'export CFLAGS="$(echo $CFLAGS | tr \' \' \'\\n\' | sed -e \'/^-w$/d\' | tr \'\\n\' \' \')"',
      './configure $ARGS',
      'make -C src/interfaces/libpq --jobs {{ hw.concurrency }}',
      'make -C src/interfaces/libpq install $DIRS',
      'make -C src/bin/pg_config install $DIRS',
      'install -m 0644 src/include/postgres_ext.h src/include/pg_config_ext.h src/include/pg_config_manual.h {{prefix}}/include/',
      'make -C src/common install $DIRS',
      'make -C src/port install $DIRS',
      'mkdir -p {{prefix}}/share/licenses/postgresql',
      'install -m 0644 COPYRIGHT {{prefix}}/share/licenses/postgresql/COPYRIGHT',
    ],
    env: {
      ARGS: [
        '--disable-debug',
        '--prefix={{prefix}}',
        '--with-gssapi',
        '--with-openssl',
        '--without-icu',
        '--without-readline',
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
