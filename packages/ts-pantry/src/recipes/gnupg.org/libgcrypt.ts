import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnupg.org/libgcrypt',
  name: 'libgcrypt',
  description: 'Cryptographic library based on the code from GnuPG',
  homepage: 'https://gnupg.org/related_software/libgcrypt/',
  github: 'https://github.com/gpg/libgcrypt',
  programs: ['libgcrypt-config', 'dumpsexp', 'hmac256', 'mpicalc'],
  // libgcrypt REQUIRES libgpg-error (pkgx: gnupg.org/libgpg-error ^1.49).
  dependencies: {
    'gnupg.org/libgpg-error': '^1.49',
  },
  buildDependencies: {
    'darwinsys.com/file': '*', // needed for configure to build dylibs
    darwin: {
      'llvm.org': '*',
    },
    linux: {
      'gnu.org/gcc': '*',
    },
  },
  versionSource: {
    type: 'url-pattern',
    url: 'https://gnupg.org/ftp/gcrypt/libgcrypt/libgcrypt-{{version}}.tar.bz2',
    knownVersions: ['1.11.0', '1.11.1', '1.11.2', '1.12.0', '1.12.1'],
  },
  distributable: {
    url: 'https://gnupg.org/ftp/gcrypt/libgcrypt/libgcrypt-{{version}}.tar.bz2',
    stripComponents: 1,
  },

  build: {
    script: [
      // Point configure at the pantry-built libgpg-error (pkgx finds it via PATH).
      './configure --prefix={{prefix}} --disable-dependency-tracking --enable-static --enable-shared --disable-asm --with-libgpg-error-prefix={{deps.gnupg.org/libgpg-error.prefix}} $ARGS',
      // pkgx: build the jitter-entropy RNG object without optimization to avoid miscompiles.
      'CFLAGS="$CFLAGS -O0" make -C random rndjent.o rndjent.lo',
      'make --jobs {{hw.concurrency}}',
      'make install',
    ],
    env: {
      darwin: {
        CC: 'clang',
        CXX: 'clang++',
        CFLAGS: '$CFLAGS -Wno-incompatible-pointer-types',
      },
      linux: {
        LDFLAGS: '-Wl,-lpthread',
      },
    },
  },

  test: {
    script: [
      'OUT=$(echo foo | hmac256 -)',
      'test "$OUT" = "9619c032ccc62b07274634a032c322580848455327d4a9aa3d323702673cf2a2"',
    ],
  },
}
