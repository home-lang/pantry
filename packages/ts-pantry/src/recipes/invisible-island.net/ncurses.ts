import type { Recipe } from '../../../scripts/recipe-types'

export const recipe: Recipe = {
  domain: 'invisible-island.net/ncurses',
  name: 'ncurses',
  programs: [
    'captoinfo',
    'clear',
    'infocmp',
    'infotocap',
    'ncurses6-config',
    'ncursesw6-config',
    'reset',
    'tabs',
    'tic',
    'toe',
    'tput',
    'tset',
  ],
  distributable: {
    url: 'https://ftp.gnu.org/gnu/ncurses/ncurses-{{ version.marketing }}.tar.gz',
    stripComponents: 1,
  },
  buildDependencies: {
    'gnu.org/make': '*',
    'gnu.org/sed': '*',
    'freedesktop.org/pkg-config': '*',
    linux: { 'gnu.org/binutils': '*' },
  },
  build: {
    script: [
      'mkdir build-narrow build-wide',
      {
        run: ['../configure $ARGS --disable-widec', 'make --jobs {{hw.concurrency}}', 'make install'],
        'working-directory': 'build-narrow',
      },
      {
        run: ['../configure $ARGS --enable-widec --disable-overwrite', 'make --jobs {{hw.concurrency}}', 'make install'],
        'working-directory': 'build-wide',
      },
      "sed -i 's|{{prefix}}|${pcfiledir}/../..|g' {{prefix}}/lib/pkgconfig/*.pc",
      "sed -i 's|{{prefix}}|$(dirname \"$0\")/..|g' {{prefix}}/bin/ncurses{{version.major}}-config {{prefix}}/bin/ncursesw{{version.major}}-config",
    ],
    env: {
      PCDIR: '{{prefix}}/lib/pkgconfig',
      ARGS: [
        '--prefix={{prefix}}',
        '--enable-pc-files',
        '--enable-sigwinch',
        '--enable-overwrite',
        '--with-shared',
        '--with-cxx-shared',
        '--with-termlib',
        '--with-gpm=no',
        '--without-ada',
        '--with-pkg-config-libdir=$PCDIR',
      ],
      linux: {
        ARGS: ['--with-versioned-syms'],
        // Ncurses shares GNU version maps across its split libraries. Use the
        // declared GNU linker for that format and require resolved references.
        LDFLAGS: '${LDFLAGS:-} -B{{deps.gnu.org/binutils.prefix}}/bin -fuse-ld=bfd -Wl,--no-undefined',
      },
    },
  },
  test: {
    required: true,
    script: [
      'ncurses6-config --version | grep -E \'^{{version.major}}[.]{{version.minor}}([.][0-9]+)?$\'',
      'ncursesw6-config --version | grep -E \'^{{version.major}}[.]{{version.minor}}([.][0-9]+)?$\'',
      'pkg-config --exists ncurses ncursesw tinfo tinfow',
      'printf "#include <curses.h>\\n#if NCURSES_WIDECHAR\\n#error narrow_header_replaced_by_wide_build\\n#endif\\nint main(void) { return curses_version() == 0; }\\n" > narrow.c',
      'cc $(pkg-config --cflags ncurses) narrow.c $(pkg-config --libs ncurses) -o narrow',
      './narrow',
      'printf "#include <curses.h>\\n#if !NCURSES_WIDECHAR\\n#error wide_header_missing\\n#endif\\nint main(void) { cchar_t cell; wchar_t input[2] = { L\'X\', 0 }, output[2]; attr_t attributes; short pair; if (setcchar(&cell, input, 0, 0, 0) == ERR) return 1; if (getcchar(&cell, output, &attributes, &pair, 0) == ERR) return 2; return output[0] != L\'X\'; }\\n" > wide.c',
      'cc $(pkg-config --cflags ncursesw) wide.c $(pkg-config --libs ncursesw) -o wide',
      './wide',
      'if [ "$(uname -s)" = Linux ]; then for library in ncurses ncursesw tinfo tinfow; do readelf --dynamic "{{prefix}}/lib/lib$library.so.6" | grep -F "[lib$library.so.6]"; done; fi',
      'if [ "$(uname -s)" = Linux ]; then for library in ncurses ncursesw tinfo tinfow; do readelf --version-info "{{prefix}}/lib/lib$library.so.6" | grep -F NCURSES; done; fi',
    ],
  },
}
