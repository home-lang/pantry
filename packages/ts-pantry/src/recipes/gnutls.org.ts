import type { RecipeDefinition } from '../../scripts/recipe-types'

export const recipe: RecipeDefinition = {
  domain: 'gnutls.org',
  name: 'gnutls',
  programs: ['certtool', 'danetool', 'gnutls-cli', 'gnutls-cli-debug', 'gnutls-serv', 'ocsptool', 'p11tool', 'psktool'],
  distributable: {
    url: 'https://www.gnupg.org/ftp/gcrypt/gnutls/v{{ version.marketing }}/gnutls-{{ version.raw }}.tar.xz',
    stripComponents: 1,
  },
  dependencies: {
    'gnu.org/libidn2': '*',
    'gnu.org/libtasn1': '^4',
    'gnu.org/gettext': '*',
    'gnu.org/gmp': '*',
    'unbound.net': '^1',
    'curl.se/ca-certs': '*',
  },

  build: {
    script: [
      'cd "lib/accelerated/aarch64/"',
      'sed -i.bak -e \'s/-march=all/-mcpu=generic/\' Makefile.am Makefile.in',
      './configure $ARGS',
      'make --jobs {{ hw.concurrency }} install',
    ],
    env: {
      'ARGS': ['--prefix={{ prefix }}', '--disable-guile', '--disable-doc', '--with-included-unistring'],
    },
  },
}
