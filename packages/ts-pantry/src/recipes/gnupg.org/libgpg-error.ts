import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnupg.org/libgpg-error',
  name: 'libgpg-error',
  description: 'Common error values for all GnuPG components',
  homepage: 'https://www.gnupg.org/related_software/libgpg-error/',
  github: 'https://github.com/gpg/libgpg-error',
  programs: ['gpg-error', 'gpg-error-config', 'gpgrt-config', 'yat2m'],
  versionSource: {
    type: 'url-pattern',
    url: 'https://gnupg.org/ftp/gcrypt/libgpg-error/libgpg-error-{{version}}.tar.bz2',
    knownVersions: ['1.50', '1.51', '1.55'],
  },
  distributable: {
    url: 'https://gnupg.org/ftp/gcrypt/libgpg-error/libgpg-error-{{version}}.tar.bz2',
    stripComponents: 1,
  },

  build: {
    script: [
      // pkgx: >=1.50 needs `extern char **environ;` declared for the macOS spawn path.
      {
        run: [
          'sed -i.bak -e \'/#include "gpgrt-int.h"/a\\',
          '\\',
          '#if defined (__APPLE__)\\',
          'extern char** environ;\\',
          '#endif\' \\',
          'spawn-posix.c',
          'rm -f spawn-posix.c.bak',
        ].join('\n'),
        if: '>=1.50',
        'working-directory': 'src',
      },
      './configure --prefix={{prefix}} --disable-dependency-tracking --enable-static --enable-install-gpg-error-config $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make install',
    ],
  },
}
