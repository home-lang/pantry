import type { Recipe } from '../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'midnight-commander.org',
  name: 'Midnight Commander',
  description: 'Terminal-based visual file manager',
  homepage: 'https://www.midnight-commander.org/',
  github: 'https://github.com/MidnightCommander/mc',
  programs: ['mc', 'mcdiff', 'mcedit', 'mcview'],
  // pkgx tracks MidnightCommander/mc tags, which are bare versions like 4.8.31
  versionSource: {
    type: 'github-tags',
    repo: 'MidnightCommander/mc',
    tagPattern: /^(\d.+)$/,
  },
  dependencies: {
    'invisible-island.net/ncurses': '*',
    'gnome.org/glib': '>=2.30',
    'gnu.org/gettext': '>=0.18.2',
  },
  buildDependencies: {
    'gnu.org/autoconf': '>=2.64',
    'gnu.org/automake': '>=1.12',
    'gnu.org/libtool': '*',
    'freedesktop.org/pkg-config': '~0.29',
  },
  distributable: {
    // NOTE: https://ftp.midnight-commander.org presents an SSL cert that does
    // not match the host, so we must use http:// (mirrors pkgx).
    url: 'http://ftp.midnight-commander.org/mc-{{version}}.tar.xz',
    stripComponents: 1,
  },

  build: {
    env: {
      ARGS: [
        '--prefix={{prefix}}',
        '--with-screen=ncurses',
      ],
    },
    script: [
      './configure $ARGS',
      'make -j {{hw.concurrency}}',
      'make install',

      {
        'working-directory': '{{prefix}}',
        run: [
          'fix-shebangs.ts libexec/mc/extfs.d/*',

          // Make the embedded build-prefix references relocatable.
          'for x in $(find libexec/mc -name \\*sh -type f -maxdepth 1) libexec/mc/ext.d/misc.sh; do',
          '  sed -i.bak "s|$PKGX_DIR|\\$PKGX_DIR|g" "$x"',
          '  rm "$x.bak"',
          'done',

          'sed -i.bak "s|$PKGX_DIR|%p/../|g" etc/mc/mc.ext*',
          'rm etc/mc/mc.ext*.bak',
        ],
      },
    ],
  },

  // pkgx sets MC_DATADIR at runtime to keep the binary relocatable.
  test: {
    env: {
      TERM: 'vt100',
    },
    script: [
      'mc --datadir',
    ],
  },
}
