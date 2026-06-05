import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnutls.org',
  name: 'gnutls',
  // NOTE: p11tool is omitted — it requires p11-kit, which isn't yet built in the
  // registry, so gnutls is configured --without-p11-kit (see build env below).
  programs: ['certtool', 'danetool', 'gnutls-cli', 'gnutls-cli-debug', 'gnutls-serv', 'ocsptool', 'psktool'],
  distributable: {
    url: 'https://www.gnupg.org/ftp/gcrypt/gnutls/v{{version.marketing}}/gnutls-{{version.raw}}.tar.xz',
    stripComponents: 1,
  },
  dependencies: {
    'gnu.org/libidn2': '*',
    'gnu.org/libunistring': '^1',
    'gnu.org/libtasn1': '^4',
    // gnutls' configure hard-requires Libnettle >= 3.10 (PKG_CHECK_MODULES
    // aborts with "Libnettle 3.10 was not found" otherwise). The plain `^3`
    // constraint let the resolver pick an older 3.8/3.9 nettle; pin >=3.10.
    // Cap below 4: nettle 4.0 changed the hash API (e.g. nettle_md5_digest lost
    // an argument), so gnutls 3.8.x fails to compile lib/x509 against it with
    // "too many arguments to function 'nettle_md5_digest'".
    'gnu.org/nettle': '>=3.10<4',
    'gnu.org/gettext': '*',
    'gnu.org/gmp': '*',
    'unbound.net': '^1',
    'curl.se/ca-certs': '*',
  },
  buildDependencies: {
    // gnutls' configure uses PKG_CHECK_MODULES to locate nettle/hogweed,
    // p11-kit and libtasn1 — without pkg-config on PATH configure aborts
    // early (matches the ~8s configure failure in CI). The working sibling
    // gnupg.org recipe relies on the same explicit pkg-config build dep.
    'freedesktop.org/pkg-config': '*',
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
      // --with-included-unistring: libunistring isn't published in the registry,
      // so use gnutls' bundled copy rather than chaining yet another dependency.
      // --without-p11-kit: p11-kit isn't built in the registry yet; configure
      // hard-fails ("p11-kit >= 0.23.1 was not found") unless PKCS#11 is disabled.
      'ARGS': ['--prefix={{prefix}}', '--disable-guile', '--disable-doc', '--with-included-unistring', '--without-p11-kit'],
      darwin: {
        CFLAGS: '$CFLAGS -Wno-implicit-int',
      },
    },
  },
}
