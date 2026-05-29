import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'gnupg.org/pinentry',
  name: 'pinentry',
  description: 'Passphrase entry dialog utilizing the Assuan protocol',
  homepage: 'https://www.gnupg.org/related_software/pinentry/',
  github: 'https://github.com/gpg/pinentry',
  programs: ['pinentry', 'pinentry-curses', 'pinentry-tty'],
  // pkgx runtime deps: libassuan + libgpg-error. libgcrypt is pulled in transitively
  // via libassuan; pin it directly so the build links cleanly. ncurses backs the
  // curses backend.
  dependencies: {
    'gnupg.org/libgpg-error': '*',
    'gnupg.org/libassuan': '*',
    'gnupg.org/libgcrypt': '*',
    'invisible-island.net/ncurses': '*',
  },
  buildDependencies: {
    'freedesktop.org/pkg-config': '*',
  },
  versionSource: {
    type: 'url-pattern',
    url: 'https://gnupg.org/ftp/gcrypt/pinentry/pinentry-{{version}}.tar.bz2',
    knownVersions: ['1.2.1', '1.3.0', '1.3.1', '1.3.2'],
  },
  distributable: {
    url: 'https://gnupg.org/ftp/gcrypt/pinentry/pinentry-{{version}}.tar.bz2',
    stripComponents: 1,
  },

  build: {
    // HEADLESS CI: enable only the curses + tty backends; disable every GUI backend
    // (gtk2/gnome3/qt/qt5/fltk/efl) since the runner has no Qt/GTK toolkits.
    script: [
      './configure --prefix={{prefix}} --disable-dependency-tracking --disable-silent-rules --enable-pinentry-curses --enable-pinentry-tty --disable-pinentry-gtk2 --disable-pinentry-gnome3 --disable-pinentry-qt --disable-pinentry-qt5 --disable-pinentry-fltk --disable-pinentry-efl --with-libgpg-error-prefix={{deps.gnupg.org/libgpg-error.prefix}} --with-libassuan-prefix={{deps.gnupg.org/libassuan.prefix}} $ARGS',
      'make --jobs {{hw.concurrency}}',
      'make install',
    ],
  },

  test: {
    script: [
      'pinentry --version | grep {{version}}',
      'pinentry-tty --version | grep {{version}}',
    ],
  },
}
