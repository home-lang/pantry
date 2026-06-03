import type { Recipe } from '../../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "gitlab.com/procps-ng/watch",
  name: "watch",
  programs: [
    "watch",
  ],
  dependencies: {
    'invisible-island.net/ncurses': ">=6.0",
  },
  buildDependencies: {
    'gnu.org/autoconf': "*",
    'gnu.org/automake': "*",
    'gnu.org/gettext': "*",
    'gnu.org/libtool': "*",
    'gnu.org/m4': "*",
    'freedesktop.org/pkg-config': "*",
  },
  distributable: {
    url: "https://gitlab.com/procps-ng/procps/-/archive/v{{ version }}/v{{ version }}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      {
        run: "cp {{deps.gnu.org/gettext.prefix}}/share/gettext/config.rpath .\nmkdir -p po\ntouch po/Makefile.in.in",
        if: ">=4.0.6",
      },
      "autoreconf -fiv",
      "./configure $ARGS",
      "make src/watch",
      "install -Dm755 src/watch \"{{ prefix }}\"/bin/watch",
    ],
    env: {
      AUTOPOINT: "true",
      ARGS: [
        "--disable-dependency-tracking",
        "--prefix={{ prefix }}",
        "--disable-nls",
        "--enable-watch8bit",
        "--disable-pidwait",
      ],
    },
  },
}
