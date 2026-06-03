import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnu.org/nettle',
  name: 'nettle',
  description: 'GNU low-level cryptographic library (used by gnutls)',
  homepage: 'https://www.lysator.liu.se/~nisse/nettle/',
  programs: ['nettle-hash', 'nettle-pbkdf2', 'sexp-conv', 'pkcs1-conv'],
  dependencies: {
    'gnu.org/gmp': '*',
  },
  buildDependencies: {
    'gnu.org/m4': '*',
  },
  versionSource: {
    type: 'url-pattern',
    url: 'https://ftp.gnu.org/gnu/nettle/nettle-{{version}}.tar.gz',
    // Track the 3.10.x line: gnutls' configure hard-requires Libnettle >= 3.10,
    // and 3.10.x keeps the ABI gnutls 3.8 builds against (nettle 4.x bumps soname).
    knownVersions: ['3.10.2', '3.10.1', '3.10.0'],
  },
  distributable: {
    url: 'https://ftp.gnu.org/gnu/nettle/nettle-{{version}}.tar.gz',
    stripComponents: 1,
  },

  build: {
    script: [
      // --disable-documentation avoids a hard texinfo/makeinfo dependency;
      // --libdir keeps libs in lib/ (not lib64/) so dependents' pkg-config and
      // rpath resolution find libnettle/libhogweed without arch-suffixed dirs.
      './configure --prefix={{prefix}} --libdir={{prefix}}/lib --enable-shared --disable-static --disable-documentation',
      'make --jobs {{hw.concurrency}}',
      'make install',
    ],
  },
}
