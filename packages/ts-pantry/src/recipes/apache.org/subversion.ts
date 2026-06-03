import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'apache.org/subversion',
  name: 'subversion',
  programs: [
    'svn',
    'svnadmin',
    'svnbench',
    'svndumpfilter',
    'svnfsfs',
    'svnlook',
    'svnmucc',
    'svnrdump',
    'svnserve',
    'svnsync',
    'svnversion',
  ],
  dependencies: {
    'gnu.org/gettext': '^0.21',
    'lz4.org': '^1',
    'openssl.org': '^1.1',
    'github.com/JuliaStrings/utf8proc': '^2',
    'libexpat.github.io': '^2',
    'kerberos.org': '^1.20',
    'sqlite.org': '^3',
    'zlib.net': '^1.2',
    'apache.org/apr': '^1',
    'apache.org/apr-util': '^1',
    'apache.org/serf': '^1',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '^0.29',
    'swig.org': '^4',
    'python.org': '~3.11',
  },
  distributable: {
    url: 'https://archive.apache.org/dist/subversion/subversion-{{version}}.tar.bz2',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }}',
      'make install',
    ],
    env: {
      CFLAGS: '$CFLAGS -I{{deps.apache.org/apr-util.prefix}}/include/apr-1',
      ARGS: [
        '--prefix={{prefix}}',
        '--disable-debug',
        '--enable-optimize',
        '--disable-mod-activation',
        '--disable-plaintext-password-storage',
        '--with-apxs=no',
        '--without-apache-libexecdir',
        '--without-berkeley-db',
        '--without-gpg-agent',
        '--without-jikes',
        '--with-apr-util={{deps.apache.org/apr-util.prefix}}',
        '--with-serf={{deps.apache.org/serf.prefix}}',
      ],
    },
  },
  test: {
    script: [
      'svn --version',
      'ldd {{prefix}}/bin/svn | grep serf',
      'otool -l {{prefix}}/bin/svn | grep serf',
    ],
  },
}
