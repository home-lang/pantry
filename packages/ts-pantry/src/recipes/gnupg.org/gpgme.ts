import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnupg.org/gpgme',
  name: 'gpgme',
  programs: [
    'gpgme-config',
    'gpgme-json',
    'gpgme-tool',
  ],
  buildDependencies: {
    'gnupg.org': '*',
    'gnupg.org/libassuan': '^2.0.2',
    'gnupg.org/libgpg-error': '^1.11',
  },
  distributable: {
    url: 'https://gnupg.org/ftp/gcrypt/gpgme/gpgme-{{version.raw}}.tar.bz2',
    stripComponents: 1,
  },
  build: {
    script: [
      './configure $ARGS',
      'make -j {{hw.concurrency}}',
      'make install',
    ],
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--with-libassuan-prefix={{deps.gnupg.org/libassuan.prefix}}',
        '--with-libgpg-error-prefix={{deps.gnupg.org/libgpg-error.prefix}}',
        '--disable-gpg-test',
        '--disable-glibtest',
        '--disable-gpgconf-test',
        '--disable-gpg-test',
        '--disable-gpgsm-test',
        '--disable-g13-test',
      ],
      CFLAGS: '$CFLAGS -Wno-implicit-function-declaration',
      CXXFLAGS: '$CXXFLAGS -std=c++14',
      linux: {
        LDFLAGS: '$LDFLAGS -Wl,--allow-shlib-undefined',
      },
    },
  },
}
