import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: "invisible-island.net/ncurses",
  name: "ncurses",
  programs: [
    "captoinfo",
    "clear",
    "infocmp",
    "infotocap",
    "ncursesw6-config",
    "reset",
    "tabs",
    "tic",
    "toe",
    "tput",
    "tset",
  ],
  distributable: {
    url: "https://ftp.gnu.org/gnu/ncurses/ncurses-{{ version.raw }}.tar.gz",
    stripComponents: 1,
  },
  build: {
    script: [
      "if [ -d {{prefix}}/include ]; then\n  rm -rf {{prefix}}/include\nfi\n",
      "mkdir -p $PCDIR",
      "./configure $ARGS",
      "make --jobs {{ hw.concurrency }} install",
      {
        run: "for lib in form menu ncurses panel curses++; do\n  for ii in $(find . -name lib${lib}w\\*); do\n    # hopefully no new w's will be introduced\n    ln -sf $ii $(echo $ii | tr -d w)\n  done\ndone\n",
        'working-directory': "${{prefix}}/lib",
      },
      {
        run: "mv ncursesw/* .\nrmdir ncursesw\nln -sf . ncursesw",
        'working-directory': "${{prefix}}/include",
      },
      "sed -i 's|{{prefix}}|\\${pcfiledir}/../..|g' {{prefix}}/lib/pkgconfig/*.pc",
      "sed -i 's|{{prefix}}|\\$(dirname \"\\$0\")/..|g' {{prefix}}/bin/ncursesw{{version.major}}-config",
      {
        run: "ln -s libncurses.so libtermcap.so\nln -s libtinfo.so libtinfo.so.5\nln -s libtinfow.so libtinfo.so\nln -s libtinfow.so libtinfow.so.5",
        if: "linux",
        'working-directory': "${{prefix}}/lib",
      },
      {
        run: "ln -s ncursesw.pc ncurses.pc",
        'working-directory': "${{prefix}}/lib/pkgconfig",
      },
      {
        run: "ln -s tinfow.pc tinfo.pc",
        if: "linux",
        'working-directory': "${{prefix}}/lib/pkgconfig",
      },
    ],
    env: {
      PCDIR: "${{prefix}}/lib/pkgconfig",
      ARGS: [
        "--prefix={{ prefix }}",
        "--enable-pc-files",
        "--enable-sigwinch",
        "--enable-widec",
        "--with-shared",
        "--with-cxx-shared",
        "--with-gpm=no",
        "--without-ada",
        "--with-pkg-config-libdir=$PCDIR",
      ],
      linux: {
        ARGS: [
          "--with-termlib",
          "--enable-symlinks",
        ],
      },
    },
  },
  test: {
    script: [
      "ncursesw6-config --version | grep {{version.marketing}}",
      "ncursesw6-config --terminfo-dirs | grep '{{prefix}}'",
      "pkg-config --modversion ncursesw | grep {{version.marketing}}",
      "pkg-config --libs ncursesw | grep '{{prefix}}'",
      "test -L {{prefix}}/lib/pkgconfig/tinfo.pc",
      "pkg-config --modversion tinfo | grep {{version.marketing}}",
      "tmux -c ls",
    ],
  },
}
