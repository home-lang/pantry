import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnupg.org/libassuan',
  name: 'libassuan',
  description: 'Assuan IPC Library',
  homepage: 'https://www.gnupg.org/related_software/libassuan/',
  github: 'https://github.com/gpg/libassuan',
  programs: ['libassuan-config'],
  dependencies: {
    'gnupg.org/libgpg-error': '*',
  },
  versionSource: {
    type: 'url-pattern',
    url: 'https://gnupg.org/ftp/gcrypt/libassuan/libassuan-{{version}}.tar.bz2',
    knownVersions: ['2.5.7', '3.0.0', '3.0.1', '3.0.2'],
  },
  distributable: {
    url: 'https://gnupg.org/ftp/gcrypt/libassuan/libassuan-{{version}}.tar.bz2',
    stripComponents: 1,
  },

  build: {
    script: [
      './configure --prefix={{prefix}} --disable-dependency-tracking --enable-static --with-libgpg-error-prefix={{deps.gnupg.org/libgpg-error.prefix}} $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make install',
    ],
    env: {
      // otherwise it tries to link both libc++ and libstdc++, which gives
      // duplicate symbol errors.
      darwin: {
        CFLAGS: '$CFLAGS -std=gnu89',
        CXXFLAGS: '$CXXFLAGS -stdlib=libstdc++ -std=c++03',
      },
    },
  },
}
