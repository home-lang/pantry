import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnutls.org',
  name: 'gnutls',
  programs: ['certtool', 'danetool', 'gnutls-cli', 'gnutls-cli-debug', 'gnutls-serv', 'ocsptool', 'p11tool', 'psktool'],
  distributable: {
    url: 'https://www.gnupg.org/ftp/gcrypt/gnutls/v{{version.marketing}}/gnutls-{{version.raw}}.tar.xz',
    stripComponents: 1,
  },
  dependencies: {
    'freedesktop.org/p11-kit': '*',
    'gnu.org/libidn2': '*',
    'gnu.org/libunistring': '^1',
    'gnu.org/libtasn1': '^4',
    'gnu.org/nettle': '^3',
    'gnu.org/gettext': '*',
    'gnu.org/gmp': '*',
    'unbound.net': '^1',
    'curl.se/ca-certs': '*',
  },
  buildDependencies: {
    linux: {
      'gnu.org/gcc': '*',
    },
  },

  build: {
    script: [
      // clang doesn't like the -march=all flag
      {
        run: 'sed -i -e \'s/-march=all/-mcpu=generic/\' Makefile.am Makefile.in',
        if: 'linux/aarch64',
        'working-directory': 'lib/accelerated/aarch64/',
      },
      './configure $ARGS',
      'make --jobs {{hw.concurrency}} install',
    ],
    env: {
      'ARGS': ['--prefix={{prefix}}', '--disable-guile', '--disable-doc'],
      darwin: {
        CFLAGS: '$CFLAGS -Wno-implicit-int',
      },
    },
  },
}
