import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'freetds.org',
  name: 'freetds',
  description: 'Libraries to talk to Microsoft SQL Server and Sybase databases',
  homepage: 'https://www.freetds.org/',
  github: 'https://github.com/FreeTDS/freetds',
  programs: ['bsqldb', 'bsqlodbc', 'datacopy', 'defncopy', 'fisql', 'freebcp', 'osql', 'tdspool', 'tsql'],
  versionSource: {
    type: 'github-releases',
    repo: 'FreeTDS/freetds',
    tagPattern: /^v(.+)$/,
  },
  distributable: {
    url: 'https://www.freetds.org/files/stable/freetds-{{ version }}.tar.gz',
    stripComponents: 1,
  },
  dependencies: {
    'openssl.org': '^1.1',
    'unixodbc.org': '*',
    'kerberos.org': '*',
    'gnu.org/readline': '*',
  },
  buildDependencies: {
    'gnu.org/autoconf': '*',
    'gnu.org/gettext': '*',
    'gnu.org/libtool': '*',
    'gnu.org/automake': '*',
    'cmake.org': '*',
  },

  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install -i',
      'cmake -S . -B build $CMAKE_ARGS',
      'cmake --build build',
      'cmake --install build',
    ],
    env: {
      'CMAKE_ARGS': ['-DCMAKE_INSTALL_PREFIX={{prefix}}', '-DCMAKE_INSTALL_SYSCONFDIR={{prefix}}/etc', '-DWITH_OPENSSL=ON', '-DENABLE_MSDBLIB=ON', '-DENABLE_KRB5=ON', '-DENABLE_ODBC_WIDE=ON'],
      'ARGS': ['--prefix="{{prefix}}"', '--mandir="{{prefix}}/man"', '--sysconfdir="{{prefix}}/etc"', '--with-unixodbc={{deps.unixodbc.org.prefix}}', '--with-openssl={{deps.openssl.org.prefix}}', '--enable-sybase-compat', '--enable-krb5', '--enable-odbc-wide'],
    },
  },
}
