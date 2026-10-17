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
        run: ['../configure $ARGS --enable-widec', 'make --jobs {{hw.concurrency}}', 'make install'],
        'working-directory': 'build-wide',
      },
      "sed -i 's|{{prefix}}|\\${pcfiledir}/../..|g' {{prefix}}/lib/pkgconfig/*.pc",
      "sed -i 's|{{prefix}}|\\$(dirname \"\\$0\")/..|g' {{prefix}}/bin/ncurses{{version.major}}-config {{prefix}}/bin/ncursesw{{version.major}}-config",
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
    },
  },
  test: {
    required: true,
    script: [
      'ncurses6-config --version | grep -Fx "{{version.marketing}}"',
      'ncursesw6-config --version | grep -Fx "{{version.marketing}}"',
      'pkg-config --exists ncurses ncursesw tinfo tinfow',
      'if [ "$(uname -s)" = Linux ]; then for library in ncurses ncursesw tinfo tinfow; do readelf --dynamic "{{prefix}}/lib/lib$library.so.6" | grep -F "[lib$library.so.6]"; done; fi',
    ],
  },
}
