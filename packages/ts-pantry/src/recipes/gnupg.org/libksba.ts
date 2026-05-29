import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnupg.org/libksba',
  name: 'libksba',
  description: 'CMS and X.509 library used by GnuPG',
  homepage: 'https://www.gnupg.org/related_software/libksba/',
  github: 'https://github.com/gpg/libksba',
  // pkgx declares no `provides`; mirror that (the build installs ksba-config under bin).
  programs: [],
  dependencies: {
    'gnupg.org/libgpg-error': '*',
  },
  versionSource: {
    type: 'url-pattern',
    url: 'https://gnupg.org/ftp/gcrypt/libksba/libksba-{{version}}.tar.bz2',
    knownVersions: ['1.6.6', '1.6.7', '1.6.8'],
  },
  distributable: {
    url: 'https://gnupg.org/ftp/gcrypt/libksba/libksba-{{version}}.tar.bz2',
    stripComponents: 1,
  },

  build: {
    script: [
      './configure --prefix={{prefix}} --disable-dependency-tracking --enable-static --with-libgpg-error-prefix={{deps.gnupg.org/libgpg-error.prefix}} $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make install',
    ],
  },
}
